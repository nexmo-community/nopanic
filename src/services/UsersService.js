import firebase from '@/utils/firebase'

const db = firebase.firestore()

export default {
  async fetchOrCreateUser(authUser) {
    // getting the user document by the ID
    const userRef = db.collection('users').doc(authUser.sub)
    let user = null

    await userRef
      .get()
      .then(readDoc => {
        // if the user is found in the DB
        if (readDoc.exists) {
          user = readDoc.data()
        }
      })
      .catch(err => {
        throw err
      })

    if (!user) {
      // if the user doesn't exists then create it
      user = {
        displayName: authUser.name,
        email: authUser.email || '',
        phoneNumber: authUser.phone_number || '',
        isAdmin: false,
        contacts: [],
        createdAt: firebase.firestore.Timestamp.fromDate(new Date()),
        customMessage:
          'URGENT! This is an emergency, my last location is <LOCATION>'
      }

      await userRef.set(user).then(() => {
        console.log(`Document sucessfully witten.`)
      })
    }

    return user
  },
  /**
   * Store in DB the custom message to be used in SMS
   * @param {*} uid ID of the User in DB
   * @param {*} newMessage Message that we want to be used in SMS
   */
  updateCustomMessage(uid, newMessage) {
    // getting the user document by the ID
    const userRef = db.collection('users').doc(uid)

    return userRef.update({ customMessage: newMessage })
  },
  /**
   * This method takes an array of Contacts and replace the array of the object in DB
   * @param {*} uid ID of the user in DB
   * @param {*} contacts Array of contacts to replace the array in DB
   */
  updateContacts(uid, contacts) {
    // getting the user document by ID
    const userRef = db.collection('users').doc(uid)

    return userRef.update({ contacts })
  },
  /**
   * Get the lasts users created in DB
   * @returns Users[]
   */
  async fetchLastsCreatedUsers() {
    const users = []
    await db
      .collection('users')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          users.push({ ...doc.data(), id: doc.id })
        })
      })
      .catch(err => {
        throw err
      })

    return users
  }
}
