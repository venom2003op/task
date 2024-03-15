import express from 'express';
import { check } from 'express-validator';
import  Comment from '../models/comment.js';
import User from '../models/user.js';
import Post from '../models/post.js';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Like from '../models/likes.js';

export const getCommentById = async (req, res) => {
    const commentId = req.params.cid;
    let comment;
    try {
        comment=await Comment.findById(commentId);
    }
    catch (err) {
        console.error("Error getting comment by id:", err);
        return res.status(500).send("Error getting comment by id");
    }
    if (!comment) {
        return res.status(404).json({ message: 'Could not find a comment for the provided id.' });
    }
    res.status(200).json({ comment: comment.toObject({ getters: true })})   ;
}

export const createComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const { content, postid, userid } = req.body;
    let post;
    try {
        post = await Post.findById(postid);
    }
    catch (err) {
        console.error("Error getting post by id:", err);
        return res.status(500).send("Error getting post by id");
    }
    if (!post) {
        return res.status(404).json({ message: 'Could not find a post for the provided id.' });
    }
    const createdComment = new Comment({
        content,
        post: postid,
        user: userid
    });
    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdComment.save({ session: session });
        post.comments.push(createdComment);
        await post.save({ session: session });
        await session.commitTransaction();
    }
    catch (err) {
        console.error("Error creating comment:", err);
        return res.status(500).send("Error creating comment");
    }
    res.status(201).json({ comment: createdComment.toObject({ getters: true }) });
}

export const updateComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const commentId = req.params.cid;
    const { content } = req.body;
    let comment;
    try {
        comment=await Comment.findById(commentId);
    }
    catch (err) {
        console.error("Error getting comment by id:", err);
        return res.status(500).send("Error getting comment by id");
    }
    comment.content = content;
    try {
        await comment.save();
    }
    catch (err) {
        console.error("Error updating comment:", err);
        return res.status(500).send("Error updating comment");
    }
    res.status(200).json({ comment: comment.toObject({ getters: true }) });
}

export const deleteComment = async (req, res) => {
    const commentId = req.params.cid;
    try {
        const commentToDelete = await Comment.findById(commentId).populate("post");
        if (!commentToDelete) {
            return res
                .status(404)
                .json({ message: 'Could not find comment for the provided id.' });
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        await commentToDelete.deleteOne({ session: session });
        commentToDelete.post.comments.pull(commentId);
        await Like.deleteMany(
           { likeable: commentId, onModel: "Comment" },
           { session: session }
         );
        await commentToDelete.post.save({ session: session });
        await session.commitTransaction();
    }
    catch (err) {
        console.error("Error deleting comment:", err);
        return res.status(500).send("Error deleting comment");
    }
    res.status(200).json({ message: 'Deleted comment.' });

}
