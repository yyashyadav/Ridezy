import { useGSAP } from '@gsap/react';
import axios from 'axios';
import gsap from 'gsap';
import React, { useRef, useState,useContext,useEffect } from 'react'
import 'remixicon/fonts/remixicon.css'
import LocationSearchPanel from '../../components/LocationSearchPanel';
import VehiclePanel from '../../components/VehiclePanel';
import ConfirmRide from '../../components/ConfirmRide';
import LookingForDriver from '../../components/LookingForDriver';
import WaitingForDriver from '../../components/WaitingForDriver';
import { SocketContext } from '../context/SocketContext';
import { UserDataContext } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import LiveTracking from '../../components/LiveTracking';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { getToken } from '../services/auth.service';
import { FaMapMarkedAlt } from 'react-icons/fa';

// Main user home page for booking and tracking rides
const Home = () => {
    // --- State and refs for ride flow and UI panels ---
    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
    const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });
    const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
    const vehiclePanelRef = useRef(null)
    const confirmRidePanelRef = useRef(null)
    const vehicleFoundRef = useRef(null)
    const waitingForDriverRef = useRef(null)
    const panelRef = useRef(null)
    const panelCloseRef = useRef(null)
    const [ vehiclePanel, setVehiclePanel ] = useState(false)
    const [ confirmRidePanel, setConfirmRidePanel ] = useState(false)
    const [ vehicleFound, setVehicleFound ] = useState(false)
    const [ waitingForDriver, setWaitingForDriver ] = useState(false)
    const [ pickupSuggestions, setPickupSuggestions ] = useState([])
    const [ destinationSuggestions, setDestinationSuggestions ] = useState([])
    const [ activeField, setActiveField ] = useState(null)
    const [ fare, setFare ] = useState({})
    const [ vehicleType, setVehicleType ] = useState(null)
    const [ ride, setRide ] = useState(null)
    const [currentRide, setCurrentRide] = useState(null);
    const [showLiveTracking, setShowLiveTracking] = useState(false);
    const [mapType, setMapType] = useState('roadmap');
    const [showMapTypeDropdown, setShowMapTypeDropdown] = useState(false);

    // --- Navigation and context ---
    const navigate = useNavigate()
    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    // --- Socket event listeners for ride lifecycle ---
    useEffect(() => {
        socket.emit("join", { userType: "user", userId: user._id })
        // Listen for ride events and update UI accordingly
        socket.on('ride-confirmed', ride => {
            setVehicleFound(false)
            setWaitingForDriver(true)
            setRide(ride)
        })
        socket.on('ride-started', ride => {
            setWaitingForDriver(false)
            navigate('/riding', { state: { ride } })
        })
        socket.on('ride-completed', () => {
            setVehicleFound(false)
            setWaitingForDriver(false)
            setConfirmRidePanel(false)
            setVehiclePanel(false)
            setPanelOpen(false)
            navigate('/')
        })
        socket.on('ride-cancelled', (data) => {
            setVehicleFound(false)
            setWaitingForDriver(false)
            setConfirmRidePanel(false)
            setVehiclePanel(false)
            setPanelOpen(false)
            alert('Your ride was cancelled because no captain was found within the time limit. Please try again.');
        })
        // Cleanup listeners on unmount
        return () => {
            socket.off('ride-confirmed')
            socket.off('ride-started')
            socket.off('ride-completed')
            socket.off('ride-cancelled')
        }
    }, [user, socket, navigate])

    // --- Animate header and button UI on mount ---
    useEffect(() => {
        gsap.from('.header-element', {
            y: -20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });
        // Add hover effect to all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                gsap.to(button, { scale: 1.02, duration: 0.2, ease: 'power2.out' });
            });
            button.addEventListener('mouseleave', () => {
                gsap.to(button, { scale: 1, duration: 0.2, ease: 'power2.out' });
            });
        });
    }, []);

    // --- Handlers for pickup/destination input and suggestions ---
    const handlePickupChange = async (e) => {
        setPickup(e.target.value)
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            setPickupSuggestions(response.data)
        } catch {}
    }
    const handleDestinationChange = async (e) => {
        setDestination(e.target.value)
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            })
            setDestinationSuggestions(response.data)
        } catch {}
    }
    const submitHandler=(e)=>{ e.preventDefault(); }

    // --- GSAP animations for panel transitions ---
    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, { height: '70%', padding: 24 })
            gsap.to(panelCloseRef.current, { opacity: 1 })
        } else {
            gsap.to(panelRef.current, { height: '0%', padding: 0 })
            gsap.to(panelCloseRef.current, { opacity: 0 })
        }
    }, [ panelOpen ])
    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(vehiclePanelRef.current, { transform: 'translateY(100%)' })
        }
    }, [ vehiclePanel ])
    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, { transform: 'translateY(0)', display: 'block' })
        } else {
            gsap.to(confirmRidePanelRef.current, { transform: 'translateY(100%)' })
        }
    }, [ confirmRidePanel ])
    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, { transform: 'translateY(0)', display: 'block' })
        } else {
            gsap.to(vehicleFoundRef.current, { transform: 'translateY(100%)' })
        }
    }, [ vehicleFound ])
    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, { transform: 'translateY(0)' })
        } else {
            gsap.to(waitingForDriverRef.current, { transform: 'translateY(100%)' })
        }
    }, [ waitingForDriver ])

    // --- Find trip: fetch fare and show vehicle panel ---
    async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
            params: { pickup, destination },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        setFare(response.data)
    }

    // --- Create ride: cancel previous, create new, and show looking for driver ---
    async function createRide() {
        setConfirmRidePanel(false)
        try {
            const token = getToken('user');
            if (currentRide?._id) {
                await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/cancel/${currentRide._id}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentRide(null);
                setShowLiveTracking(false);
            }
        } catch (error) {
            console.error("Error canceling previous ride:", error);
        }
        setVehicleFound(true)
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
            pickup, destination, vehicleType
        }, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        // Optionally handle response
    }

    // --- Cleanup: cancel ride on page unload or unmount ---
    useEffect(() => {
        const cleanupRide = async () => {
            try {
                const token = getToken('user');
                if (currentRide?._id) {
                    await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/update-status`, {
                        rideId: currentRide._id, status: 'cancelled'
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log("Ride cancelled due to page leave/refresh");
                }
            } catch (error) {
                console.error("Error cancelling ride during cleanup:", error);
            }
        };
        window.addEventListener('beforeunload', cleanupRide);
        return () => {
            window.removeEventListener('beforeunload', cleanupRide);
            cleanupRide();
        };
    }, [currentRide]);

    // --- On mount: check for active ride and show tracking if needed ---
    useEffect(() => {
        const fetchActiveRide = async () => {
            try {
                const token = getToken('user');
                if (!token || !user?._id) return;
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data && response.data.ride) {
                    const ride = response.data.ride;
                    if (ride.status === 'cancelled' || ride.status === 'completed') return;
                    if (ride.status === 'accepted') {
                        try {
                            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/update-status`, {
                                rideId: ride._id, status: 'cancelled'
                            }, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            return;
                        } catch (error) {
                            console.error("Error cancelling accepted ride:", error);
                        }
                    }
                    // Parse coordinates or geocode addresses
                    const pickupCoords = ride.pickup.split(',');
                    const destinationCoords = ride.destination.split(',');
                    if (pickupCoords.length === 2 && destinationCoords.length === 2) {
                        const pickupLat = parseFloat(pickupCoords[0]);
                        const pickupLng = parseFloat(pickupCoords[1]);
                        const destLat = parseFloat(destinationCoords[0]);
                        const destLng = parseFloat(destinationCoords[1]);
                        if (!isNaN(pickupLat) && !isNaN(pickupLng) && !isNaN(destLat) && !isNaN(destLng)) {
                            setCurrentRide({
                                _id: ride._id,
                                pickup: { lat: pickupLat, lng: pickupLng, address: ride.pickupAddress },
                                destination: { lat: destLat, lng: destLng, address: ride.destinationAddress }
                            });
                            setShowLiveTracking(true);
                        } else {
                            console.error("Invalid coordinates in ride data:", ride);
                        }
                    } else {
                        // Geocode addresses if coordinates are not available
                        const getCoordinates = async () => {
                            try {
                                const pickupResponse = await axios.get(
                                    `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                                        params: { address: ride.pickup },
                                        headers: { Authorization: `Bearer ${token}` }
                                    }
                                );
                                const destResponse = await axios.get(
                                    `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                                        params: { address: ride.destination },
                                        headers: { Authorization: `Bearer ${token}` }
                                    }
                                );
                                if (pickupResponse.data && destResponse.data) {
                                    setCurrentRide({
                                        _id: ride._id,
                                        pickup: { lat: pickupResponse.data.ltd, lng: pickupResponse.data.lng, address: ride.pickup },
                                        destination: { lat: destResponse.data.ltd, lng: destResponse.data.lng, address: ride.destination }
                                    });
                                    setShowLiveTracking(true);
                                } else {
                                    console.error("Could not geocode addresses:", ride);
                                }
                            } catch (error) {
                                console.error("Error geocoding addresses:", error);
                            }
                        };
                        getCoordinates();
                    }
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    // No active ride found
                } else {
                    console.error("Error fetching active ride:", error);
                }
            }
        };
        fetchActiveRide();
    }, [user]);

    // --- Listen for ride status updates and update tracking ---
    useEffect(() => {
        if (socket && currentRide?._id) {
            socket.on(`ride-status:${currentRide._id}`, (status) => {
                if (status === 'completed' || status === 'cancelled') {
                    setShowLiveTracking(false);
                    setCurrentRide(null);
                }
            });
            socket.emit('join-ride', { rideId: currentRide._id });
        }
        return () => {
            if (socket && currentRide?._id) {
                socket.off(`ride-status:${currentRide._id}`);
            }
        };
    }, [socket, currentRide]);

    // --- Get user's geolocation on mount ---
    useEffect(() => {
        const getUserLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setUserLocation({ lat: latitude, lng: longitude });
                        setMapCenter({ lat: latitude, lng: longitude });
                    },
                    (error) => {
                        console.error("Error getting user location:", error);
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                // Geolocation not supported
            }
        };
        getUserLocation();
    }, []);

    // --- Main UI rendering ---
    return (
        <div className='h-screen relative overflow-hidden'>
            {/* Header with logo and profile/logout links */}
            <div className='fixed p-1 top-0 flex items-center justify-between w-screen z-50 bg-white/80 backdrop-blur-sm shadow-sm'>
                <img className='w-26 header-element transform hover:scale-105 transition-transform duration-300' 
                    src="/ridezy-logo.png"
                    alt="Ridezy Logo"
                />
                <div className="flex items-center space-x-3 header-element">
                    <Link 
                        to='/user/profile' 
                        className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-50 transition-all duration-200'
                    >
                        <i className="text-xl ri-user-line"></i>
                    </Link>
                    <Link 
                        to='/user/logout' 
                        className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-50 transition-all duration-200'
                    >
                        <i className="text-xl ri-logout-box-r-line"></i>
                    </Link>
                </div>
            </div>
            {/* Live tracking overlay if user is on a ride */}
            {showLiveTracking && currentRide && (
                <div className="fixed inset-0 z-30 bg-white">
                    {/* Map type selector dropdown */}
                    <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, background: 'rgba(255,255,255,0.95)', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 4 }}>
                        <select
                            value={mapType}
                            onChange={e => setMapType(e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #ccc', fontSize: 15, background: 'white', fontWeight: 500 }}
                        >
                            <option value="roadmap">Geographical</option>
                            <option value="satellite">Satellite</option>
                            <option value="terrain">Terrain</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>
                    <div className="h-full">
                        <LiveTracking rideData={currentRide} mapType={mapType} />
                    </div>
                    {/* Button to close live tracking and return to booking UI */}
                    <button 
                        onClick={() => setShowLiveTracking(false)}
                        className="fixed z-40 bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200"
                    >
                        <i className="ri-arrow-down-line"></i>
                    </button>
                </div>
            )}
            {/* Main map and booking UI */}
            <div className='h-screen w-screen'>
                <div className="h-full relative" style={{overflow: 'hidden'}}>
                    {/* Floating map type button, hidden when panels are open */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        right: 40, 
                        transform: 'translateY(-50%)', 
                        zIndex: (panelOpen || vehiclePanel || confirmRidePanel || vehicleFound || waitingForDriver) ? -1 : 1010, 
                        pointerEvents: (panelOpen || vehiclePanel || confirmRidePanel || vehicleFound || waitingForDriver) ? 'none' : 'auto',
                        opacity: (panelOpen || vehiclePanel || confirmRidePanel || vehicleFound || waitingForDriver) ? 0 : 1,
                        transition: 'opacity 0.3s ease'
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
                    {/* Google Map display with user marker */}
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={mapCenter}
                        zoom={14}
                        options={{ 
                            disableDefaultUI: false,
                            zoomControl: true,
                            mapTypeControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            gestureHandling: 'greedy',
                            mapTypeId: mapType,
                        }}
                    >
                        {userLocation && (
                            <Marker
                                position={userLocation}
                                icon={{
                                    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                                    scaledSize: new window.google.maps.Size(40, 40)
                                }}
                            />
                        )}
                    </GoogleMap>
                </div>
            </div>
            {/* Booking panel and input UI */}
            <div className='flex flex-col justify-end h-screen absolute top-0 w-full z-40'>
                <div className='h-[35%] p-6 bg-white relative'>
                    <h5 ref={panelCloseRef} onClick={() => { setPanelOpen(false) }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={submitHandler}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <input
                            onClick={() => { setPanelOpen(true); setActiveField('pickup') }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onClick={() => { setPanelOpen(true); setActiveField('destination') }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full mt-3'
                            type="text"
                            placeholder='Enter your destination'
                        />
                    </form>
                    <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'
                    >
                        Find Trip
                    </button>
                </div>
                {/* Animated panel for location suggestions */}
                <div ref={panelRef} className='bg-white/95 backdrop-blur-sm h-0 shadow-lg'>
                    <LocationSearchPanel
                        suggestions={activeField === 'pickup' ? pickupSuggestions : destinationSuggestions}
                        setPanelOpen={setPanelOpen}
                        setVehiclePanel={setVehiclePanel}
                        setPickup={setPickup}
                        setDestination={setDestination}
                        activeField={activeField}
                    />
                </div>
            </div>
            {/* Animated panels for vehicle selection, ride confirmation, and driver search */}
            <div className="panels-container relative z-50">
                <div ref={vehiclePanelRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white/95 backdrop-blur-sm px-3 py-10 pt-12 shadow-lg'>
                    <VehiclePanel
                        selectVehicle={setVehicleType}
                        fare={fare} 
                        setConfirmRidePanel={setConfirmRidePanel} 
                        setVehiclePanel={setVehiclePanel} 
                    />
                </div>
                <div ref={confirmRidePanelRef} className='fixed w-full hidden z-40 bottom-0 translate-y-full bg-white/95 backdrop-blur-sm px-3 py-6 pt-12 shadow-lg'>
                    <ConfirmRide
                        pickup={pickup}
                        destination={destination}
                        fare={fare}
                        vehicleType={vehicleType}
                        setConfirmRidePanel={setConfirmRidePanel} 
                        setVehicleFound={setVehicleFound}
                        createRide={createRide}
                    />
                </div>
                <div ref={vehicleFoundRef} className='fixed w-full hidden z-40 bottom-0 translate-y-full bg-white/95 backdrop-blur-sm px-3 py-6 pt-12 shadow-lg'>
                    <LookingForDriver
                        createRide={createRide}
                        pickup={pickup}
                        destination={destination}
                        fare={fare}
                        vehicleType={vehicleType}
                        setVehicleFound={setVehicleFound}
                        ride={ride}
                    />
                </div>
                <div ref={waitingForDriverRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white/95 backdrop-blur-sm px-3 py-6 pt-12 shadow-lg'>
                    <WaitingForDriver
                        ride={ride}
                        setVehicleFound={setVehicleFound}
                        setWaitingForDriver={setWaitingForDriver}
                        waitingForDriver={waitingForDriver}
                    />
                </div>
            </div>
        </div>
    )
}

export default Home 