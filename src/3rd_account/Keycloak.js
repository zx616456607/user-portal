import KeycloakApp from 'keycloak-js'

export default class Keycloak {
  constructor(config) {
    const { url, realm, clientId } = config || window.__INITIAL_CONFIG__.keycloak
    this.client = KeycloakApp({
      url,
      realm,
      clientId,
    })

    /* this.client.onAuthSuccess = function () {
      console.log('Auth Success')
    }
    this.client.onAuthError = function (errorData) {
      console.log(`Auth Error: ${JSON.stringify(errorData)}`)
    }
    this.client.onAuthRefreshSuccess = function () {
      console.log('Auth Refresh Success')
    }
    this.client.onAuthRefreshError = function () {
      console.log('Auth Refresh Error')
      this.client.login()
    }
    this.client.onAuthLogout = function () {
      console.log('Auth Logout')
    }
    this.client.onTokenExpired = function () {
      console.log('Access token expired.')
      console.log('keycloak.authenticated', this.client.authenticated)
    } */
    this.init = this.promisify(this.client.init)
    this.loadUserInfo = this.promisify(this.client.loadUserInfo)
    this.updateToken = this.promisify(this.client.updateToken)
    this.login = this.promisify(this.client.login)
    this.logout = this.promisify(this.client.logout)
  }

  initToken = async () => {
    const authenticated = await this.init()
    console.log('authenticated', authenticated)
    if (!authenticated) {
      await this.login()
    }
    // get user info
    await this.loadUserInfo()
    // get token
    await this.updateToken()
    return this.client
  }

  promisify = (fn, receiver = this) => {
    return (...args) => {
      return new Promise((resolve, reject) => {
        fn.call(receiver, ...args).success(data => {
          resolve(data)
        }).error(error => {
          reject(error)
        })
      })
    }
  }
}
