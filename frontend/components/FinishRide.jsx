import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getToken } from '../src/services/auth.service';
import { SocketContext } from '../src/context/SocketContext';

const FinishRide = (props) => {
    const navigate = useNavigate();
    const { socket } = useContext(SocketContext);
    const [isWaitingForPayment, setIsWaitingForPayment] = useState(true);

    useEffect(() => {
        if (socket && props.ride?._id) {
            console.log('FinishRide: Setting up payment-success listener for ride:', props.ride._id);
            
            const handlePaymentSuccess = (data) => {
                console.log('FinishRide: Payment success received:', data);
                if (data.rideId === props.ride._id) {
                    console.log('FinishRide: Payment confirmed for ride:', props.ride._id);
                    setIsWaitingForPayment(false);
                }
            };

            // Add the listener
            socket.on('payment-success', handlePaymentSuccess);

            return () => {
                console.log('FinishRide: Cleaning up payment-success listener');
                socket.off('payment-success', handlePaymentSuccess);
            };
        }
    }, [socket, props.ride?._id]);

    async function endRide() {
        try {
            // Since ride is already completed, just navigate to captain home
            console.log('Navigating to captain home');
                    
                    // Emit socket event to notify user that ride is completed
                    if (socket.connected) {
                        socket.emit('ride-completed', { 
                            rideId: props.ride._id, 
                            userId: props.ride.user._id,
                            status: 'completed'
                        });
                    }
                    
                    // Wait for socket event to be sent before navigating
                    setTimeout(() => {
                        navigate('/captain-home');
                    }, 1000);
            
        } catch (error) {
            console.error('Error in navigation:', error);
            alert('Error navigating to home. Please try again.');
        }
    }

    return (
        <div className='bg-white p-4 rounded-t-3xl'>
            <h5 className='p-1 text-center w-[93%] absolute top-0'><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
            <h3 className='text-2xl font-semibold mb-5'>Ride Completed</h3>
            <div className='flex gap-2 justify-between flex-col items-center'>
                <div className='w-full mt-5'>
                    <div className='flex items-center gap-5 px-1 py-3 border-b-2 border-gray-200'>
                        <i className="ri-map-pin-2-fill text-3xl"></i>
                        <div>
                            <h3 className='text-lg font-semibold'>Pickup</h3>
                            <p className='text-gray-600 -mt-1 '>{props.ride?.pickupAddress}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 px-1 py-3 border-b-2 border-gray-200'>
                        <i className="ri-map-pin-2-fill text-3xl"></i>
                        <div>
                            <h3 className='text-lg font-semibold'>Destination</h3>
                            <p className='text-gray-600 -mt-1'>{props.ride?.destinationAddress}</p>
                        </div>
                    </div>
                    <div className='flex items-center gap-5 px-1 py-3 '>
                        <i className="ri-currency-line text-3xl"></i>
                        <div>
                            <h3 className='text-lg font-semibold'>₹{props.ride?.fare}</h3>
                            <p className='text-gray-600 -mt-1'>Payment Received</p>
                        </div>
                    </div>
                </div>
                <div className='mt-10 w-full'>
                    <button 
                        onClick={endRide}
                        className="w-full flex justify-center mt-5 font-semibold p-2 rounded-lg bg-green-600 text-white"
                    >
                        Complete Ride
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinishRide;