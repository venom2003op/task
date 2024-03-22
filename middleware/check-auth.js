import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const jwtSecret=process.env.JWT_SECRET;
const authcheck =(req,res,next)=>{
    if(req.method==='OPTIONS'){
        return next();
    }
    try{
        const token=req.headers.authorization.split(' ')[1];// Authorizationz
        if(!token){
            throw new Error('Authentication failed!');
        }
        const decodedToken=jwt.verify(token,jwtSecret);
        req.userData={userId:decodedToken.userId,role:decodedToken.role};
        console.log(req.userData);
        next();
    }
    catch(err){
        const error = new Error('Authentication failed!');
        return res.status(401).json({message:error.message});
    }
}
export default authcheck;