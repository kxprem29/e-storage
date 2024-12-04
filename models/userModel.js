const mongoose=require('mongoose');

const userSchema= mongoose.Schema({
    username:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minLength:[3,'username must be atleast 3 character long']
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        unique:true,
        minLength:[13,'username must be atleast 13 character long']
    },
    password:{
        type:String,
        trim:true,
        required:true,
        minLength:[5,'username must be atleast 5 character long']
    }
})

const user=mongoose.model('user',userSchema)

module.exports=user;
