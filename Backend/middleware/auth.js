const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware - Headers:', req.headers);
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            console.log('No token provided in request');
            return res.status(401).json({ message: 'No token provided' });
        }

        console.log('Token received:', token);
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded:', decoded);
            
            // Check if user exists
            const user = await userModel.findById(decoded._id);
            console.log('User lookup result:', user ? 'Found' : 'Not found');
            
            if (user) {
                console.log('User found:', user._id);
                req.user = user;
                return next();
            }

            // Check if captain exists
            const captain = await captainModel.findById(decoded._id);
            console.log('Captain lookup result:', captain ? 'Found' : 'Not found');
            
            if (captain) {
                console.log('Captain found:', captain._id);
                req.captain = captain;
                return next();
            }

            // If we get here, neither user nor captain was found
            console.log('No user or captain found for ID:', decoded._id);
            return res.status(401).json({ 
                message: 'User not found',
                details: 'The user associated with this token no longer exists'
            });
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return res.status(401).json({ 
                message: 'Invalid token',
                details: jwtError.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ 
            message: 'Authentication failed',
            details: error.message
        });
    }
};

module.exports = { auth }; 