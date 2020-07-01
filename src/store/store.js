import Vue from 'vue'
import Vuex from 'vuex'
import firebase from '@/utils/firebase'
import { publishNotification } from '@/utils/storeHelpers.js'

// importing modules
import * as notification from '@/store/modules/notification.js'
import * as user from '@/store/modules/user.js'
import * as adminUsers from '@/store/modules/adminUsers.js'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    user,
    notification,
    adminUsers
  },
  state: {
    coordinates: {
      lat: null,
      lng: null
    },
    positionAccuracy: 0,
    isFetchingUser: false
  },
  mutations: {
    SET_LOCATION(state, coor) {
      // setting the coordinates of the position
      state.coordinates = { lat: coor.latitude, lng: coor.longitude }
      // setting the accuracy of the position
      state.positionAccuracy = coor.accuracy
    },
    SET_FETCHING_USER(state, flag) {
      state.isFetchingUser = flag
    }
  },
  actions: {
    setFetchingUser({ commit }, flag) {
      commit('SET_FETCHING_USER', flag)
    },
    getCurrentLocation({ commit, dispatch }) {
      if (navigator.geolocation) {
        // gettingt the position using the HTML5 API
        navigator.geolocation.getCurrentPosition(position => {
          commit('SET_LOCATION', position.coords)
        })
      } else {
        // display notification of lack of support
        const notification = {
          type: 'warning',
          message: 'Geolocation is not supported by this browser.'
        }
        dispatch('notification/add', notification, { root: true })
      }
    },
    sendPanicSMS({ state, dispatch }) {
      // accesing the Cloud Function
      const sendSMS = firebase.functions().httpsCallable('sendSMS')

      // get the contacts
      const contacts = state.user.contacts
      const user = state.user.user
      const customMessage = state.user.customMessage
      const coor = state.coordinates

      // add corrdinates to message
      let reg = /<LOCATION>/gi
      let message =
        `FROM: ${user.name}. ` +
        customMessage.replace(
          reg,
          `https://maps.google.com/maps?q=${coor.lat},${coor.lng}`
        )

      contacts.forEach(contact => {
        sendSMS({ message, phoneTo: contact.phone })
          .then(result => {
            console.log(`SMS Sent to ${contact.phone}`, result)
            if (result.data.success) {
              publishNotification(
                'success',
                `SMS sent to ${contact.phone}`,
                dispatch
              )
            } else {
              publishNotification(
                'error',
                `Error sending SMS to ${contact.phone}.` + result.data.message,
                dispatch
              )
            }
          })
          .catch(err => {
            console.log(`ERROR sending to ${contact.phone}:`, err)
            // publishing notification
            publishNotification(
              'error',
              `Error sending SMS to ${contact.phone}.` + err.message,
              dispatch
            )
          })
      })
    }
  }
})
