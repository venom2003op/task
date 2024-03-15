import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import User from '../models/user.js';
// signup controller       
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
//login controller
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
// forgetpassword controller


export const forgetpassword=async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const { email ,oldpassword, newpassword } = req.body;
    let existingUser;
    try{
        existingUser=await User.findOne({email:email});
        
    }catch(err){
        const error = new Error('Resetting password failed, please try again later.');
        return res.status(500).json({message:error.message});
    }
    if(!existingUser){
        const error = new Error('No user found for this email.');
        return res.status(404).json({message:error.message});
    }
    if(existingUser.password !== oldpassword){
        const error = new Error('Invalid old password.');
        return res.status(403).json({message:error.message});
    }
    existingUser.password=newpassword;
    try{
        await existingUser.save();
    }
    catch(err){
        console.error("Resetting password failed,please try again:", err);
        return res.status(500).send("Error resetting password");
    }

    return res.json({ message: 'Password reset!' });

}