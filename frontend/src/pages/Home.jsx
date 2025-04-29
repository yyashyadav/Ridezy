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
import { GoogleMap } from '@react-google-maps/api';
import { getToken } from '../services/auth.service';

const Home = () => {

    const [ pickup, setPickup ] = useState('')
    const [ destination, setDestination ] = useState('')
    const [ panelOpen, setPanelOpen ] = useState(false)
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

    const navigate = useNavigate()

    const { socket } = useContext(SocketContext)
    const { user } = useContext(UserDataContext)

    useEffect(() => {
        socket.emit("join", { userType: "user", userId: user._id })

        socket.on('ride-confirmed', ride => {
            setVehicleFound(false)
            setWaitingForDriver(true)
            setRide(ride)
        })

        socket.on('ride-started', ride => {
            console.log("ride")
            setWaitingForDriver(false)
            navigate('/riding', { state: { ride } })
        })

        return () => {
            socket.off('ride-confirmed')
            socket.off('ride-started')
        }
    }, [user, socket, navigate])

    //this for handlingig=ng pikups
    const handlePickupChange = async (e) => {
        setPickup(e.target.value)
        
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }

            })
            setPickupSuggestions(response.data)
        } catch {
            // handle error
        }
    }
    const handleDestinationChange = async (e) => {
        setDestination(e.target.value)
        
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/maps/get-suggestions`, {
                params: { input: e.target.value },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
            setDestinationSuggestions(response.data)
        } catch {
            // handle error
        }
    }

    const submitHandler=(e)=>{
        e.preventDefault();
    }

    useGSAP(function () {
        if (panelOpen) {
            gsap.to(panelRef.current, {
                height: '70%',
                padding: 24
            })
            gsap.to(panelCloseRef.current, {
                opacity: 1
            })
        } else {
            gsap.to(panelRef.current, {
                height: '0%',
                padding: 0
            })
            gsap.to(panelCloseRef.current, {
                opacity: 0
            })
        }
    }, [ panelOpen ])

    useGSAP(function () {
        if (vehiclePanel) {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(vehiclePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehiclePanel ])

    useGSAP(function () {
        if (confirmRidePanel) {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(0)',
                display: 'block'
            })
        } else {
            gsap.to(confirmRidePanelRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ confirmRidePanel ])

    useGSAP(function () {
        if (vehicleFound) {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(0)',
                display: 'block'
            })
        } else {
            gsap.to(vehicleFoundRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ vehicleFound ])

    useGSAP(function () {
        if (waitingForDriver) {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(0)'
            })
        } else {
            gsap.to(waitingForDriverRef.current, {
                transform: 'translateY(100%)'
            })
        }
    }, [ waitingForDriver ])

    async function findTrip() {
        setVehiclePanel(true)
        setPanelOpen(false)

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/get-fare`, {
            params: { pickup, destination },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        // console.log(response.data);
        setFare(response.data)

    }

    async function createRide() {
        setConfirmRidePanel(false)
        
        // Then show looking for driver panel
        setVehicleFound(true)
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/create`, {
            pickup,
            destination,
            vehicleType
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        console.log(response.data);
    }

    // Check for active rides when component mounts
    useEffect(() => {
        if (user && user._id) {
            // Fetch active rides for this user
            axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            })
                .then(response => {
                    if (response.data && response.data.ride) {
                        const ride = response.data.ride;
                        
                        // Parse and validate coordinates
                        const pickupCoords = ride.pickup.split(',');
                        const destinationCoords = ride.destination.split(',');
                        
                        // Check if we have valid coordinates
                        if (pickupCoords.length === 2 && destinationCoords.length === 2) {
                            const pickupLat = parseFloat(pickupCoords[0]);
                            const pickupLng = parseFloat(pickupCoords[1]);
                            const destLat = parseFloat(destinationCoords[0]);
                            const destLng = parseFloat(destinationCoords[1]);
                            
                            // Validate that all coordinates are valid numbers
                            if (!isNaN(pickupLat) && !isNaN(pickupLng) && 
                                !isNaN(destLat) && !isNaN(destLng)) {
                                
                                setCurrentRide({
                                    _id: ride._id,
                                    pickup: {
                                        lat: pickupLat,
                                        lng: pickupLng,
                                        address: ride.pickupAddress
                                    },
                                    destination: {
                                        lat: destLat,
                                        lng: destLng,
                                        address: ride.destinationAddress
                                    }
                                });
                                setShowLiveTracking(true);
                            } else {
                                console.error("Invalid coordinates in ride data:", ride);
                            }
                        } else {
                            // If coordinates are not in the correct format, try to get them from the addresses
                            const getCoordinates = async () => {
                                try {
                                    // Use backend service to get coordinates
                                    const pickupResponse = await axios.get(
                                        `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                                            params: { address: ride.pickup },
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem('token')}`
                                            }
                                        }
                                    );
                                    const destResponse = await axios.get(
                                        `${import.meta.env.VITE_BASE_URL}/maps/get-coordinates`, {
                                            params: { address: ride.destination },
                                            headers: {
                                                Authorization: `Bearer ${localStorage.getItem('token')}`
                                            }
                                        }
                                    );

                                    if (pickupResponse.data && destResponse.data) {
                                        setCurrentRide({
                                            _id: ride._id,
                                            pickup: {
                                                lat: pickupResponse.data.ltd,
                                                lng: pickupResponse.data.lng,
                                                address: ride.pickup
                                            },
                                            destination: {
                                                lat: destResponse.data.ltd,
                                                lng: destResponse.data.lng,
                                                address: ride.destination
                                            }
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
                })
                .catch(error => {
                    console.error("Error fetching active ride:", error);
                });
        }
    }, [user]);

    // Listen for ride status updates
    useEffect(() => {
        if (socket && currentRide?._id) {
            socket.on(`ride-status:${currentRide._id}`, (status) => {
                if (status === 'completed') {
                    setShowLiveTracking(false);
                    setCurrentRide(null);
                }
            });
            
            // Join the ride room for updates
            socket.emit('join-ride', { rideId: currentRide._id });
        }
        
        return () => {
            if (socket && currentRide?._id) {
                socket.off(`ride-status:${currentRide._id}`);
            }
        };
    }, [socket, currentRide]);

    return (
        <div className='h-screen relative overflow-hidden'>
            <div className='fixed p-4 top-0 flex items-center justify-between w-screen z-50'>
                <img className='w-16' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="Uber Logo"/>
                <div className="flex items-center space-x-3">
                    <Link 
                        to='/user/profile' 
                        className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100 transition-colors'
                    >
                        <i className="text-xl ri-user-line"></i>
                    </Link>
                    <Link 
                        to='/user/logout' 
                        className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-100 transition-colors'
                    >
                        <i className="text-xl ri-logout-box-r-line"></i>
                    </Link>
                </div>
            </div>
            {/* Show live tracking if there's an active ride */}
            {showLiveTracking && currentRide && (
                <div className="fixed inset-0 z-30 bg-white">
                    <div className="h-full">
                        <LiveTracking rideData={currentRide} />
                    </div>
                    {/* Add a button to toggle between map and input fields */}
                    <button 
                        onClick={() => setShowLiveTracking(false)}
                        className="fixed z-40 bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full"
                    >
                        <i className="ri-arrow-down-line"></i>
                    </button>
                </div>
            )}

            {/* <img className='w-16 absolute left-5 top-5 z-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" /> */}
            <div className='h-screen w-screen'>
                {/* Default map with no tracking data */}
                <div className="h-full">
                    <GoogleMap
                        mapContainerStyle={{
                            width: '100%',
                            height: '100%'
                        }}
                        center={{ lat: 28.6139, lng: 77.2090 }}
                        zoom={14}
                        options={{ 
                            disableDefaultUI: true,
                            zoomControl: true
                        }}
                    >
                        {/* No markers or routes */}
                    </GoogleMap>
                </div>
            </div>
            <div className='flex flex-col justify-end h-screen absolute top-0 w-full z-40'>
                <div className=' h-[30%] p-6 bg-white relative'>
                    <h5 ref={panelCloseRef} onClick={() => {
                        setPanelOpen(false)
                    }} className='absolute opacity-0 right-6 top-6 text-2xl'>
                        <i className="ri-arrow-down-wide-line"></i>
                    </h5>
                    <h4 className='text-2xl font-semibold'>Find a trip</h4>
                    <form className='relative py-3' onSubmit={(e) => {
                        submitHandler(e)
                    }}>
                        <div className="line absolute h-16 w-1 top-[50%] -translate-y-1/2 left-5 bg-gray-700 rounded-full"></div>
                        <input
                            onClick={() => {
                                setPanelOpen(true)
                                setActiveField('pickup')
                                
                            }}
                            value={pickup}
                            onChange={handlePickupChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full'
                            type="text"
                            placeholder='Add a pick-up location'
                        />
                        <input
                            onClick={() => {
                                setPanelOpen(true)
                                setActiveField('destination')
                               
                                
                            }}
                            value={destination}
                            onChange={handleDestinationChange}
                            className='bg-[#eee] px-12 py-2 text-lg rounded-lg w-full  mt-3'
                            type="text"
                            placeholder='Enter your destination' />
                    </form>
                    <button
                        onClick={findTrip}
                        className='bg-black text-white px-4 py-2 rounded-lg mt-3 w-full'>
                        Find Trip
                    </button>
                </div>
                <div ref={panelRef} className='bg-white h-0'>
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
            <div className="panels-container relative z-50">
                <div ref={vehiclePanelRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-3 py-10 pt-12'>
                    <VehiclePanel
                        selectVehicle={setVehicleType}
                        fare={fare} 
                        setConfirmRidePanel={setConfirmRidePanel} 
                        setVehiclePanel={setVehiclePanel} 
                    />
                </div>
                <div ref={confirmRidePanelRef} className='fixed w-full hidden z-40 bottom-0 translate-y-full bg-white px-3 py-6  pt-12'>
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
                <div ref={vehicleFoundRef} className='fixed w-full hidden z-40 bottom-0 translate-y-full bg-white px-3 py-6  pt-12'>
                    <LookingForDriver
                        createRide={createRide}
                        pickup={pickup}
                        destination={destination}
                        fare={fare}
                        vehicleType={vehicleType}
                        setVehicleFound={setVehicleFound}
                    />
                </div>
                <div ref={waitingForDriverRef} className='fixed w-full z-40 bottom-0 translate-y-full bg-white px-3 py-6 pt-12'>
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