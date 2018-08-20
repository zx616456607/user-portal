/**
 * licensed materials - property of tenxcloud.com
 * (c) copyright 2017 tenxcloud. all rights reserved.
 */

/**
 * SAML 2.0 - release - 3.0
 * v0.1 - 2018-08-03
 * @author Lihaorong
 */

const zlib = require('zlib')
const xml2js = require('xml2js')
const xmlCrypto = require('xml-crypto')
const crypto = require('crypto')
const xmldom = require('xmldom')
const url = require('url')
const querystring = require('querystring')
const xmlbuilder = require('xmlbuilder')
const xmlenc = require('xml-encryption')
const xpath = xmlCrypto.xpath
const InMemoryCacheProvider = require('./inmemory-cache-provider.js').CacheProvider
const Q = require('q')

const SAML = function (options) {
  this.options = this.initialize(options)
  this.cacheProvider = this.options.cacheProvider
}

SAML.prototype.initialize = function (options) {
  if (!options) {
    options = {}
  }

  if (!options.path) {
    options.path = '/saml/consume'
  }

  if (!options.host) {
    options.host = 'localhost'
  }

  if (!options.issuer) {
    options.issuer = 'onelogin_saml'
  }

  if (options.identifierFormat === undefined) {
    options.identifierFormat = "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress"
  }

  if (options.authnContext === undefined) {
    options.authnContext = "urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport"
  }

  if (!options.acceptedClockSkewMs) {
    // default to no skew
    options.acceptedClockSkewMs = 0
  }

  if(!options.validateInResponseTo){
    options.validateInResponseTo = false
  }

  if(!options.requestIdExpirationPeriodMs){
    options.requestIdExpirationPeriodMs = 28800000  // 8 hours
  }

  if(!options.cacheProvider){
      options.cacheProvider = new InMemoryCacheProvider(
          {keyExpirationPeriodMs: options.requestIdExpirationPeriodMs })
  }

  if (!options.logoutUrl) {
    // Default to Entry Point
    options.logoutUrl = options.entryPoint || ''
  }

  // sha1, sha256, or sha512
  if (!options.signatureAlgorithm) {
    options.signatureAlgorithm = 'sha1'
  }

  return options
}

SAML.prototype.getProtocol = function (req) {
  return this.options.protocol || (req.protocol || 'http').concat('://')
}

SAML.prototype.getCallbackUrl = function (req) {
    // Post-auth destination
  if (this.options.callbackUrl) {
    return this.options.callbackUrl
  } else {
    let host
    if (req.headers) {
      host = req.headers.host
    } else {
      host = this.options.host
    }
    return this.getProtocol(req) + host + this.options.path
  }
}

SAML.prototype.generateUniqueID = function () {
  return crypto.randomBytes(10).toString('hex')
}

SAML.prototype.generateInstant = function () {
  return new Date().toISOString()
}

SAML.prototype.signRequest = function (samlMessage) {
  let signer
  let samlMessageToSign = {}
  switch(this.options.signatureAlgorithm) {
    case 'sha256':
      samlMessage.SigAlg = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
      signer = crypto.createSign('RSA-SHA256')
      break
    case 'sha512':
      samlMessage.SigAlg = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha512'
      signer = crypto.createSign('RSA-SHA512')
      break
    default:
      samlMessage.SigAlg = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'
      signer = crypto.createSign('RSA-SHA1')
      break
  }
  if (samlMessage.SAMLRequest) {
    samlMessageToSign.SAMLRequest = samlMessage.SAMLRequest
  }
  if (samlMessage.SAMLResponse) {
    samlMessageToSign.SAMLResponse = samlMessage.SAMLResponse
  }
  if (samlMessage.RelayState) {
    samlMessageToSign.RelayState = samlMessage.RelayState
  }
  if (samlMessage.SigAlg) {
    samlMessageToSign.SigAlg = samlMessage.SigAlg
  }
  signer.update(querystring.stringify(samlMessageToSign))
  samlMessage.Signature = signer.sign(this.options.privateCert, 'base64')
}

