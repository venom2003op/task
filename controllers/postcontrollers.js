import Post from '../models/post.js';
import Comment from '../models/comment.js';
import Like from '../models/likes.js';
import User from '../models/user.js';
import {v4 as uuidv4} from 'uuid';
import mongoose from 'mongoose';
import {validationResult} from 'express-validator';
export const getPostById = async (req, res) => {
    const postId = req.params.pid;
    let post;
    try {
        post=await Post.findById(postId);
    }
    catch (err) {
        console.error("Error getting post by id:", err);
        return res.status(500).send("Error getting post by id");
    }
    if (!post) {
        return res.status(404).json({ message: 'Could not find a post for the provided id.' });
    }
    res.status(200).json({ post: post.toObject({ getters: true })})   ;
}
export const getPostsByUserId = async (req, res) => {
    const userId = req.params.uid;
    try {
        const user = await User.findById(userId).populate('post'); // Populate the 'post' field
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const posts = user.post; // Access the 'post' field
        if (!posts || posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this user.' });
        }
        res.status(200).json({ posts: posts.map((post) => post.toObject({ getters: true })) });
    } catch (err) {
        console.error("Error getting posts by user id:", err);
        return res.status(500).send("Error getting posts by user id");
    }
};

export const createPost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const { content, userid } = req.body;
    
    const createdPost = new Post({
        id: uuidv4(),
        content,
        user: userid
    });
    // createPost=await createPost.populate('user', 'name');
    let user;
    try {
        user = await User.findById(userid);
    }
    catch (err) {
        console.error("Error getting user by id:", err);
        return res.status(500).send("Error getting user by id");
    }
    if (!user) {
        return res.status(404).json({ message: 'Could not find user for the provided id.' });
    }
    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdPost.save({ session: session });
        user.post.push(createdPost);
        await user.save({ session: session });
        await session.commitTransaction();

    }
    catch (err) {
        console.error("Error creating post:", err);
        return res.status(500).send("Error creating post");
    }
    res.status(201).json({ post: createdPost });
}

export const updatePost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(422).json({ errors: errors.array() });
    }
    const postId = req.params.pid;
    const { content } = req.body;
    let post;
    try {
        post=await Post.findById(postId);
    }
    catch (err) {
        console.error("Error getting post by id:", err);
        return res.status(500).send("Error getting post by id");
    }
    post.content = content;
    try {
        await post.save();
    }
    catch (err) {
        console.error("Error updating post:", err);
        return res.status(500).send("Error updating post");
    }
    res.status(200).json({ post: post.toObject({ getters: true }) });
}
export const deletePost = async (req, res) => {
  const postId = req.params.pid;
  try {
    const postToDelete = await Post.findById(postId).populate("user");
    if (!postToDelete) {
      return res
        .status(404)
        .json({ message: "Could not find post for this id." });
    }

    const user = postToDelete.user;
    if (!user) {
      return res
        .status(404)
        .json({ message: "User associated with the post not found." });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    await postToDelete.deleteOne({ session: session });
    await Comment.deleteMany({ post: postId }, { session: session });
    await Like.deleteMany({ likeable: postId, onModel: "Post" }, { session: session });
    // Remove the post from the user's posts array
    user.post.pull(postToDelete);
    await user.save({ session: session });

    await session.commitTransaction();

    res.status(200).json({ message: "Deleted post." });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).send("Error deleting post");
  }
};

