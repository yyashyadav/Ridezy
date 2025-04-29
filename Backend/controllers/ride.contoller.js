const rideService=require('../services/ride.service');
const {validationResult} =require('express-validator');
const mapService=require('../services/maps.service');
const rideModel=require('../models/ride.model');
const { sendMessageToSocketId } = require('../socket');
const captainModel = require('../models/captain.model');


const createRide = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, pickup, destination, vehicleType } = req.body;

    try {

       

        const ride = await rideService.createRide({ user: req.user._id, pickup, destination, vehicleType });
        res.status(201).json(ride);

        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);

        /*
           // In your ride controller
        console.log("Pickup coordinates:", pickupCoordinates);
        
        // Check if you have any captains
        const allCaptains = await captainModel.find({});
        console.log(`Total captains in database: ${allCaptains.length}`);
        
        // Check if any captains have location data
        const captainsWithLocation = await captainModel.find({
            'location.coordinates': { $exists: true }
        });
        console.log(`Captains with location data: ${captainsWithLocation.length}`);
        */
        const captainsInRadius = await mapService.getCaptainsInTheRadius(pickupCoordinates.ltd, pickupCoordinates.lng, 100);
        console.log("Captains in radius:", captainsInRadius);
        
        ride.otp="";

        const rideWithUser = await rideModel.findOne({ _id: ride._id }).populate('user');

        captainsInRadius.map(captain=>{
            console.log(captain,ride);
            sendMessageToSocketId(captain.socketId,{
                event:'new-ride',
                data:rideWithUser
            })
        })

    } catch (err) {

        console.log(err);
        return res.status(500).json({ message: err.message });
    }

};

const getFare = async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const{ pickup,destination}=req.query;
    try{
        const fare=await rideService.getFare(pickup,destination);
        return res.status(200).json(fare);

    }catch(err){
        return res.status(500).json({message:err.message});
    }
}

const confirmRide = async(req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const {rideId}=req.body;

    try{
        const ride = await rideService.confirmRide({ rideId, captain: req.captain });
        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-confirmed',
            data: ride
        })
        return res.status(200).json(ride);
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}

const startRide = async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId, otp } = req.query;
    try{
        const ride = await rideService.startRide({ rideId, otp, captain: req.captain });

        console.log(ride);

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-started',
            data: ride
        })

        return res.status(200).json(ride);
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}

const endRide = async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { rideId } = req.body;

    try {
        const ride = await rideService.endRide({ rideId, captain: req.captain });

        sendMessageToSocketId(ride.user.socketId, {
            event: 'ride-ended',
            data: ride
        })

        return res.status(200).json(ride);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

/**
 * Get active ride for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Response with active ride or error
 */
const getActiveRideForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find rides that are not completed
        const ride = await rideModel.findOne({
            user: userId,
            status: { $nin: ['completed', 'cancelled'] }
        }).populate('captain');
        
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'No active ride found'
            });
        }
        
        return res.status(200).json({
            success: true,
            message: 'Active ride found',
            ride
        });
    } catch (error) {
        console.error('Error getting active ride:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    createRide,
    getFare,
    confirmRide,
    startRide,
    endRide,
    getActiveRideForUser
};
