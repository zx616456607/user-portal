
/**
 * Licensed Materials - Property of tenxcloud.com
 * (C) Copyright 2017 TenxCloud. All Rights Reserved.
 *
 *
 * v0.1 - 2018-11-09
 * @author YangYuBiao
 */

const common = require('./common')


exports.redirect = common.wrapHandler(function* () {
  token = this.session.loginUser.openstack.withoutProject.keystoneToken
  let openstackConfig = globalConfig.openstack.config
  this.type = "html"
  this.body = `<html>
  <body>
  </body>
  <script>
    window.onload = function() {
      let form = document.createElement("form")
      form.method="post"
      form.action="${openstackConfig.webssoURL}"
      let input = document.createElement("input")
      input.type="hidden"
      input.name="token"
      input.value = "${token}"
      form.appendChild(input)
      document.body.appendChild(form)
      form.submit()
    }
  </script>
  </html> 
  `
}, true)
