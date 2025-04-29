const express=require('express');
const router=express.Router();
const {body}=require('express-validator');
const userController=require('../controllers/user.controller');
const authMiddleware=require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
});

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

// Add new route for profile update
router.put('/profile', 
    authMiddleware.authUser,
    upload.single('profileImage'),
    [
        body('fullname.firstname').optional().isLength({min:3}).withMessage('Firstname must have minimum of 3 characters'),
        body('fullname.lastname').optional().isLength({min:3}).withMessage('Lastname must have minimum of 3 characters'),
        body('email').optional().isEmail().withMessage('Invalid Email format'),
        body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    ],
    userController.updateUserProfile
);

module.exports=router;