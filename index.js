const express=require('express');
const helmet=require('helmet')
const cors=require('cors')
const cookieParser=require('cookie-parser')
const mongoose=require('mongoose')
const userRouter=require('./routes/userRouter')

const app=express();

app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}));

app.set('view engine','ejs')

mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("db connected");
}).catch((err)=>{
    console.log(err);
})

app.use('/user', userRouter)

app.get('/',(req,res)=>{
    res.redirect('/user')
})

app.listen(process.env.PORT,()=>{
    console.log("server is running");
})
