import React, { useRef, useState, useEffect, useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import FinishRide from '../../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../../components/LiveTracking';
import { SocketContext } from '../context/SocketContext';

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(null);
    const [distanceToDestination, setDistanceToDestination] = useState('Calculating...');
    const finishRidePanelRef = useRef(null);
    const location = useLocation();
    const rideData = location.state?.ride;
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();
    const watchPositionId = useRef(null);

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

    // Watch driver position and send updates to server
    useEffect(() => {
        if (navigator.geolocation && socket && rideData?._id) {
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
                    
                    // Calculate distance to destination
                    if (formattedRideData?.destination) {
                        const distance = calculateDistance(
                            position.coords.latitude,
                            position.coords.longitude,
                            formattedRideData.destination.lat,
                            formattedRideData.destination.lng
                        );
                        setDistanceToDestination(`${distance.toFixed(1)} KM away`);
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

    // Calculate distance between two points using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        return distance;
    };

    // Handle completing the ride
    const completeRide = () => {
        setFinishRidePanel(true);
    };

    useGSAP(() => {
        if (finishRidePanel) {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(0)'
            });
        } else {
            gsap.to(finishRidePanelRef.current, {
                transform: 'translateY(100%)'
            });
        }
    }, [finishRidePanel]);

  return (
    <div className='h-screen'>
        <div className='fixed p-4 top-0 flex items-center justify-between w-screen'>
                <img className='w-16' src="https://cdn.worldvectorlogo.com/logos/uber-2.svg" />
                <Link to='/captain-home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
            <i className="text-xl ri-logout-box-r-line"></i>
            </Link>
        </div>
        <div className='h-4/5'>
                {formattedRideData && (
                    <LiveTracking rideData={formattedRideData} />
                )}
        </div>
            <div className='h-1/5 p-6 bg-yellow-400 flex justify-between items-center relative'
                onClick={() => {
            setFinishRidePanel(true);
           }} >
            <h5 className='p-1 text-center w-[90%] absolute top-0' 
                    onClick={() => {

                    }}><i className="text-2xl text-gray-800 ri-arrow-up-wide-fill"></i></h5>
                <h4 className='text-xl font-semibold'>{distanceToDestination}</h4>
                <button 
                    className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'
                    onClick={completeRide}
                >
                    Complete Ride
                </button>
        </div>
            <div ref={finishRidePanelRef} className='fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 pt-12 bg-white'>
              <FinishRide 
              ride={rideData}
                    setFinishRidePanel={setFinishRidePanel} />
        </div>
    </div>
  )
}

export default CaptainRiding