import express from 'express';
import { check } from 'express-validator';


import { getPostById, getPostsByUserId,createPost, updatePost,deletePost} from '../controllers/postcontrollers.js';
const router = express.Router();
router.get('/:pid', getPostById);   
router.get('/user/:uid', getPostsByUserId);
router.post('/',[check('content').not().isEmpty()],createPost);
router.patch('/:pid',[check('content').not().isEmpty()],updatePost);
router.delete('/:pid',deletePost);
export default router;

