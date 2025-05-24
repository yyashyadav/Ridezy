import React, { useState, useEffect, useContext, useRef } from 'react';
import { GoogleMap, Marker, Polyline,Circle } from '@react-google-maps/api';
import { SocketContext } from '../src/context/SocketContext';
import axios from 'axios'; // Required for fetching route

const containerStyle = {
    width: '100%',
    height: '100%',
};

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

// Validates coordinates
const isValidCoordinate = (coord) => {
    return coord &&
        typeof coord.lat === 'number' &&
        typeof coord.lng === 'number' &&
        !isNaN(coord.lat) &&
        !isNaN(coord.lng) &&
        coord.lat >= -90 &&
        coord.lat <= 90 &&
        coord.lng >= -180 &&
        coord.lng <= 180;
};

const LiveTracking = ({ rideData, mapType = 'roadmap' }) => {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [driverPosition, setDriverPosition] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const { socket } = useContext(SocketContext);
    const mapRef = useRef(null);

    // Get current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            });

            const watchId = navigator.geolocation.watchPosition((position) => {
                const { latitude, longitude } = position.coords;
                setCurrentPosition({ lat: latitude, lng: longitude });
            });

            return () => navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    // Listen for driver's real-time updates
    useEffect(() => {
        if (socket && rideData?._id) {
            socket.emit('join-ride', { rideId: rideData._id });

            socket.on(`driverLocation:${rideData._id}`, (location) => {
                if (location && location.latitude && location.longitude) {
                    setDriverPosition({
                        lat: location.latitude,
                        lng: location.longitude,
                    });
                }
            });

            return () => {
                socket.off(`driverLocation:${rideData._id}`);
            };
        }
    }, [socket, rideData]);

    // Fetch route from Google Directions API
    useEffect(() => {
        const fetchRoute = () => {
            if (!rideData?.pickup || !rideData?.destination) {
                console.log('Missing pickup or destination coordinates');
                return;
            }

            // console.log('Fetching route with coordinates:', {
            //     pickup: rideData.pickup,
            //     destination: rideData.destination
            // });

            const directionsService = new window.google.maps.DirectionsService();

            directionsService.route(
                {
                    origin: rideData.pickup,
                    destination: rideData.destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    // console.log('Directions API response:', result);
                    // console.log('Directions API status:', status);
                    
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        if (!result.routes || result.routes.length === 0) {
                            console.error('No routes found in the response');
                            return;
                        }

                        const route = result.routes[0];
                        // console.log('Route object:', route);
                        
                        if (!route.overview_polyline) {
                            console.error('No overview_polyline in the route');
                            return;
                        }

                        // console.log('Overview polyline:', route.overview_polyline);
                        
                        // The overview_polyline is a string containing the encoded polyline
                        const encodedPolyline = route.overview_polyline;

                        if (!encodedPolyline) {
                            console.error('Encoded polyline is undefined or empty');
                            return;
                        }

                        // console.log('Encoded polyline:', encodedPolyline);

                            // If points exist, decode the polyline path
                            if (window.google?.maps?.geometry?.encoding) {
                            try {
                                const decodedPath = window.google.maps.geometry.encoding.decodePath(encodedPolyline);
                                // console.log('Decoded path:', decodedPath);
                                
                                if (decodedPath && decodedPath.length > 0) {
                                setRoutePath(decodedPath);
                            } else {
                                    console.error('Decoded path is empty');
                                }
                            } catch (error) {
                                console.error('Error decoding polyline:', error);
                            }
                        } else {
                            console.warn('Google geometry library not loaded.');
                        }
                    } else {
                        console.error('Directions request failed with status:', status);
                        if (status === window.google.maps.DirectionsStatus.ZERO_RESULTS) {
                            console.error('No route found between the origin and destination.');
                        }
                    }
                }
            );
        };

        if (window.google) {
            fetchRoute();
        } else {
            console.error('Google Maps API not loaded');
        }
    }, [rideData]);

    useEffect(() => {
        if (routePath.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            routePath.forEach((point) => bounds.extend(point));
            setTimeout(() => mapRef.current?.fitBounds(bounds), 500); // using ref
        }
    }, [routePath]);

    const getMapCenter = () => {
        if (driverPosition && isValidCoordinate(driverPosition)) return driverPosition;
        if (currentPosition && isValidCoordinate(currentPosition)) return currentPosition;
        if (rideData?.pickup && isValidCoordinate(rideData.pickup)) return rideData.pickup;
        return DEFAULT_CENTER;
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={getMapCenter()}
                zoom={15}
                options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeId: mapType,
                }}
                onLoad={(map) => {
                    if (routePath.length > 0) {
                        const bounds = new window.google.maps.LatLngBounds();
                        routePath.forEach((point) => bounds.extend(point));
                        map.fitBounds(bounds);
                    }
                }}
                onUnmount={() => {
                    mapRef.current = null;
                }}
            >
                {currentPosition && (
                    <Marker
                        position={currentPosition}
                        icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: { width: 30, height: 30 },
                        }}
                    />
                    
                )}

                {driverPosition && (
                    <Marker
                        position={driverPosition}
                        icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
                            scaledSize: { width: 30, height: 30 },
                        }}
                    />
                )}

                {rideData?.pickup && (
                    <Marker
                        position={rideData.pickup}
                        icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                            scaledSize: { width: 30, height: 30 },
                        }}
                    />
                )}

                {rideData?.destination && (
                    <Marker
                        position={rideData.destination}
                        icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                            scaledSize: { width: 30, height: 30 },
                        }}
                    />
                )}

                {/* Blue route line */}
                {routePath.length > 0 && (
                    <Polyline
                        path={routePath}
                        options={{
                            strokeColor: '#1360db',
                            strokeOpacity: 0.8,
                            strokeWeight: 6,
                        }}
                    />
                )}
            </GoogleMap>
        </div>
    );
};

export default LiveTracking;
