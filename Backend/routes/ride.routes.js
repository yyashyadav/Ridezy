const express=require('express');
const router=express.Router();
const {body,query}=require('express-validator');
const rideController=require('../controllers/ride.contoller');
const authMiddleware=require('../middlewares/auth.middleware');

router.post('/create',authMiddleware.authUser,
    body('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),
    body('vehicleType').isString().isIn(['auto','car','motorcycle','moto']).withMessage('Invalid vehicle'),
    rideController.createRide
)

router.get('/get-fare',
    authMiddleware.authUser,
    query('pickup').isString().isLength({min:3}).withMessage('Invalid pickup address'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid destination address'),
    rideController.getFare
)

router.get('/available', authMiddleware.authCaptain, rideController.getAvailableRides);

router.post('/confirm',authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('otp').isString().isLength({min:6,max:6}).withMessage('Invalid otp'),
    rideController.confirmRide
)

router.get('/start-ride',authMiddleware.authCaptain,
    query('rideId').isMongoId().withMessage('Invalid ride id'),
    query('otp').isString().isLength({min:6,max:6}).withMessage('Invalid otp'),
    rideController.startRide
)

router.post('/end-ride',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

router.get('/active', authMiddleware.authUser, rideController.getActiveRideForUser);
router.get('/history', authMiddleware.authUser, rideController.getRideHistory);
router.get('/captain/history', authMiddleware.authCaptain, rideController.getCaptainRideHistory);
router.get('/captain/daily-earnings', authMiddleware.authCaptain, rideController.getCaptainDailyEarnings);
router.post('/update-status', 
    authMiddleware.authUser,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    body('status').isString().isIn(['cancelled', 'completed', 'in_progress']).withMessage('Invalid status'),
    rideController.updateRideStatus
);

module.exports = router;
