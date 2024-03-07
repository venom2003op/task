import express from 'express';
import { check } from 'express-validator';
import { signup, login, forgetpassword } from '../controllers/usercontrollers.js';

const router = express.Router();


router.post('/signup',[check('name').not().isEmpty(),
                   check('email').normalizeEmail()
                   .isEmail(), //Test@test.com  ---> test@test.com
                    check('password').isLength({min:6})
                 ],signup );

router.post('/login',[check('email').normalizeEmail()
                    .isEmail(), //Test@test.com  ---> test@test.com 
                    check('password').isLength({min:6})],login );

router.post('/forgetpassword',[check('email').normalizeEmail().isEmail()
],forgetpassword );
                     

export default router;