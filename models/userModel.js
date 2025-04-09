const mongoose=require('mongoose')

const userSchema=mongoose.Schema({
    email:{
        type: String,
        required: [true,"Email is required"],
        trim: true,
        unique: true,
        minLength: [5,"email must have 5 charcters"],
        lowercase: true,
    },
    password:{
        type:String,
        required: [true,"Password is required"],
        trim: true,
        select:false,
    },
    verified:{
        type:Boolean,
        default:false
    },
    verificationCode:{
        type:String,
        select:false
    },
    verificationCodeValidation:{
        type:Number,
        select:false
    },
    forgotPasswordCode:{
        type:String,
        select:false
    },
    forgotPasswordCodeValidation:{
        type:Number,
        select:false
    }
},{
    timestamps:true
})

module.exports=mongoose.model("user",userSchema)