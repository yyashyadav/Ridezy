import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocketContext } from '../context/SocketContext'
import LiveTracking from '../../components/LiveTracking'
import axios from 'axios'
import { FaMapMarkedAlt } from 'react-icons/fa'

const Riding = () => {
    const location = useLocation()
    const { ride } = location.state || {} // Retrieve ride data
    const { socket } = useContext(SocketContext)
    const navigate = useNavigate()
    const [formattedRideData, setFormattedRideData] = useState(null)
    const [showPayment, setShowPayment] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [mapType, setMapType] = useState('roadmap')
    const [showMapTypeDropdown, setShowMapTypeDropdown] = useState(false)

    // Check token on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token in localStorage:', token ? 'Present' : 'Not found');
        if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/login');
        }
    }, [navigate]);

    // Format ride data for LiveTracking component
    useEffect(() => {
        if (ride) {
            setFormattedRideData({
                _id: ride._id,
                pickup: {
                    lat: parseFloat(ride.pickup.split(',')[0]),
                    lng: parseFloat(ride.pickup.split(',')[1])
                },
                destination: {
                    lat: parseFloat(ride.destination.split(',')[0]),
                    lng: parseFloat(ride.destination.split(',')[1])
                }
            })
        }
    }, [ride])

    useEffect(() => {
        if (socket) {
            console.log('Setting up socket listeners for ride:', ride?._id);
            
            socket.on("ride-ended", () => {
                navigate('/home')
            });

            // Listen for captain arrived event
            socket.on("captain-arrived", (data) => {
                console.log('Received captain-arrived event:', data);
                console.log('Current ride ID:', ride?._id);
                if (data.rideId === ride?._id) {
                    console.log('Showing payment button');
                    setShowPayment(true);
                }
            });

            // Log socket connection status
            console.log('Socket connected:', socket.connected);
        }

        return () => {
            if (socket) {
                socket.off("ride-ended");
                socket.off("captain-arrived");
            }
        }
    }, [socket, navigate, ride?._id]);

    const handlePayment = async () => {
        try {
            setIsProcessing(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                console.error('No token found');
                alert('Please login again to make payment');
                navigate('/login');
                return;
            }

            // Log the token for debugging (remove in production)
            console.log('Token being used:', token);
            
            // Create order on backend
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/payment/create-order`,
                {
                    amount: Math.round(ride.fare * 100), // Convert to paise and ensure it's an integer
                    currency: 'INR',
                    receipt: `ride_${ride._id}`
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );

            console.log('Order created:', response.data);
            const { id: orderId } = response.data;

            // Initialize Razorpay
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: Math.round(ride.fare * 100), // Convert to paise and ensure it's an integer
                currency: "INR",
                name: "Ridezy",
                description: `Payment for ride ${ride._id}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        console.log('Payment successful:', response);
                        // Verify payment on backend
                        const verifyResponse = await axios.post(
                            `${import.meta.env.VITE_BASE_URL}/payment/verify`,
                            {
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                rideId: ride._id
                            },
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                },
                                withCredentials: true
                            }
                        );

                        if (verifyResponse.data.message === 'Payment verified successfully') {
                            console.log('Payment verified successfully, emitting payment-success event');
                            console.log('Socket connected status:', socket.connected);
                            
                            // Ensure socket is connected before emitting
                            if (!socket.connected) {
                                console.log('Socket not connected, attempting to reconnect...');
                                socket.connect();
                            }

                            // Emit payment success event to captain
                            socket.emit('payment-success', {
                                rideId: ride._id,
                                paymentId: response.razorpay_payment_id,
                                userId: ride.user._id || ride.user,
                                captainId: ride.captain._id
                            });

                            // Wait longer to ensure the event is sent before navigating
                            setTimeout(() => {
                                console.log('Navigating to payment success page');
                                navigate('/payment-success', { state: { rideId: ride._id } });
                            }, 2000); // Increased timeout to 2 seconds
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        if (error.response?.status === 401) {
                            alert('Session expired. Please login again.');
                            navigate('/login');
                        } else if (error.response?.data?.message) {
                            alert(error.response.data.message);
                        } else {
                            alert('Payment verification failed. Please contact support.');
                        }
                    }
                },
                prefill: {
                    name: ride.user.fullname.firstname + ' ' + ride.user.fullname.lastname,
                    email: ride.user.email,
                    contact: ride.user.phone
                },
                theme: {
                    color: "#10B981"
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal closed');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment initialization failed:', error);
            if (error.response?.status === 401) {
                console.log('401 error details:', error.response.data);
                alert('Session expired. Please login again.');
                navigate('/login');
            } else {
                alert('Failed to initialize payment. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePaymentSuccess = async (response) => {
        try {
            console.log('Payment successful:', response);
            
            // Verify payment on backend
            const verifyResponse = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/payment/verify`,
                {
                    orderId: response.razorpay_order_id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    rideId: ride._id
                }
            );

            if (verifyResponse.data.message === 'Payment verified successfully') {
                // Emit payment completed event
                if (socket) {
                    console.log('Emitting payment-completed event for ride:', ride._id);
                    socket.emit('payment-completed', {
                        rideId: ride._id,
                        paymentId: response.razorpay_payment_id
                    });
                }
                
                // Navigate to home after successful payment
                navigate('/home');
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification failed:', error);
            if (error.response?.status === 401) {
                alert('Your session has expired. Please login again.');
                navigate('/login');
            } else {
                alert('Payment verification failed. Please contact support.');
            }
        }
    };

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // Add socket connection status check
    useEffect(() => {
        if (socket) {
            const checkConnection = () => {
                console.log('Socket connection status:', socket.connected);
            };
            
            socket.on('connect', checkConnection);
            socket.on('disconnect', checkConnection);
            
            return () => {
                socket.off('connect', checkConnection);
                socket.off('disconnect', checkConnection);
            };
        }
    }, [socket]);

    return (
        <div className='h-screen'>
            <Link to='/home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                <i className="text-lg font-medium ri-home-5-line"></i>
            </Link>
            <div className='h-3/5 relative'>
                {formattedRideData && (
                    <LiveTracking rideData={formattedRideData} mapType={mapType} />
                )}
                {/* Floating Map Type Button */}
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    right: 40, 
                    transform: 'translateY(-50%)', 
                    zIndex: 1010, 
                    pointerEvents: 'auto'
                }}>
                    <button
                        onClick={() => setShowMapTypeDropdown(v => !v)}
                        style={{
                            background: 'rgba(255,255,255,0.95)',
                            borderRadius: '50%',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                            width: 48,
                            height: 48,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 24
                        }}
                        title="Change map type"
                    >
                        <FaMapMarkedAlt />
                    </button>
                    {showMapTypeDropdown && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: -160,
                            background: 'white',
                            borderRadius: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            padding: 8,
                            minWidth: 140,
                            zIndex: 1011
                        }}>
                            {[
                                { value: 'roadmap', label: 'Geographical' },
                                { value: 'satellite', label: 'Satellite' },
                                { value: 'terrain', label: 'Terrain' },
                                { value: 'hybrid', label: 'Hybrid' }
                            ].map(opt => (
                                <div
                                    key={opt.value}
                                    style={{
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        background: mapType === opt.value ? '#f3f4f6' : 'transparent',
                                        borderRadius: 6,
                                        fontWeight: mapType === opt.value ? 600 : 400
                                    }}
                                    onClick={() => {
                                        setMapType(opt.value);
                                        setShowMapTypeDropdown(false);
                                    }}
                                >
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className='h-2/5 p-4'>
                <div className='flex items-center justify-between'>
                    <img className='h-17' src="https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png" />
                    <div className='text-right'>
                        <h2 className='text-lg font-medium capitalize '>{ride?.captain.fullname.firstname}</h2>
                        <h4 className='text-xl font-semibold -mt-1 -mb-1'>{ride?.captain.vehicle.plate}</h4>
                        <p className='text-sm text-gray-600'>{ride?.captain.vehicle.model}</p>
                    </div>
                </div>

                <div className='flex gap-2 justify-between flex-col items-center'>
                    <div className='w-full mt-5'>
                        <div className='flex items-center gap-5 p-3 border-b-2 border-gray-200'>
                            <i className="text-lg ri-map-pin-2-fill"></i>
                            <div>
                                <h3 className='text-lg font-medium'>Destination</h3>
                                <p className='text-gray-600 -mt-1'>{ride?.destinationAddress}</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-5 p-3 '>
                            <i className="ri-currency-line"></i>
                            <div>
                                <h3 className='text-lg font-medium'>₹{ride?.fare}</h3>
                                <p className='text-gray-600 -mt-1'>Cash Payment</p>
                            </div>
                        </div>
                    </div>
                    {showPayment && (
                        <button 
                            className='w-full mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg disabled:opacity-50'
                            onClick={handlePayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? 'Processing...' : 'Make a Payment'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Riding