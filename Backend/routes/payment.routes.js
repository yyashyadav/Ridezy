const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');
const rideModel = require('../models/ride.model');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount, currency, receipt } = req.body;

        if (!amount || !currency) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: 'amount and currency are required'
            });
        }

        const options = {
            amount: Math.round(amount), // Ensure amount is an integer
            currency: currency,
            receipt: receipt
        };

        console.log('Creating order with options:', options);
        const order = await razorpay.orders.create(options);
        console.log('Order created:', order);
        res.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            message: 'Error creating order',
            details: error.message
        });
    }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
    try {
        const { orderId, paymentId, signature, rideId } = req.body;
        
        console.log('Payment verification request:', { orderId, paymentId, signature, rideId });

        if (!orderId || !paymentId || !signature || !rideId) {
            console.log('Missing required fields:', { orderId, paymentId, signature, rideId });
            return res.status(400).json({ 
                message: 'Missing required fields',
                details: 'orderId, paymentId, signature, and rideId are required'
            });
        }

        // Verify signature
        const body = orderId + "|" + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        console.log('Signature verification:', {
            expected: expectedSignature,
            received: signature
        });

        if (expectedSignature === signature) {
            // Update ride status
            const updatedRide = await rideModel.findByIdAndUpdate(
                rideId,
                {
                    status: 'completed',
                    paymentId: paymentId,
                    orderId: orderId,
                    signature: signature
                },
                { new: true }
            );

            if (!updatedRide) {
                console.log('Ride not found:', rideId);
                return res.status(404).json({ message: 'Ride not found' });
            }

            console.log('Payment verified and ride updated:', updatedRide._id);
            res.json({ message: 'Payment verified successfully' });
        } else {
            console.log('Invalid signature');
            res.status(400).json({ 
                message: 'Invalid signature',
                details: 'The payment signature verification failed'
            });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ 
            message: 'Error verifying payment',
            details: error.message
        });
    }
});

module.exports = router; 