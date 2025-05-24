import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FinishRide from '../../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../../components/LiveTracking';
import { SocketContext } from '../context/SocketContext';
import { FaMapMarkedAlt } from 'react-icons/fa';

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [distanceToDestination, setDistanceToDestination] = useState('Calculating...');
    const [showBottomDiv, setShowBottomDiv] = useState(true);
    const finishRidePanelRef = useRef(null);
    const location = useLocation();
    const rideData = location.state?.ride;
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const watchPositionId = useRef(null);
    const directionsService = useRef(null);
    const [mapType, setMapType] = useState('roadmap');
    const [showMapTypeDropdown, setShowMapTypeDropdown] = useState(false);

    // Format ride data for LiveTracking component
    const [formattedRideData, setFormattedRideData] = useState(null);

    useEffect(() => {
        if (rideData) {
            setFormattedRideData({
                _id: rideData._id,
                pickup: {
                    lat: parseFloat(rideData.pickup.split(',')[0]),
                    lng: parseFloat(rideData.pickup.split(',')[1])
                },
                destination: {
                    lat: parseFloat(rideData.destination.split(',')[0]),
                    lng: parseFloat(rideData.destination.split(',')[1])
                }
            });
        }
    }, [rideData]);

    // Listen for payment success
    useEffect(() => {
        if (socket && rideData?._id) {
            console.log('Setting up payment-success listener for ride:', rideData._id);
            console.log('Socket connected status:', socket.connected);

            const handlePaymentSuccess = (data) => {
                console.log('Payment success received:', data);
                if (data.rideId === rideData._id) {
                    console.log('Payment success matches current ride, showing FinishRide panel');
                    // First hide the bottom div
                    setShowBottomDiv(false);
                    // Then show the FinishRide panel
                    setFinishRidePanel(true);
                }
            };

            // Add the listener
            socket.on('payment-success', handlePaymentSuccess);

            // Cleanup function
            return () => {
                console.log('Cleaning up payment-success listener');
                socket.off('payment-success', handlePaymentSuccess);
            };
        }
    }, [socket, rideData?._id]);

    // Initialize Directions Service
    useEffect(() => {
        if (window.google) {
            directionsService.current = new window.google.maps.DirectionsService();
        }
    }, []);

    // Watch driver position and send updates to server
    useEffect(() => {
        if (navigator.geolocation && socket && rideData?._id && directionsService.current) {
            // Start watching position
            watchPositionId.current = navigator.geolocation.watchPosition(
                (position) => {
                    const currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    
                    setCurrentPosition(currentLocation);
                    
                    // Send position to server via socket
                    socket.emit('driver-location-update', {
                        rideId: rideData._id,
                        location: currentLocation
                    });
                    
                    // Calculate distance to destination using Directions Service
                    if (formattedRideData?.destination) {
                        const request = {
                            origin: { lat: position.coords.latitude, lng: position.coords.longitude },
                            destination: { lat: formattedRideData.destination.lat, lng: formattedRideData.destination.lng },
                            travelMode: window.google.maps.TravelMode.DRIVING
                        };

                        directionsService.current.route(request, (result, status) => {
                            if (status === window.google.maps.DirectionsStatus.OK) {
                                const distance = result.routes[0].legs[0].distance.value / 1000; // Convert meters to kilometers
                                setDistanceToDestination(`${distance.toFixed(1)} KM away`);
                            } else {
                                console.error('Error getting directions:', status);
                                setDistanceToDestination('Calculating...');
                            }
                        });
                    }
                },
                (error) => {
                    console.error("Error getting geolocation:", error);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 10000,
                    timeout: 5000
                }
            );
        }

        // Cleanup function
        return () => {
            if (watchPositionId.current !== null) {
                navigator.geolocation.clearWatch(watchPositionId.current);
            }
        };
    }, [socket, rideData, formattedRideData]);

    // Handle completing the ride
    const completeRide = () => {
        if (socket && rideData?._id) {
            console.log('Emitting captain-arrived event for ride:', rideData._id);
            socket.emit('captain-arrived', {
                rideId: rideData._id,
                userId: rideData.user._id || rideData.user
            });
        }
    };

    // Add socket connection status check
    useEffect(() => {
        if (socket) {
            const checkConnection = () => {
                console.log('Socket connection status:', socket.connected);
            };
            
            socket.on('connect', checkConnection);
            socket.on('disconnect', checkConnection);
            
            return () => {
                if (socket.connected) {
                    socket.off('connect', checkConnection);
                    socket.off('disconnect', checkConnection);
                }
            };
        }
    }, [socket]);

    // Handle navigation cleanup
    useEffect(() => {
        return () => {
            if (socket && socket.connected) {
                console.log('Cleaning up socket listeners on navigation');
                socket.off('payment-success');
                socket.off('connect');
                socket.off('disconnect');
            }
        };
    }, [socket]);

    // Add a separate effect for panel animation
    useEffect(() => {
        if (finishRidePanel) {
            console.log('Animating FinishRide panel into view');
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)',
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    }, [finishRidePanel]);

    return (
        <div className='h-screen'>
            <div className='fixed p-4 top-0 flex items-center justify-between w-screen'>
                <img className='w-16' src="/ridezy-logo.png" alt="Ridezy Logo" />
                <Link to='/captain-home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
                    <i className="text-xl ri-logout-box-r-line"></i>
                </Link>
            </div>
            <div className='h-4/5 relative'>
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
            {showBottomDiv && (
                <div className='h-1/5 p-6 bg-yellow-400 flex justify-between items-center relative'>
                    <h5 className='p-1 text-center w-[90%] absolute top-0'></h5>
                    <h4 className='text-xl font-semibold'>{distanceToDestination}</h4>
                    <button 
                        className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'
                        onClick={completeRide}
                    >
                        Complete Ride
                    </button>
                </div>
            )}
            {finishRidePanel && (
                <div 
                    ref={finishRidePanelRef} 
                    className='fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 pt-12 bg-white'
                    style={{ transform: finishRidePanel ? 'translateY(0)' : 'translateY(100%)' }}
                >
                    <FinishRide 
                        ride={rideData}
                        setFinishRidePanel={setFinishRidePanel} 
                    />
                </div>
            )}
        </div>
    );
};

export default CaptainRiding;