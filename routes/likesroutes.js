import express from 'express';

import { toggleLike } from '../controllers/likecontroller.js';
const router = express.Router();

router.post('/toggle', toggleLike);

export default router;