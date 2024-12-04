const Firebase=require('firebase-admin')
const serviceAccount= require('../drive-ca067-firebase-adminsdk-fgl0a-c2c2a2bb90.json')


const firebase=Firebase.initializeApp({
    credential:Firebase.credential.cert(serviceAccount),
    storageBucket:'drive-ca067.firebasestorage.app'
})

module.exports =Firebase;