SAML.prototype.generateAuthorizeRequest = function (req, isPassive, callback) {
  let self = this
  let id = "_" + self.generateUniqueID()
  let instant = self.generateInstant()
  let forceAuthn = self.options.forceAuthn || false

  Q.fcall(function() {
    if(self.options.validateInResponseTo) {
      return Q.ninvoke(self.cacheProvider, 'save', id, instant)
    } else {
      return Q()
    }
  })
  .then(function(){
    let request = {
      'samlp:AuthnRequest': {
        '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        '@ID': id,
        '@Version': '2.0',
        '@IssueInstant': instant,
        '@ProtocolBinding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
        '@AssertionConsumerServiceURL': self.getCallbackUrl(req),
        '@Destination': self.options.entryPoint,
        'saml:Issuer' : {
          '@xmlns:saml' : 'urn:oasis:names:tc:SAML:2.0:assertion',
          '#text': self.options.issuer
        }
      }
    }

    if (isPassive)
      request['samlp:AuthnRequest']['@IsPassive'] = true

    if (forceAuthn) {
      request['samlp:AuthnRequest']['@ForceAuthn'] = true
    }

    if (self.options.identifierFormat) {
      request['samlp:AuthnRequest']['samlp:NameIDPolicy'] = {
        '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        '@Format': self.options.identifierFormat,
        '@AllowCreate': 'true'
      }
    }

    if (!self.options.disableRequestedAuthnContext) {
      request['samlp:AuthnRequest']['samlp:RequestedAuthnContext'] = {
        '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
        '@Comparison': 'exact',
        'saml:AuthnContextClassRef': {
          '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
          '#text': self.options.authnContext
        }
      }
    }

    if (self.options.attributeConsumingServiceIndex) {
      request['samlp:AuthnRequest']['@AttributeConsumingServiceIndex'] = self.options.attributeConsumingServiceIndex
    }

    if (self.options.providerName) {
      request['samlp:AuthnRequest']['@ProviderName'] = self.options.providerName
    }

    callback(null, xmlbuilder.create(request).end())
  })
  .fail(function(err){
    callback(err)
  })
  .done()
}

SAML.prototype.generateLogoutRequest = function (req) {
  let id = "_" + this.generateUniqueID()
  let instant = this.generateInstant()

  let request = {
    'samlp:LogoutRequest' : {
      '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
      '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
      '@ID': id,
      '@Version': '2.0',
      '@IssueInstant': instant,
      '@Destination': this.options.logoutUrl,
      'saml:Issuer' : {
        '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
        '#text': this.options.issuer
      },
      'saml:NameID' : {
        '@Format': req.user.nameIDFormat,
        '#text': req.user.nameID
      },
      'saml:IDPClientId' : {
        '@Format': req.user.nameIDFormat,
        '#text': req.user.IDPClientId
      }
    }
  }

  if (typeof(req.user.nameQualifier) !== 'undefined') {
    request['samlp:LogoutRequest']['saml:NameID']['@NameQualifier'] = req.user.nameQualifier
  }

  if (typeof(req.user.spNameQualifier) !== 'undefined') {
    request['samlp:LogoutRequest']['saml:NameID']['@SPNameQualifier'] = req.user.spNameQualifier
  }

  if (req.user.sessionIndex) {
    request['samlp:LogoutRequest']['saml2p:SessionIndex'] = {
      '@xmlns:saml2p': 'urn:oasis:names:tc:SAML:2.0:protocol',
      '#text': req.user.sessionIndex
    }
  }

  return xmlbuilder.create(request).end()
}

SAML.prototype.generateLogoutResponse = function (req, logoutRequest) {
  let id = "_" + this.generateUniqueID()
  let instant = this.generateInstant()

  let request = {
    'samlp:LogoutResponse' : {
      '@xmlns:samlp': 'urn:oasis:names:tc:SAML:2.0:protocol',
      '@xmlns:saml': 'urn:oasis:names:tc:SAML:2.0:assertion',
      '@ID': id,
      '@Version': '2.0',
      '@IssueInstant': instant,
      '@Destination': this.options.logoutUrl,
      '@InResponseTo': logoutRequest.ID,
      'saml:Issuer' : {
        '#text': this.options.issuer
      },
      'samlp:Status': {
        'samlp:StatusCode': {
          '@Value': 'urn:oasis:names:tc:SAML:2.0:status:Success'
        }
      }
    }
  }

  return xmlbuilder.create(request).end()
}

