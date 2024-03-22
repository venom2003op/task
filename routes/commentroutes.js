import express from 'express';
import { check } from 'express-validator';
import { getCommentById,createComment, updateComment,deleteComment} from '../controllers/commentcontroller.js';
import  Comment from '../models/comment.js';
import User from '../models/user.js';
import Post from '../models/post.js';
// import Like from '../models/like.js';
import checkAuth from '../middleware/check-auth.js';
const router = express.Router();
router.get('/:cid', getCommentById);
router.use(checkAuth);
router.post('/',[check('content').not().isEmpty()],createComment);
router.patch('/:cid',[check('content').not().isEmpty()],updateComment);
router.delete('/:cid',deleteComment);

export default router;