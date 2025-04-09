const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Ensure correct path

exports.identifier = async (req, res, next) => {
    let token;
    
    if (req.headers.client === 'not-browser') {
        token = req.headers.authorization; 
    } else {
        token = req.cookies['Authorization']; 
    }
    console.log(token);

    if (!token || !token.startsWith('Bearer ')) {
		return res.status(400).json({ success: false, message: 'Invalid2 token format. Expected: Bearer <token>' });
	}
	

    try {
    
        const tokenParts = token.split(' ');
		console.log(tokenParts);
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(400).json({ success: false, message: 'Invalid token format. Expected: Bearer <token>' });
        }

        const userToken = tokenParts[1]; 
        const jwtVerified = jwt.verify(userToken, process.env.TOKEN_SECRET);

        if (jwtVerified) {
            const user = await User.findById(jwtVerified.userId).select("-password");
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
            req.user = user;  
            next();
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        console.log("JWT Error:", error.message);
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
