import React, { useState, useEffect, useContext } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { SocketContext } from '../src/context/SocketContext'

const containerStyle = {
    width: '100%',
    height: '100%',
};

const LiveTracking = ({ rideData }) => {
    const [ currentPosition, setCurrentPosition ] = useState(null);
    const [ driverPosition, setDriverPosition ] = useState(null);
    const { socket } = useContext(SocketContext);

    // Get user's current position
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });

            const watchId = navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({
                    lat: latitude,
                    lng: longitude
                });
            });

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Listen for driver position updates if rideData is provided
    useEffect(() => {
        if (socket && rideData?._id) {
            // Join the ride room for updates
            socket.emit('join-ride', { rideId: rideData._id });
            
            // Listen for driver location updates
            socket.on(`driverLocation:${rideData._id}`, (location) => {
                if (location && location.latitude && location.longitude) {
                    setDriverPosition({
                        lat: location.latitude,
                        lng: location.longitude
                    });
                }
            });
            
            return () => {
                socket.off(`driverLocation:${rideData._id}`);
            };
        }
    }, [socket, rideData]);

    // Determine the center of the map
    const getMapCenter = () => {
        if (driverPosition) {
            return driverPosition;
        } else if (currentPosition) {
            return currentPosition;
        } else if (rideData?.pickup) {
            return rideData.pickup;
        } else {
            return { lat: 28.6139, lng: 77.2090 }; // Default center (Delhi)
        }
    };

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={getMapCenter()}
            zoom={15}
            options={{ 
                disableDefaultUI: true,
                zoomControl: true
            }}
        >
            {/* User's position marker */}
            {currentPosition && (
                <Marker 
                    position={currentPosition} 
                    icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        scaledSize: { width: 30, height: 30 }
                    }}
                />
            )}
            
            {/* Driver's position marker */}
            {driverPosition && (
                <Marker 
                    position={driverPosition} 
                    icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        scaledSize: { width: 30, height: 30 }
                    }}
                />
            )}
            
            {/* Pickup location marker */}
            {rideData?.pickup && (
                <Marker 
                    position={rideData.pickup} 
                    icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                        scaledSize: { width: 30, height: 30 }
                    }}
                />
            )}
            
            {/* Destination marker */}
            {rideData?.destination && (
                <Marker 
                    position={rideData.destination} 
                    icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                        scaledSize: { width: 30, height: 30 }
                    }}
                />
            )}
        </GoogleMap>
    )
}

export default LiveTracking