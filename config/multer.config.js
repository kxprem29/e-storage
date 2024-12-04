const multer=require('multer')
const firebaseStorage=require('multer-firebase-storage')
const firebase=require('./firebase.config')
const serviceAccount=require('../drive-ca067-firebase-adminsdk-fgl0a-c2c2a2bb90.json')

const storage=firebaseStorage({
    credentials:firebase.credential.cert(serviceAccount),
    bucketName:'drive-ca067.firebasestorage.app',
    unique:true
})


const upload= multer({
    storage:storage,
})

module.exports=upload;