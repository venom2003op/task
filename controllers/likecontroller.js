import Like from '../models/likes.js';
import Post from '../models/post.js';
import Comment from '../models/comment.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import e from 'express';

export const toggleLike = async (req, res) => {
    const { type, likeableid, userid} = req.body;
    let likeable;
    let deleted = false;
    try {
        if (type === 'Post') {
            likeable = await Post.findById(likeableid).populate('likes');
        }
        else {
            likeable = await Comment.findById(likeableid).populate('likes');
        }
    }
    catch (err) {
        console.error("Error finding likeable:", err);
        return res.status(500).send("Error finding likeable");
    }
    if (!likeable) {
        return res.status(404).json({ message: 'Could not find a likeable for the provided id.' });
    }
   let existingLike;
    try {
        existingLike = await Like.findOne({
            likeable: likeableid,
            onModel: type,
            user: userid
        });
    }
    catch (err) {
        console.error("Error finding existing like:", err);
        return res.status(500).send("Error finding existing like");
    }
    if(existingLike){
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            likeable.likes.pull(existingLike);
            await likeable.save({ session: session });
            await existingLike.deleteOne({ session: session });
            await session.commitTransaction();
            session.endSession();
            deleted = true;
        }
        catch (err) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error deleting like:", err);
            return res.status(500).send("Error deleting like");
        }
    }else{
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const newLike={
                user: userid,
                likeable: likeableid,
                onModel: type
            };
            likeable.likes.push(newLike);
            await likeable.save({ session: session });
            await session.commitTransaction();
            session.endSession();
            deleted = false;
        }
        catch (err) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error creating like:", err);
            return res.status(500).send("Error creating like");
        }
    }
    
    return res.status(200).json({ message: "Request successful!", data: { deleted: deleted } });
}