SAML.prototype.requestToUrl = function (request, response, operation, additionalParameters, callback) {
  let self = this
  if (self.options.skipRequestCompression)
    requestToUrlHelper(null, new Buffer(request || response, 'utf8'))
  else
    zlib.deflateRaw(request || response, requestToUrlHelper)

  function requestToUrlHelper(err, buffer) {
    if (err) {
      return callback(err)
    }

    let base64 = buffer.toString('base64')
    let target = url.parse(self.options.entryPoint, true)

    if (operation === 'logout') {
      if (self.options.logoutUrl) {
        target = url.parse(self.options.logoutUrl, true)
      }
    } else if (operation !== 'authorize') {
        return callback(new Error("Unknown operation: "+operation))
    }

    let samlMessage = request ? {
      SAMLRequest: base64
    } : {
      SAMLResponse: base64
    }
    Object.keys(additionalParameters).forEach(function(k) {
      samlMessage[k] = additionalParameters[k]
    })

    if (self.options.privateCert) {
      try {
        // sets .SigAlg and .Signature
        self.signRequest(samlMessage)
      } catch (ex) {
        return callback(ex)
      }
    }
    Object.keys(samlMessage).forEach(function(k) {
      target.query[k] = samlMessage[k]
    })

    // Delete 'search' to for pulling query string from 'query'
    // https://nodejs.org/api/url.html#url_url_format_urlobj
    delete target.search

    callback(null, url.format(target))
  }
}

SAML.prototype.getAdditionalParams = function (req, operation) {
  let additionalParams = {}

  let RelayState = req.query && req.query.RelayState || req.body && req.body.RelayState
  if (RelayState) {
    additionalParams.RelayState = RelayState
  }

  let optionsAdditionalParams = this.options.additionalParams || {}
  Object.keys(optionsAdditionalParams).forEach(function(k) {
    additionalParams[k] = optionsAdditionalParams[k]
  })

  let optionsAdditionalParamsForThisOperation = {}
  if (operation == "authorize") {
    optionsAdditionalParamsForThisOperation = this.options.additionalAuthorizeParams || {}
  }
  if (operation == "logout") {
    optionsAdditionalParamsForThisOperation = this.options.additionalLogoutParams || {}
  }

  Object.keys(optionsAdditionalParamsForThisOperation).forEach(function(k) {
    additionalParams[k] = optionsAdditionalParamsForThisOperation[k]
  })

  return additionalParams
}

SAML.prototype.getAuthorizeUrl = function (req, callback) {
  let self = this
  self.generateAuthorizeRequest(req, self.options.passive, function(err, request){
    if (err)
      return callback(err)
    let operation = 'authorize'
    self.requestToUrl(request, null, operation, self.getAdditionalParams(req, operation), callback)
  })
}

