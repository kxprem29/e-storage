const {hash,compare} =require('bcryptjs')
const {createHmac}=require('crypto')
exports.doHash=(value,password)=>{
    const result=hash(value,password)
    return result;
}

exports.hashValidation=(value,hashedValue)=>{
    const result=compare(value,hashedValue)
    return result;
}

exports.hmacProcess=(value,key)=>{
    const result=createHmac('sha256',key).update(value).digest('hex')
    return result;
}