const {signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema,acceptFPCodeSchema}=require('../middlewares/validator')
const user=require("../models/userModel");
const {doHash, hashValidation, hmacProcess}=require("../utils/hashing")
const jwt=require('jsonwebtoken')
const transport=require('../middlewares/sendMail')
const  fileModel =require('../models/fileModel')
const firebase=require('../config/firebase.config')
// const fileModel=require('../models/fileModel')

exports.signup = async (req, res) => {
	const { email, password, username } = req.body;
	try {
		const { error, value } = signupSchema.validate({ email, password });

		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}
		const existingUser = await user.findOne({ email });

		if (existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User already exists!' });
		}

		const hashedPassword = await doHash(password, 12);

		const newUser = new user({
			email,
			password: hashedPassword,
			username
		});
		const result = await newUser.save();
		result.password = undefined;
		res.status(201).json({
			success: true,
			message: 'Your account has been created successfully',
			result,
		});
	} catch (error) {
		console.log(error);
	}
};

exports.signin=async (req,res)=>{
    const {email,password}=req.body;
    try {
       const {error,value}=signinSchema.validate({email,password})
       if(error){
            return res
            .status(401)
            .json({ success: false, message: error.details[0].message });
       }
       const existingUser=await user.findOne({email}).select('+password')
       if(!existingUser){
        return res
        .status(401)
        .json({ success: false, message: 'User does not exists!' });
       }
       const result=await hashValidation(password,existingUser.password)
       if(!result){
          return res.status(401).json({success:false,message:"invalid credentials"})
       }
       const token=jwt.sign({
        userId:existingUser._id,
        email:existingUser.email,
        verified: existingUser.verified
       },process.env.TOKEN_SECRET,{
        expiresIn:'8h'
       })

	//    console.log("generated token",token);
	   const formattedToken = 'Bearer ' + token.trim();
    //    console.log("Formatted Token:", formattedToken);

       res.cookie('Authorization', formattedToken, {
		expires: new Date(Date.now() + 8 * 3600000),
		httpOnly: process.env.NODE_ENV === 'production',
		secure: process.env.NODE_ENV === 'production',
	   });
	
	
    //    .json({
    //         success: true,
    //         token,
    //         message: 'logged in successfully',
    //     });
	// return res.json({ success: true, message: "Logged in successfully", redirect: "/home" });
	return res.redirect('/user/home');

    } catch (error) {
        console.log(error);
    }
}


exports.signout= async(req,res)=>{
    // res.clearCookie('Authorization').status(200).json({
    //     success:true,
    //     message:"logged out successfully"
    // })
	// return res.redirect('/user')
	res.clearCookie('Authorization');

    // If the request is an API call (expects JSON response)
    if (req.xhr || req.headers.accept.includes('json')) {
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }

    // Otherwise, redirect to login page (for normal browser navigation)
    return res.redirect('/user/signin');
}

exports.sendVerificationCode= async (req,res)=>{
    const {email}=req.body;
    try {
        const existingUser=await user.findOne({email})
        if(!existingUser){
            return res
            .status(404)
            .json({ success: false, message: 'User does not exists!' });
        }
        if(existingUser.verified){
            return res.status(400)
            .json({
                success:false, message:"you are already verified"
            })
        }
        const codeValue=Math.floor(Math.random()*1000000).toString();
        console.log(existingUser.email);
        let info=await transport.sendMail({
            from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: existingUser.email,
            subject:"Verification COde",
            html:'<h1>'+codeValue+'</h1>'
        })
        if(info.accepted[0]===existingUser.email){
             const hashedCodeValue=hmacProcess(codeValue,process.env.HMAC_SECRET)
             existingUser.verificationCode=hashedCodeValue;
             existingUser.verificationCodeValidation=Date.now()
             await existingUser.save()

             return res.status(200).json({success:true, message:"code sent"})
        }
        res.status(400).json({success:false, message:"code not sent"})
    } catch (error) {
        console.log(error);
    }
}


