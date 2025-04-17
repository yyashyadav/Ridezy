const userModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const captainModel = require('../models/captain.model');

const blacklistTokenModel = require('../models/blacklistToken.model');

module.exports.authUser=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }



    const isBlacklisted=await blacklistTokenModel.findOne({token:token});
    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized"});
    }

    
    // now we decode the token in the try and catch block 
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded._id);
        req.user=user;
        return next();
    }catch(err){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
}

module.exports.authCaptain=async(req,res,next)=>{
    const token=req.cookies.token || req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }

    const isBlacklisted=await blacklistTokenModel.findOne({token:token});
    if(isBlacklisted){
        return res.status(401).json({message:"Unauthorized"});
    }
    
    // now we decode the tokenfind the user and send the user in the req 
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const captain=await captainModel.findById(decoded._id);
        req.captain=captain;
        return next();
    }catch(error){
        return res.status(401).json({
            message:"Unauthorized",
        })
    }
}