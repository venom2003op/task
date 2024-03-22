import { v4 as uuidv4 } from 'uuid';
import { validationResult } from 'express-validator';
import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const jwtSecret=process.env.JWT_SECRET;

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
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(password,12);
    }catch(err){
        const error = new Error('Could not create user, please try again.');
        return res.status(500).json({message:error.message});
    }
    const createdUser =new User({
        id:uuidv4(),
        name,
        email,
        password:hashedPassword,
    });
    try{
        await createdUser.save();
    }
    catch(err){
        console.error("Signing Up failed,please try again:", err);
        return res.status(500).send("Error creating User");
    }
    let token;
    try { 
        token = jwt.sign(
            { userId: createdUser._id, email: createdUser.email },
            jwtSecret,
            { expiresIn: '1h' }
        );
      }
    catch (err) {
        console.error("Signing Up failed,please try again:", err);
        return res.status(500).send("Error creating User");
    }
    return res.status(201).json({userId:createdUser.id,email:createdUser.email,token:token,message:'User created successfully'});
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
    if(!existingUser){
        const error = new Error('Invalid credentials, could not log you in.');
        return res.status(403).json({message:error.message});
    }
    let isValidPassword=false;
    try{
        isValidPassword=await bcrypt.compare(password,existingUser.password);
    }catch(err){
        const error = new Error('Could not log you in, please check your credentials and try again.');
        return res.status(500).json({message:error.message});
    }
    if(!isValidPassword){
        const error = new Error('Invalid credentials, could not log you in.');
        return res.status(403).json({message:error.message});
    }
    let token;
    try { 
        token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            jwtSecret,
            { expiresIn: '1h' }
        );
      }
    catch (err) {
        console.error("Logging In failed,please try again:", err);
        return res.status(500).send("Error logging in");
    }
    res.setHeader('Authorization',`Bearer ${token}`);
    console.log("Logged in successfully");
    return res.status(200).json({userId:existingUser.id,email:existingUser.email,token:token,message:'Logged in successfully'});
    

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
    let isValidPassword=false;
    try{
        isValidPassword=await bcrypt.compare(oldpassword,existingUser.password);
    }
    catch(err){
        const error = new Error('Could not reset password, please check your credentials and try again.');
        return res.status(500).json({message:error.message});
    }
    if(!isValidPassword){
        const error = new Error('Invalid credentials, could not reset password.');
        return res.status(403).json({message:error.message});
    }
    let hashedPassword;
    try{
        hashedPassword=await bcrypt.hash(newpassword,12);
    }catch(err){
        const error = new Error('Could not reset password, please try again.');
        return res.status(500).json({message:error.message});
    }
    existingUser.password=hashedPassword;
    try{
        await existingUser.save();
    }catch(err){
        console.error("Resetting password failed,please try again:", err);
        return res.status(500).send("Error resetting password");
    }
    return res.status(200).json({message:'Password reset successfully'});

}