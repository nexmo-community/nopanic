import auth0 from 'auth0-js'
import Vue from 'vue'

const AUTH0_DOMAIN = process.env.VUE_APP_AUTH0_DOMAIN
const CLIENT_ID = process.env.VUE_APP_AUTH0_CLIENT_ID
const URL = process.env.VUE_APP_AUTH0_APP_URL

const webAuth = new auth0.WebAuth({
  domain: AUTH0_DOMAIN,
  clientID: CLIENT_ID,
  redirectUri: `${URL}callback`,
  // we will use the api/v2/ to access the user information as payload
  audience: 'https://' + AUTH0_DOMAIN + '/api/v2/',
  responseType: 'token id_token',
  scope: 'openid profile email'
})

const auth = new Vue({
  computed: {
    token: {
      // returns the token from local storage
      get: function() {
        return localStorage.getItem('id_token')
      },
      // set the token in local storage
      set: function(id_token) {
        localStorage.setItem('id_token', id_token)
      }
    },
    accessToken: {
      // get access token from local storage
      get: function() {
        return localStorage.getItem('access_token')
      },
      // set access token in local storage
      set: function(accessToken) {
        return localStorage.setItem('access_token', accessToken)
      }
    },
    expiresAt: {
      // get expiration from local storage
      get: function() {
        return localStorage.getItem('expires_at')
      },
      // set expiration in local storage
      set: function(expiresIn) {
        let expiresAt = JSON.stringify(expiresIn * 1000 + new Date().getTime())
        localStorage.setItem('expires_at', expiresAt)
      }
    },
    user: {
      // get user from local storage
      get: function() {
        return JSON.parse(localStorage.getItem('user'))
      },
      // set user in local storage
      set: function(user) {
        localStorage.setItem('user', JSON.stringify(user))
      }
    }
  },
  methods: {
    // Starts the user login flow
    login() {
      webAuth.authorize()
    },
    logout() {
      // eslint-disable-next-line no-unused-vars
      return new Promise((resolve, reject) => {
        // cleaning variables in local storage
        localStorage.removeItem('access_token')
        localStorage.removeItem('id_token')
        localStorage.removeItem('expires_at')
        localStorage.removeItem('user')

        webAuth.logout({
          returnTo: `${URL}`,
          clientID: CLIENT_ID
        })

        resolve()
      })
    },
    isAuthenticated() {
      return new Date().getTime() < this.expiresAt
    },
    // Handles the callback request from Auth0
    handleAuthentication() {
      return new Promise((resolve, reject) => {
        webAuth.parseHash((err, authResult) => {
          if (err) {
            this.logout()
            reject(err)
          }

          if (authResult && authResult.accessToken && authResult.idToken) {
            this.expiresAt = authResult.expiresIn
            this.accessToken = authResult.accessToken
            this.token = authResult.idToken
            this.user = authResult.idTokenPayload

            resolve({
              user: this.user,
              token: this.token
            })
          }
        })
      })
    }
  }
})

export default {
  install: function(Vue) {
    Vue.prototype.$auth = auth
  }
}
