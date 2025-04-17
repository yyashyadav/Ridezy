import React, { useState, useEffect, useCallback } from 'react'
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '100%',
};

const center = {
    lat: -3.745,
    lng: -38.523
};

const mapOptions = {
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    scaleControl: true,
};

// Sample pickup locations for testing
const sampleLocations = [
    { lat: 28.6139, lng: 77.2090 }, // Delhi
    { lat: 19.0760, lng: 72.8777 }, // Mumbai
    { lat: 12.9716, lng: 77.5946 }, // Bangalore
    { lat: 22.5726, lng: 88.3639 }, // Kolkata
    { lat: 13.0827, lng: 80.2707 }  // Chennai
];

const LiveTracking = ({ pickupLocation, isDriver = false }) => {
    const [ currentPosition, setCurrentPosition ] = useState(center);
    const [ directions, setDirections] = useState(null);
    const [ mapLoaded, setMapLoaded] = useState(false);
    const [ directionsService, setDirectionsService] = useState(null);
    const [ destination, setDestination] = useState(null);

    // Get current position
    useEffect(() => {
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
    }, []);

    const onLoad = useCallback((map) => {
        setMapLoaded(true);
        // Create DirectionsService after map is loaded
        if (window.google && window.google.maps) {
            setDirectionsService(new window.google.maps.DirectionsService());
        }
    }, []);

    // Set a random destination for testing
    useEffect(() => {
        if (mapLoaded) {
            // Choose a random location from our sample locations
            // const randomIndex = Math.floor(Math.random() * sampleLocations.length);
            setDestination(destination);
        }
    }, [mapLoaded]);

    // Draw route when we have both the service and destination
    useEffect(() => {
        if (mapLoaded && directionsService && destination) {
            const request = {
                origin: currentPosition,
                destination: destination,
                travelMode: window.google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    setDirections(result);
                } else {
                    console.error('Directions request failed:', status);
                }
            });
        }
    }, [mapLoaded, directionsService, destination, currentPosition]);

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={currentPosition}
                zoom={15}
                options={mapOptions}
                onLoad={onLoad}
            >
                <Marker position={currentPosition} />
                {destination && <Marker position={destination} />}
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </LoadScript>
    )
}

export default LiveTracking