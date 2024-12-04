const express=require('express')
const userRouter=require('./routes/userRoutes')
const indexRouter=require('./routes/index.routes')
const dotenv=require('dotenv');
const connectToDB= require('./config/db')
connectToDB();
const cookieParser= require('cookie-parser')

dotenv.config({path:'.env'});
// console.log(process.env)

const app=express();

app.set('view engine','ejs')

app.use(cookieParser());
app.use(express.json())
app.use(express.urlencoded({extended:true}))



app.use('/',indexRouter)
app.use('/user', userRouter)

// last hope to catch error
process.on('uncaughtException',(err)=>{
    console.log('Uncaught exception');
    console.log(err);
})

app.listen(3000,()=>{
    console.log('app is running on port 3000');
})