import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import User from '../models/user.js';
       
export const signup=async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    let existingUser;
    try{
        existingUser=await User.findOne({email:email});
        
    }catch(err){
        const error = new Error('Signing up failed, please try again later.');
        return res.status(500).json({message:error.message});
    }
    if(existingUser){
        const error = new Error('User exists already, please login instead.');
        return res.status(422).json({message:error.message});
    }
    const createdUser =new User({
        id:uuidv4(),
        name,
        email,
        password
    });
    try{
        await createdUser.save();
    }
    catch(err){
        console.error("Signing Up failed,please try again:", err);
        return res.status(500).send("Error creating User");
    }
    return res.status(201).json({user: createdUser});
}

export const login=async(req, res, next) => {  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }  
    const { email, password } = req.body;
    let existingUser;
    try{
        existingUser=await User.findOne({email:email});
        
    }catch(err){
        const error = new Error('Logging In failed, please try again later.');
        return res.status(500).json({message:error.message});
    }
    if(!existingUser || existingUser.password !== password){
        const error = new Error('Invalid credentials, could not log you in.');
        return res.status(403).json({message:error.message});
    }
    return res.json({ message: 'Logged in!' });

}

export const forgetpassword=async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const { email } = req.body;
    let existingUser;
    try{
        existingUser=await User.findOne({email:email});
        
    }catch(err){
        const error = new Error('Password reset failed, please try again later.');
        return res.status(500).json({message:error.message});
    }
    if(!existingUser){
        const error = new Error('Invalid credentials, could not reset password.');
        return res.status(403).json({message:error.message});
    }
    
    return res.json({ message: 'Password reset!' });
}
