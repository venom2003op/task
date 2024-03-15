import express from 'express';
import { check } from 'express-validator';
import { signup, login, forgetpassword } from '../controllers/usercontrollers.js';

const router = express.Router();

//signup route
router.post('/signup',[check('name').not().isEmpty(),
                   check('email').normalizeEmail()
                   .isEmail(), //Test@test.com  ---> test@test.com
                    check('password').isLength({min:6})
                 ],signup );

// login route                 
router.post('/login',[check('email').normalizeEmail()
                    .isEmail(), //Test@test.com  ---> test@test.com 
                    check('password').isLength({min:6})],login );
// forgetpassword route
router.patch('/forgetpassword',[check('email').normalizeEmail().isEmail()
,check('newpassword').isLength({min:6}),check('oldpassword').isLength({min:6})],forgetpassword );
                     

export default router;