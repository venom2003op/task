import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import usersRoutes from './routes/userroutes.js';
import dotenv from 'dotenv';
dotenv.config();
const app=express();
const Port=4000;
app.use(bodyParser.json()); 
const MONGODBURL=process.env.MONGODB_URL;
app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE');
    next();
});

app.use('/api/users',usersRoutes);

mongoose.connect(MONGODBURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log('Connected to Database');
}).catch((err)=>{
    console.log('Connection failed',err);
});
app.listen(Port,()=>{
    console.log(`Server is running on port ${Port}`);
});
``