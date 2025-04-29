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

    const { userId, pickup, destination, vehicleType, scheduledTime } = req.body;

    try {
        // Get coordinates for pickup and destination
        const pickupCoordinates = await mapService.getAddressCoordinate(pickup);
        const destinationCoordinates = await mapService.getAddressCoordinate(destination);

        const rideData = {
            user: req.user._id,
            pickup: `${pickupCoordinates.ltd},${pickupCoordinates.lng}`,
            destination: `${destinationCoordinates.ltd},${destinationCoordinates.lng}`,
            pickupAddress: pickup,
            destinationAddress: destination,
            vehicleType,
            bookingTime: new Date(),
            scheduledTime: scheduledTime ? new Date(scheduledTime) : null
        };

        const ride = await rideService.createRide(rideData);
        res.status(201).json(ride);

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
        const userId = req.user._id;
        const activeRide = await rideModel.findOne({
            user: userId,
            status: { $in: ['accepted', 'ongoing'] }
        }).populate('captain');

        if (!activeRide) {
            return res.status(404).json({ message: 'No active ride found' });
        }

        res.status(200).json({ ride: activeRide });
    } catch (error) {
        console.error('Error getting active ride:', error);
        res.status(500).json({ message: 'Error getting active ride' });
    }
};

const getRideHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Get all rides (completed, cancelled, ongoing, pending) sorted by booking time (newest first)
        const rides = await rideModel.find({
            user: userId,
            status: { $in: ['completed', 'cancelled', 'ongoing', 'pending'] }
        })
        .sort({ bookingTime: -1 })
        .populate({
            path: 'captain',
            select: 'fullname phone vehicle.color vehicle.plate vehicle.type'
        })
        .limit(20); // Limit to 20 most recent rides

        // Map through rides to ensure proper status handling
        const mappedRides = rides.map(ride => {
            const rideObj = ride.toObject();
            // If ride was cancelled by captain or user, ensure status is 'cancelled'
            if (rideObj.status === 'pending' && rideObj.captain) {
                rideObj.status = 'cancelled';
            }
            return rideObj;
        });
        
        res.status(200).json({ rides: mappedRides });
    } catch (error) {
        console.error('Error getting ride history:', error);
        res.status(500).json({ message: 'Error getting ride history' });
    }
};

module.exports = {
    createRide,
    getFare,
    confirmRide,
    startRide,
    endRide,
    getActiveRideForUser,
    getRideHistory
};
