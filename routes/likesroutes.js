import express from 'express';
import authcheck from '../middleware/check-auth.js';
import { toggleLike } from '../controllers/likecontroller.js';
const router = express.Router();
router.use(authcheck);
router.post('/toggle', toggleLike);

export default router;