const express=require('express')
const userController=require('../controllers/userController')
const upload=require('../config/multer.config')
const firebase=require('../config/firebase.config')
const fileModel=require('../models/fileModel')
const { identifier } = require('../middlewares/identification')
const user=require("../models/userModel");

const router=express.Router();

router.get('/',(req,res)=>{
    res.redirect('/user/signin')
    // res.send('user route');
})
router.get('/test',(req,res)=>{
    res.send('user test route');
})
router.get('/signup',(req,res)=>{
    res.render('signup')
})
router.post('/signup',userController.signup)
router.get('/sendCode',(req,res)=>{
    res.render('sendCode');
})
router.post('/sendCode',userController.sendVerificationCode);

router.get('/verifyCode',(req,res)=>{
    res.render('verifyCode');
})
router.post('/verifyCode',userController.verifyVerificationCode);

router.get('/signin',(req,res)=>{
    res.render('signin')
})
router.post('/signin',userController.signin)

router.get('/signin/forgot-password',(req,res)=>{
    res.render('forgotPassword')
})
router.post('/signin/forgot-password',userController.sendForgotPasswordCode)

router.get('/signin/verify-reset-password',(req, res) => {
    const { email } = req.query; 
    if (!email) {
        return res.status(400).send("Email is required to verify password reset.");
    }
    res.render('verifyReset', { email });
})    
router.post('/signin/verify-reset-password',userController.verifyForgotPasswordCode)

router.get('/change-password',(req,res)=>{
    res.render("changePassword")
})
router.post('/change-password',identifier,userController.changePassword);

router.get('/home',(req,res)=>{
    // const {user}=req.query;
    res.render("home")
})
router.get('/profile',(req,res)=>{
    res.render("userProfile")
})
router.get("/signout",(req,res)=>{
    res.render("signout")
})
router.post("/signout",identifier,userController.signout)
router.get('/upload',(req,res)=>{
    res.render('upload')
})
router.post('/upload',identifier,upload.single('file'),userController.uploadFile)

router.get('/files', identifier, userController.getUserFiles);


router.get('/files/download', identifier, userController.downloadFile);
  

router.get('/files/delete/:id', identifier, userController.deleteFile);
  
  


module.exports=router;