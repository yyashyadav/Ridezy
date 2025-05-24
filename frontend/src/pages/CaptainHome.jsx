import React, { useRef,useState,useContext,useEffect } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../../components/CaptainDetails'
import RidePopUp from '../../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../../components/ConfirmRidePopUp'
import AvailableRidesList from '../../components/AvailableRidesList'
import { CaptainDataContext } from '../context/CaptainContext'  
import { SocketContext } from '../context/SocketContext'
import axios from 'axios'
import LiveTracking from '../../components/LiveTracking'
import { getToken } from '../services/auth.service'
import { FaMapMarkedAlt } from 'react-icons/fa'

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const [showAvailableRides, setShowAvailableRides] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const ridePopupPanelRef=useRef(null);
  const confirmRidePopupPanelRef=useRef(null);
  const availableRidesPanelRef = useRef(null);
  const refreshButtonRef = useRef(null);
  const [ride, setRide] = useState(null);
  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);
  const [mapType, setMapType] = useState('roadmap');
  const [showMapTypeDropdown, setShowMapTypeDropdown] = useState(false);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the panel and the refresh button
      if (showAvailableRides && 
          availableRidesPanelRef.current && 
          !availableRidesPanelRef.current.contains(event.target) &&
          refreshButtonRef.current &&
          !refreshButtonRef.current.contains(event.target)) {
        setShowAvailableRides(false);
      }
    };

    // Add click listener to the document
    document.addEventListener('click', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAvailableRides]);

  // Fetch available rides
  const fetchAvailableRides = async () => {
    try {
      const token = getToken('captain');
      if (!token) return;

      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/available`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAvailableRides(response.data.rides || []);
    } catch (error) {
      console.error('Error fetching available rides:', error);
      setAvailableRides([]);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    if (showAvailableRides) {
      // If panel is open, just close it
      setShowAvailableRides(false);
    } else {
      // If panel is closed, fetch rides and show panel
      await fetchAvailableRides();
      setShowAvailableRides(true);
    }
  };

  useEffect(() => {
    socket.emit('join', {
        userId: captain._id,
        userType: 'captain'
    })
    //this is used tp get curreent location continously
    const updateLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                console.log({ 
                    userId: captain._id,
                    location: {
                        ltd: position.coords.latitude,
                        lng: position.coords.longitude
                    }});
                socket.emit('update-location-captain', {
                    userId: captain._id,
                    location: {
                        ltd: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                })
            })
        }
    }

    const locationInterval = setInterval(updateLocation, 10000)
    updateLocation()

    return () => clearInterval(locationInterval)
  }, [])

  // Handle new ride requests
  useEffect(() => {
    if (socket) {
        socket.on('new-ride', (data) => {
            console.log('New ride received:', data);
            setAvailableRides(prev => [...prev, data]);
            // Only show the panel if we're not currently on a ride
            if (!ride) {
                setShowAvailableRides(true);
            }
        });

        socket.on('ride-no-longer-available', (data) => {
            setAvailableRides(prev => prev.filter(ride => ride._id !== data.rideId));
            if (data.rideId === ride?._id) {
                setRidePopupPanel(false);
                setRide(null);
                // If there are available rides, show the notification
                if (availableRides.length > 0) {
                    setShowAvailableRides(true);
                }
            }
        });

        return () => {
            socket.off('new-ride');
            socket.off('ride-no-longer-available');
        };
    }
  }, [socket, ride, availableRides]);

  const handleAcceptRide = async (selectedRide) => {
    try {
        const token = getToken('captain');
        if (!token) {
            console.error('No captain token found');
            return;
        }

        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
            rideId: selectedRide._id,
            otp: selectedRide.otp || "000000"
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            socket.emit('ride-accepted', { rideId: selectedRide._id });
            // Remove only the accepted ride from available rides
            setAvailableRides(prev => prev.filter(ride => ride._id !== selectedRide._id));
            // Close the available rides panel
            setShowAvailableRides(false);
            setRidePopupPanel(false);
            setConfirmRidePopupPanel(true);
            setRide(response.data);
        }
    } catch (error) {
        console.error('Error confirming ride:', error);
    }
  };

  const handleRejectRide = (rideId) => {
    setAvailableRides(prev => prev.filter(ride => ride._id !== rideId));
    if (availableRides.length === 1) {
        setShowAvailableRides(false);
    }
  };

  useGSAP(()=>{
    if(ridePopupPanel){
        gsap.to(ridePopupPanelRef.current,{
            transform:'translateY(0)'
        })
    }else{
        gsap.to(ridePopupPanelRef.current,{
            transform:'translateY(100%)'
        })
    }
  },[ridePopupPanel])

  useGSAP(()=>{
    if(confirmRidePopupPanel){
        gsap.to(confirmRidePopupPanelRef.current,{
            transform:'translateY(0)'
        })
    }else{
        gsap.to(confirmRidePopupPanelRef.current,{
            transform:'translateY(100%)'
        })
    }
  },[confirmRidePopupPanel])

  useEffect(() => {
    // Add subtle animations for the header elements
    gsap.from('.header-element', {
        y: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
    });

    // Add subtle hover animations for buttons
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
  }, []);

  return (
    <div className='h-screen bg-gray-50'>
        <div className='fixed p-1 top-0 flex items-center justify-between w-screen z-50 bg-white/80 backdrop-blur-lg shadow-sm'>
            <img 
                className='w-26 header-element transform hover:scale-105 transition-transform duration-300' 
                src="/ridezy-logo.png"
                alt="Ridezy Logo"
            />
            <div className="flex items-center gap-3 header-element">
                <button 
                    ref={refreshButtonRef}
                    onClick={handleRefresh}
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 relative'
                >
                    <i className="text-xl ri-route-line"></i>
                    {availableRides.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {availableRides.length}
                        </span>
                    )}
                </button>
                <Link 
                    to='/captain-profile' 
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-50 transition-all duration-200'
                >
                    <i className="text-xl ri-user-line"></i>
                </Link>
                <Link 
                    to='/captain/logout' 
                    className='h-10 w-10 bg-white flex items-center justify-center rounded-full shadow-md hover:bg-gray-50 transition-all duration-200'
                >
                    <i className="text-xl ri-logout-box-r-line"></i>
                </Link>
            </div>
        </div>
        <div className='h-4/6 relative'>
            <LiveTracking rideData={null} mapType={mapType} />
            {/* Floating Map Type Button */}
            <div style={{ 
                position: 'absolute', 
                top: '50%', 
                right: 40, 
                transform: 'translateY(-50%)', 
                zIndex: (ridePopupPanel || confirmRidePopupPanel || showAvailableRides) ? -1 : 1010, 
                pointerEvents: (ridePopupPanel || confirmRidePopupPanel || showAvailableRides) ? 'none' : 'auto',
                opacity: (ridePopupPanel || confirmRidePopupPanel || showAvailableRides) ? 0 : 1,
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
        </div>
        <div className='h-2/6 p-6 bg-white shadow-lg'>
            <CaptainDetails/>
        </div>
        {showAvailableRides && (
            <div 
                ref={availableRidesPanelRef} 
                className="fixed top-20 right-4 w-72 bg-white rounded-lg shadow-xl z-50 transform transition-all duration-300"
            >
                <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-lg">
                    <h2 className="text-base font-semibold text-gray-800">Available Rides</h2>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        {availableRides.length} new
                    </span>
                </div>
                {availableRides.length > 0 ? (
                    <AvailableRidesList 
                        rides={availableRides}
                        onAccept={handleAcceptRide}
                        onReject={handleRejectRide}
                    />
                ) : (
                    <div className="p-6 text-center">
                        <div className="h-14 w-14 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <i className="ri-route-line text-gray-400 text-2xl"></i>
                        </div>
                        <p className="text-gray-700 font-medium">No rides available</p>
                        <p className="text-sm text-gray-500 mt-1">We'll notify you when new rides come in</p>
                    </div>
                )}
            </div>
        )}
        <div 
            ref={ridePopupPanelRef} 
            className='fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 pt-12 bg-white shadow-lg'
        >
            <RidePopUp 
                ride={ride}
                setRidePopupPanel={setRidePopupPanel} 
                setConfirmRidePopupPanel={setConfirmRidePopupPanel}
                confirmRide={() => handleAcceptRide(ride)}
            />
        </div>
        <div 
            ref={confirmRidePopupPanelRef} 
            className='fixed w-full z-10 h-screen bottom-0 translate-y-full px-3 py-6 pt-12 bg-white shadow-lg'
        >
            <ConfirmRidePopUp
                ride={ride}
                setConfirmRidePopupPanel={setConfirmRidePopupPanel} 
                setRidePopupPanel={setRidePopupPanel} 
            />
        </div>
    </div>
  )
}

export default CaptainHome