exports.verifyVerificationCode = async (req, res) => {
	const { email, providedCode } = req.body;
	try {
		const { error, value } = acceptCodeSchema.validate({ email, providedCode });
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await user.findOne({ email }).select(
			'+verificationCode +verificationCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}
		if (existingUser.verified) {
			return res
				.status(400)
				.json({ success: false, message: 'you are already verified!' });
		}

		if (
			!existingUser.verificationCode ||
			!existingUser.verificationCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (Date.now() - existingUser.verificationCodeValidation > 5 * 60 * 1000) {
			return res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_SECRET
		);

		if (hashedCodeValue === existingUser.verificationCode) {
			existingUser.verified = true;
			existingUser.verificationCode = undefined;
			existingUser.verificationCodeValidation = undefined;
			await existingUser.save();
			return res
				.status(200)
				.json({ success: true, message: 'your account has been verified!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};

exports.changePassword= async(req,res)=>{
	// console.log(req.user);
	if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: "Unauthorized access!" });
    }

    const userId = req.user._id.toString(); // Ensure it's a string
    console.log("Extracted User ID:", userId);
    // const {userId,verified}=req.user;
    const {oldPassword, newPassword}=req.body;
    try {
        const {error, value}=changePasswordSchema.validate({oldPassword,newPassword})
        if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}
		// if (!verified) {
		// 	return res
		// 		.status(401)
		// 		.json({ success: false, message: 'You are not verified user!' });
		// }
        const existingUser=await user.findOne({_id:userId}).select(
            '+password'
        )
        if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}
        const result =await hashValidation(oldPassword,existingUser.password)
        if (!result) {
			return res
				.status(401)
				.json({ success: false, message: 'Invalid credentials!' });
		}
        const hashedPassword=await doHash(newPassword,12)
        existingUser.password=hashedPassword
        await existingUser.save()
		// alert("Password Updated!!");
		res.redirect('/user/signin')
        // return res
		// 	.status(200)
		// 	.json({ success: true, message: 'Password updated!!' });
    } catch (error) {
        console.log(error);
    }
}


exports.sendForgotPasswordCode = async (req, res) => {
	const { email } = req.body;
	try {
		const existingUser = await user.findOne({ email });
		if (!existingUser) {
			return res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'Forgot password code',
			html: '<h1>' + codeValue + '</h1>',
		});

		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				process.env.HMAC_SECRET
			);
			existingUser.forgotPasswordCode = hashedCodeValue;
			existingUser.forgotPasswordCodeValidation = Date.now();
			await existingUser.save();
			return res.redirect(`/user/signin/verify-reset-password?email=${encodeURIComponent(email)}`);
			// return res.status(200).json({ success: true, message: 'Code sent!' });
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};

exports.verifyForgotPasswordCode = async (req, res) => {
	const { email, providedCode, newPassword } = req.body;
	try {
		const { error, value } = acceptFPCodeSchema.validate({
			email,
			providedCode,
			newPassword,
		});
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await user.findOne({ email }).select(
			'+forgotPasswordCode +forgotPasswordCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}

		if (
			!existingUser.forgotPasswordCode ||
			!existingUser.forgotPasswordCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (Date.now() - existingUser.forgotPasswordCodeValidation > 5 * 60 * 1000) {
            return res.status(400).json({ success: false, message: 'Code has expired!' });
        }

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_SECRET
		);

		if (hashedCodeValue === existingUser.forgotPasswordCode) {
			const hashedPassword = await doHash(newPassword, 12);
			existingUser.password = hashedPassword;
			existingUser.forgotPasswordCode = undefined;
			existingUser.forgotPasswordCodeValidation = undefined;
			await existingUser.save();
			return res.redirect('/user/signin')
			// return res
			// 	.status(200)
			// 	.json({ success: true, message: 'Password updated!!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};

exports.getUserFiles= async (req, res) => {
    try {
        if (!req.user) {
            throw new Error("User is not authenticated");
        }

        const files = await fileModel.find({ user: req.user._id }); 
        // res.render('userFiles', { files });
		const message = req.query.msg;
    	res.render('userFiles', { files, message });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}	

// exports.uploadFile=async (req,res)=>{
//     console.log('req.user:', req.user);
//     const newFile =await fileModel.create({
//         path:req.file.path,
//         originalName:req.file.originalname,
//         user: req.user._id
//     })
//     // res.json(newFile)
//     res.redirect('/user/files?msg=file+uploaded+successfully')
// }
exports.uploadFile = async (req, res) => {
	try {
	  console.log('req.user:', req.user);
  
	  const newFile = await fileModel.create({
		path: req.file.path,
		originalName: req.file.originalname,
		user: req.user._id
	  });
  
	  res.redirect('/user/files?msg=' + encodeURIComponent('file uploaded successfully'));
	} catch (err) {
	  console.error('Upload failed:', err);
	  res.redirect('/user/files?msg=' + encodeURIComponent('file upload failed'));
	}
  };
  

exports.downloadFile=async (req, res) => {
    try {
      const loggedInUserId = req.user._id;
      const filePath = req.query.path;
    //   console.log(req.query);
    //   console.log(loggedInUserId);
      console.log(filePath);
  
      const file = await fileModel.findOne({
        user: loggedInUserId,
        path: filePath
      });
  
      if (!file) {
        return res.status(401).json({
          message: "Unauthorized access or no file found"
        });
      }
  
      const [signedUrl] = await firebase
        .storage()
        .bucket()
        .file(filePath)
        .getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 1000,
          responseDisposition: `attachment; filename="${file.originalName}"`
        });
  
      res.redirect(signedUrl);
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to fetch file");
    }
}

exports.deleteFile =async (req, res) => {
    try {
        console.log(req.params);
      const fileId = req.params.id;
      const loggedInUserId = req.user._id;
  
      const file = await fileModel.findOne({ _id: fileId, user: loggedInUserId });
      if (!file) {
        return res.status(404).send('File not found or unauthorized');
      }
  
      // Delete from Firebase Storage
      await firebase.storage().bucket().file(file.path).delete();
  
      // Delete from MongoDB
      await fileModel.deleteOne({ _id: fileId });
  
    //   res.redirect('/user/files'); 
	res.redirect('/user/files?msg=File+deleted+successfully');

    } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting file');
    }
}