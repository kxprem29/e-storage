const mongoose=require('mongoose')


const fileSchema=new mongoose.Schema({
    path:{
        type:String,
        required:[true, "path is required"]
    },
    originalName:{
       type:String,
       required:[true, 'originalName is required']
    },
    user:{
       type: mongoose.Schema.Types.ObjectId,
       ref:'users',
       required:[true,"user is required"]
    }
    
})

module.exports=mongoose.model("fileModel",fileSchema)