SAML.prototype.getAuthorizeForm = function (req, callback) {
  let self = this

  // The quoteattr() function is used in a context, where the result will not be evaluated by javascript
  // but must be interpreted by an XML or HTML parser, and it must absolutely avoid breaking the syntax
  // of an element attribute.
  let quoteattr = function(s, preserveCR) {
    preserveCR = preserveCR ? '&#13' : '\n'
    return ('' + s) // Forces the conversion to string.
      .replace(/&/g, '&amp') // This MUST be the 1st replacement.
      .replace(/'/g, '&apos') // The 4 other predefined entities, required.
      .replace(/"/g, '&quot')
      .replace(/</g, '&lt')
      .replace(/>/g, '&gt')
       // Add other replacements here for HTML only
       // Or for XML, only if the named entities are defined in its DTD.
      .replace(/\r\n/g, preserveCR) // Must be before the next replacement.
      .replace(/[\r\n]/g, preserveCR)
  }

  let getAuthorizeFormHelper = function(err, buffer) {
    if (err) {
      return callback(err)
    }

    let operation = 'authorize'
    let additionalParameters = self.getAdditionalParams(req, operation)
    let samlMessage = {
      SAMLRequest: buffer.toString('base64')
    }

    Object.keys(additionalParameters).forEach(function(k) {
      samlMessage[k] = additionalParameters[k] || ''
    })

    let formInputs = Object.keys(samlMessage).map(function(k) {
      return '<input type="hidden" name="' + k + '" value="' + quoteattr(samlMessage[k]) + '" />'
    }).join('\r\n')

    callback(null, [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8">',
      '<meta http-equiv="x-ua-compatible" content="ie=edge">',
      '</head>',
      '<body onload="document.forms[0].submit()">',
      '<noscript>',
      '<p><strong>Note:</strong> Since your browser does not support JavaScript, you must press the button below once to proceed.</p>',
      '</noscript>',
      '<form method="post" action="' + encodeURI(self.options.entryPoint) + '">',
      formInputs,
      '<input type="submit" value="Submit" />',
      '</form>',
      '<script>document.forms[0].style.display="none"</script>', // Hide the form if JavaScript is enabled
      '</body>',
      '</html>'
    ].join('\r\n'))
  }

  self.generateAuthorizeRequest(req, self.options.passive, function(err, request) {
    if (err) {
      return callback(err)
    }

    if (self.options.skipRequestCompression) {
      getAuthorizeFormHelper(null, new Buffer(request, 'utf8'))
    } else {
      zlib.deflateRaw(request, getAuthorizeFormHelper)
    }
  })

}

SAML.prototype.getLogoutUrl = function(req, callback) {
  let request = this.generateLogoutRequest(req)
  let operation = 'logout'
  this.requestToUrl(request, null, operation, this.getAdditionalParams(req, operation), callback)
}

SAML.prototype.getLogoutResponseUrl = function(req, callback) {
  let response = this.generateLogoutResponse(req, req.samlLogoutRequest)
  let operation = 'logout'
  this.requestToUrl(null, response, operation, this.getAdditionalParams(req, operation), callback)
}

SAML.prototype.getLogoutResponseBody = function(samlLogoutRequest) {
  let self = this
  let response = self.generateLogoutResponse(null, samlLogoutRequest)
  const samlMessage = {
    SAMLResponse: (new Buffer(response, 'utf8')).toString('base64')
  }
  self.signRequest(samlMessage)
  return samlMessage
}

SAML.prototype.certToPEM = function (cert) {
  cert = cert.match(/.{1,64}/g).join('\n')

  if (cert.indexOf('-BEGIN CERTIFICATE-') === -1)
    cert = "-----BEGIN CERTIFICATE-----\n" + cert
  if (cert.indexOf('-END CERTIFICATE-') === -1)
    cert = cert + "\n-----END CERTIFICATE-----\n"

  return cert
}

SAML.prototype.certsToCheck = function () {
  let self = this
  if (!self.options.cert) {
    return Q()
  }
  if (typeof(self.options.cert) === 'function') {
    return Q.nfcall(self.options.cert)
    .then(function(certs) {
      if (!Array.isArray(certs)) {
        certs = [certs]
      }
      return Q(certs)
    })
  }
  let certs = self.options.cert
  if (!Array.isArray(certs)) {
    certs = [certs]
  }
  return Q(certs)
}

// This function checks that the |currentNode| in the |fullXml| document contains exactly 1 valid
//   signature of the |currentNode|.
//
// See https://github.com/bergie/passport-saml/issues/19 for references to some of the attack
//   vectors against SAML signature verification.
SAML.prototype.validateSignature = function (fullXml, currentNode, certs) {
  let self = this
  let xpathSigQuery = ".//*[local-name(.)='Signature' and " +
                      "namespace-uri(.)='http://www.w3.org/2000/09/xmldsig#']"
  let signatures = xpath(currentNode, xpathSigQuery)
  // This function is expecting to validate exactly one signature, so if we find more or fewer
  //   than that, reject.
  if (signatures.length != 1)
    return false
  let signature = signatures[0]
  return certs.some(function (certToCheck) {
    return self.validateSignatureForCert(signature, certToCheck, fullXml, currentNode)
  })
}

// This function checks that the |signature| is signed with a given |cert|.
SAML.prototype.validateSignatureForCert = function (signature, cert, fullXml, currentNode) {
  let self = this
  let sig = new xmlCrypto.SignedXml()
  sig.keyInfoProvider = {
    getKeyInfo: function (key) {
      return "<X509Data></X509Data>"
    },
    getKey: function (keyInfo) {
      return self.certToPEM(cert)
    }
  }
  sig.loadSignature(signature)
  // We expect each signature to contain exactly one reference to the top level of the xml we
  //   are validating, so if we see anything else, reject.
  if (sig.references.length != 1 )
    return false
  let refUri = sig.references[0].uri
  let refId = (refUri[0] === '#') ? refUri.substring(1) : refUri
  // If we can't find the reference at the top level, reject
  let idAttribute = currentNode.getAttribute('ID') ? 'ID' : 'Id'
  if (currentNode.getAttribute(idAttribute) != refId)
    return false
  // If we find any extra referenced nodes, reject.  (xml-crypto only verifies one digest, so
  //   multiple candidate references is bad news)
  let totalReferencedNodes = xpath(currentNode.ownerDocument,
                                  "//*[@" + idAttribute + "='" + refId + "']")
  if (totalReferencedNodes.length > 1)
    return false
  return sig.checkSignature(fullXml)
}

SAML.prototype.validatePostResponse = function (container, callback) {
  let self = this

  let xml, doc, inResponseTo

  Q.fcall(function(){
    xml = new Buffer(container.SAMLResponse, 'base64').toString('utf8')
    doc = new xmldom.DOMParser({
    }).parseFromString(xml)

    if (!doc.hasOwnProperty('documentElement'))
      throw new Error('SAMLResponse is not valid base64-encoded XML')

    inResponseTo = xpath(doc, "/*[local-name()='Response']/@InResponseTo")

    if(inResponseTo){
      inResponseTo = inResponseTo.length ? inResponseTo[0].nodeValue : null
    }

    if(self.options.validateInResponseTo){
      if (inResponseTo) {
        return Q.ninvoke(self.cacheProvider, 'get', inResponseTo)
          .then(function(result) {
            if (!result)
              throw new Error('InResponseTo is not valid')
            return Q()
          })
      }
    } else {
      return Q()
    }
  })
  .then(function() {
    return self.certsToCheck()
  })
  .then(function(certs) {
    // Check if this document has a valid top-level signature
    let validSignature = false
    if (self.options.cert && self.validateSignature(xml, doc.documentElement, certs)) {
      validSignature = true
    }

    let assertions = xpath(doc, "/*[local-name()='Response']/*[local-name()='Assertion']")
    let encryptedAssertions = xpath(doc,
      "/*[local-name()='Response']/*[local-name()='EncryptedAssertion']")

    if (assertions.length + encryptedAssertions.length > 1) {
      // There's no reason I know of that we want to handle multiple assertions, and it seems like a
      //   potential risk vector for signature scope issues, so treat this as an invalid signature
      throw new Error('Invalid signature')
    }

    if (assertions.length == 1) {
      if (self.options.cert &&
          !validSignature &&
          !self.validateSignature(xml, assertions[0], certs)) {
        throw new Error('Invalid signature')
      }
      return self.processValidlySignedAssertion(assertions[0].toString(), inResponseTo, callback)
    }

    if (encryptedAssertions.length == 1) {
      if (!self.options.decryptionPvk)
        throw new Error('No decryption key for encrypted SAML response')

      let encryptedAssertionXml = encryptedAssertions[0].toString()

      let xmlencOptions = { key: self.options.decryptionPvk }
      return Q.ninvoke(xmlenc, 'decrypt', encryptedAssertionXml, xmlencOptions)
        .then(function(decryptedXml) {
          let decryptedDoc = new xmldom.DOMParser().parseFromString(decryptedXml)
          let decryptedAssertions = xpath(decryptedDoc, "/*[local-name()='Assertion']")
          if (decryptedAssertions.length != 1)
            throw new Error('Invalid EncryptedAssertion content')

          if (self.options.cert &&
              !validSignature &&
              !self.validateSignature(decryptedXml, decryptedAssertions[0], certs))
            throw new Error('Invalid signature')

          self.processValidlySignedAssertion(decryptedAssertions[0].toString(), inResponseTo, callback)
        })
    }

    // If there's no assertion, fall back on xml2js response parsing for the status &
    //   LogoutResponse code.

    let parserConfig = {
      explicitRoot: true,
      explicitCharkey: true,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    }
    let parser = new xml2js.Parser(parserConfig)
    return Q.ninvoke( parser, 'parseString', xml)
      .then(function(doc) {
        let response = doc.Response
        if (response) {
          let assertion = response.Assertion
          if (!assertion) {
            let status = response.Status
            if (status) {
              let statusCode = status[0].StatusCode
              if (statusCode && statusCode[0].$.Value === "urn:oasis:names:tc:SAML:2.0:status:Responder") {
                let nestedStatusCode = statusCode[0].StatusCode
                if (nestedStatusCode && nestedStatusCode[0].$.Value === "urn:oasis:names:tc:SAML:2.0:status:NoPassive") {
                  if (self.options.cert && !validSignature) {
                    throw new Error('Invalid signature')
                  }
                  return callback(null, null, false)
                }
              }

              // Note that we're not requiring a valid signature before this logic -- since we are
              //   throwing an error in any case, and some providers don't sign error results,
              //   let's go ahead and give the potentially more helpful error.
              if (statusCode && statusCode[0].$.Value) {
                let msgType = statusCode[0].$.Value.match(/[^:]*$/)[0]
                if (msgType != 'Success') {
                  let msg = 'unspecified'
                  if (status[0].StatusMessage) {
                    msg = status[0].StatusMessage[0]._
                  } else if (statusCode[0].StatusCode) {
                    msg = statusCode[0].StatusCode[0].$.Value.match(/[^:]*$/)[0]
                  }
                  let error = new Error('SAML provider returned ' + msgType + ' error: ' + msg)
                  let builderOpts = {
                    rootName: 'Status',
                    headless: true
                  }
                  error.statusXml = new xml2js.Builder(builderOpts).buildObject(status[0])
                  throw error
                }
              }
            }
            throw new Error('Missing SAML assertion')
          }
        } else {
          if (self.options.cert && !validSignature) {
            throw new Error('Invalid signature')
          }
          let logoutResponse = doc.LogoutResponse
          if (logoutResponse){
            return callback(null, null, true)
          } else {
            throw new Error('Unknown SAML response message')
          }
        }
      })
  })
  .fail(function(err) {
    callback(err)
  })
  .done()
}

SAML.prototype.processValidlySignedAssertion = function(xml, inResponseTo, callback) {
  let self = this
  let msg
  let parserConfig = {
    explicitRoot: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  }
  let nowMs = new Date().getTime()
  let profile = {}
  let assertion
  let parser = new xml2js.Parser(parserConfig)
  Q.ninvoke(parser, 'parseString', xml)
  .then(function(doc) {
    assertion = doc.Assertion

    let issuer = assertion.Issuer
    if (issuer) {
      profile.issuer = issuer[0]
    }

    let authnStatement = assertion.AuthnStatement
    if (authnStatement) {
      if (authnStatement[0].$ && authnStatement[0].$.SessionIndex) {
        profile.sessionIndex = authnStatement[0].$.SessionIndex
      }
    }

    let subject = assertion.Subject
    let subjectConfirmation, confirmData
    if (subject) {
      let nameID = subject[0].NameID
      if (nameID) {
        profile.nameID = nameID[0]._ || nameID[0]

        if (nameID[0].$ && nameID[0].$.Format) {
          profile.nameIDFormat = nameID[0].$.Format
          profile.nameQualifier = nameID[0].$.NameQualifier
          profile.spNameQualifier = nameID[0].$.SPNameQualifier
        }
      }

      subjectConfirmation = subject[0].SubjectConfirmation ?
                            subject[0].SubjectConfirmation[0] : null
      confirmData = subjectConfirmation && subjectConfirmation.SubjectConfirmationData ?
                    subjectConfirmation.SubjectConfirmationData[0] : null
      if (subject[0].SubjectConfirmation && subject[0].SubjectConfirmation.length > 1) {
        msg = 'Unable to process multiple SubjectConfirmations in SAML assertion'
        throw new Error(msg)
      }

      if (subjectConfirmation) {
        if (confirmData && confirmData.$) {
          let subjectNotBefore = confirmData.$.NotBefore
          let subjectNotOnOrAfter = confirmData.$.NotOnOrAfter

          let subjErr = self.checkTimestampsValidityError(
                          nowMs, subjectNotBefore, subjectNotOnOrAfter)
          if (subjErr) {
            throw subjErr
          }
        }
      }
    }

    // Test to see that if we have a SubjectConfirmation InResponseTo that it matches
    // the 'InResponseTo' attribute set in the Response
    if (self.options.validateInResponseTo) {
      if (subjectConfirmation) {
        if (confirmData && confirmData.$) {
          let subjectInResponseTo = confirmData.$.InResponseTo
          if (inResponseTo && subjectInResponseTo && subjectInResponseTo != inResponseTo) {
            return Q.ninvoke(self.cacheProvider, 'remove', inResponseTo)
              .then(function(){
                throw new Error('InResponseTo is not valid')
              })
          } else if (subjectInResponseTo) {
            let foundValidInResponseTo = false
            return Q.ninvoke(self.cacheProvider, 'get', subjectInResponseTo)
              .then(function(result){
                if (result) {
                  let createdAt = new Date(result)
                  if (nowMs < createdAt.getTime() + self.options.requestIdExpirationPeriodMs)
                    foundValidInResponseTo = true
                }
                return Q.ninvoke(self.cacheProvider, 'remove', inResponseTo )
              })
              .then(function(){
                if (!foundValidInResponseTo) {
                  throw new Error('InResponseTo is not valid')
                }
                return Q()
              })
          }
        }
      } else {
        return Q.ninvoke(self.cacheProvider, 'remove', inResponseTo)
      }
    } else {
      return Q()
    }
  })
  .then(function(){
    let conditions = assertion.Conditions ? assertion.Conditions[0] : null
    if (assertion.Conditions && assertion.Conditions.length > 1) {
      msg = 'Unable to process multiple conditions in SAML assertion'
      throw new Error(msg)
    }
    if(conditions && conditions.$) {
      let conErr = self.checkTimestampsValidityError(
                    nowMs, conditions.$.NotBefore, conditions.$.NotOnOrAfter)
      if(conErr)
        throw conErr
    }

    if (self.options.audience) {
      let audienceErr = self.checkAudienceValidityError(
                    self.options.audience, conditions.AudienceRestriction)
      if(audienceErr)
        throw audienceErr
    }

    let attributeStatement = assertion.AttributeStatement
    if (attributeStatement) {
      let attributes = [].concat.apply([], attributeStatement.filter(function (attr) {
        return Array.isArray(attr.Attribute)
      }).map(function (attr) {
        return attr.Attribute
      }))

      let attrValueMapper = function(value) {
        return typeof value === 'string' ? value : value._
      }

      if (attributes) {
        attributes.forEach(function (attribute) {
         if(!attribute.hasOwnProperty('AttributeValue')) {
            // if attributes has no AttributeValue child, continue
            return
          }
          let value = attribute.AttributeValue
          if (value.length === 1) {
            profile[attribute.$.Name] = attrValueMapper(value[0])
          } else {
            profile[attribute.$.Name] = value.map(attrValueMapper)
          }
        })
      }
    }

    if (!profile.mail && profile['urn:oid:0.9.2342.19200300.100.1.3']) {
      // See http://www.incommonfederation.org/attributesummary.html for definition of attribute OIDs
      profile.mail = profile['urn:oid:0.9.2342.19200300.100.1.3']
    }

    if (!profile.email && profile.mail) {
      profile.email = profile.mail
    }

    profile.getAssertionXml = function() { return xml }

    callback(null, profile, false)
  })
  .fail(function(err) {
    callback(err)
  })
  .done()
}

SAML.prototype.checkTimestampsValidityError = function(nowMs, notBefore, notOnOrAfter) {
  let self = this
  if (self.options.acceptedClockSkewMs == -1)
      return null

  if (notBefore) {
    let notBeforeMs = Date.parse(notBefore)
    if (nowMs + self.options.acceptedClockSkewMs < notBeforeMs)
        return new Error('SAML assertion not yet valid')
  }
  if (notOnOrAfter) {
    let notOnOrAfterMs = Date.parse(notOnOrAfter)
    if (nowMs - self.options.acceptedClockSkewMs >= notOnOrAfterMs)
      return new Error('SAML assertion expired')
  }

  return null
}

SAML.prototype.checkAudienceValidityError = function(expectedAudience, audienceRestrictions) {
  let self = this
  if (!audienceRestrictions || audienceRestrictions.length < 1) {
    return new Error('SAML assertion has no AudienceRestriction')
  }
  let errors = audienceRestrictions.map(function(restriction) {
    if (!restriction.Audience || !restriction.Audience[0]) {
      return new Error('SAML assertion AudienceRestriction has no Audience value')
    }
    if (restriction.Audience[0] !== expectedAudience) {
      return new Error('SAML assertion audience mismatch')
    }
    return null
  }).filter(function(result) {
    return result !== null
  })
  if (errors.length > 0) {
    return errors[0]
  }
  return null
}

SAML.prototype.validatePostRequest = function (container, callback) {
  let self = this
  let xml = new Buffer(container.SAMLRequest, 'base64').toString('utf8')
  let dom = new xmldom.DOMParser().parseFromString(xml)
  let parserConfig = {
    explicitRoot: true,
    tagNameProcessors: [xml2js.processors.stripPrefix]
  }
  let parser = new xml2js.Parser(parserConfig)
  parser.parseString(xml, function (err, doc) {
    if (err) {
      return callback(err)
    }

    self.certsToCheck()
    .then(function(certs) {
      // Check if this document has a valid top-level signature
      if (self.options.cert && !self.validateSignature(xml, dom.documentElement, certs)) {
        return callback(new Error('Invalid signature'))
      }

      processValidlySignedPostRequest(self, doc, callback)
    })
    .fail(function(err) {
      callback(err)
    })
  })
}

function processValidlySignedPostRequest(self, doc, callback) {
    let request = doc.LogoutRequest
    if (request) {
      let profile = {}
      if (request.$.ID) {
          profile.ID = request.$.ID
      } else {
        return callback(new Error('Missing SAML LogoutRequest ID'))
      }
      let issuer = request.Issuer
      if (issuer) {
        profile.issuer = issuer[0]
      } else {
        return callback(new Error('Missing SAML issuer'))
      }

      let nameID = request.NameID
      if (nameID) {
        profile.nameID = nameID[0]._ || nameID[0]

        if (nameID[0].$ && nameID[0].$.Format) {
          profile.nameIDFormat = nameID[0].$.Format
        }
      } else {
        return callback(new Error('Missing SAML NameID'))
      }
      let sessionIndex = request.SessionIndex
      if (sessionIndex) {
        profile.sessionIndex = sessionIndex[0]
      }

      // 对比用户 session 上的 IDPClientId, 可判断对应用户
      let IDPClientId = request.IDPClientId
      if (IDPClientId) {
        profile.IDPClientId = IDPClientId[0]
      }

      callback(null, profile, true)
    } else {
      return callback(new Error('Unknown SAML request message'))
    }
}

SAML.prototype.generateServiceProviderMetadata = function( decryptionCert ) {
  let metadata = {
    'EntityDescriptor' : {
      '@xmlns': 'urn:oasis:names:tc:SAML:2.0:metadata',
      '@xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
      '@entityID': this.options.issuer,
      '@ID': this.options.issuer.replace(/\W/g, '_'),
      'SPSSODescriptor' : {
        '@protocolSupportEnumeration': 'urn:oasis:names:tc:SAML:2.0:protocol',
      },
    }
  }

  if (this.options.decryptionPvk) {
    if (!decryptionCert) {
      throw new Error(
        "Missing decryptionCert while generating metadata for decrypting service provider")
    }

    decryptionCert = decryptionCert.replace( /-+BEGIN CERTIFICATE-+\r?\n?/, '' )
    decryptionCert = decryptionCert.replace( /-+END CERTIFICATE-+\r?\n?/, '' )
    decryptionCert = decryptionCert.replace( /\r\n/g, '\n' )

    metadata.EntityDescriptor.SPSSODescriptor.KeyDescriptor = {
      'ds:KeyInfo' : {
        'ds:X509Data' : {
          'ds:X509Certificate': {
            '#text': decryptionCert
          }
        }
      },
      'EncryptionMethod' : [
        // this should be the set that the xmlenc library supports
        { '@Algorithm': 'http://www.w3.org/2001/04/xmlenc#aes256-cbc' },
        { '@Algorithm': 'http://www.w3.org/2001/04/xmlenc#aes128-cbc' },
        { '@Algorithm': 'http://www.w3.org/2001/04/xmlenc#tripledes-cbc' }
      ]
    }
  }

  if (this.options.logoutCallbackUrl) {
    metadata.EntityDescriptor.SPSSODescriptor.SingleLogoutService = {
      '@Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      '@Location': this.options.logoutCallbackUrl
    }
  }

  metadata.EntityDescriptor.SPSSODescriptor.NameIDFormat = this.options.identifierFormat
  metadata.EntityDescriptor.SPSSODescriptor.AssertionConsumerService = {
    '@index': '1',
    '@isDefault': 'true',
    '@Binding': 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
    '@Location': this.getCallbackUrl({})
  }

  return xmlbuilder.create(metadata).end({ pretty: true, indent: '  ', newline: '\n' })
}

exports.SAML = SAML
