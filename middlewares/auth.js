const jwt=require('jsonwebtoken')

function auth(req,res,next){
    const token= req.cookies.token;
    if(!token){
       return res.status(401).json({
            message:'unauthorized access'
        })
    }

    try{
       const decoded= jwt.verify(token,process.env.JWT_SECRET);
       req.user= decoded;
       return next();

    } catch(err){
        return res.status(401).json({
            message:'unauthorized access'
        })
    }
}

module.exports= auth;