const express=require('express');
const router=express.Router();
const {body}=require('express-validator');
const userController=require('../controllers/user.controller');
const authMiddleware=require('../middlewares/auth.middleware');

router.post('/register',[//this is the validation part
    body('email').isEmail().withMessage('Invalid Email format'),
    body('fullname.firstname').isLength({min:3}).withMessage('Firstname have minimum of 3 characters'),
    body('password').isLength({min:6}).withMessage('Password must have minimum 6 character'),
],
    userController.registerUser//this is the logic that run 
)
router.post('/login',[
    body('email').isEmail().withMessage('Invalid Email format'),
    body('password').isLength({min:6}).withMessage('Password must have minimum 6 character'),
],
    userController.userLogin,
)

router.get('/profile',authMiddleware.authUser,userController.getUserProfile);
router.get('/logout',authMiddleware.authUser,userController.logoutUser);


module.exports=router;