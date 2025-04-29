import React, { useContext, useState, useEffect } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const CaptainProfile = () => {
    const { captain, setCaptain } = useContext(CaptainDataContext);
    const [rideHistory, setRideHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch captain's ride history
        const fetchRideHistory = async () => {
            const token = localStorage.getItem('captainToken');
            console.log('Captain Token:', token);
            console.log('Captain Data:', captain);
            
            if (!captain || !token) {
                console.log('No captain or token found');
                setLoading(false);
                return;
            }

            try {
                console.log('Making API request to:', `${import.meta.env.VITE_BASE_URL}/rides/captain/history`);
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('API Response:', response.data);
                // Sort rides by booking time (newest first)
                const sortedRides = response.data.rides.sort((a, b) => 
                    new Date(b.bookingTime) - new Date(a.bookingTime)
                );
                setRideHistory(sortedRides || []);
            } catch (error) {
                console.error('Error fetching ride history:', error.response || error);
                if (error.response && error.response.status === 404) {
                    setError('Ride history endpoint not found. Please check if the backend server is running.');
                } else if (error.response && error.response.status === 401) {
                    setError('Authentication failed. Please log in again.');
                    navigate('/captain-login');
                } else {
                    setError('Failed to load ride history. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRideHistory();
    }, [captain]);

    const handleLogout = () => {
        localStorage.removeItem('captainToken');
        setCaptain(null);
        navigate('/captain-login');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!captain) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-600">Please log in to view your profile</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-md p-4 flex justify-between items-center">
                <button 
                    onClick={() => navigate('/captain-home')}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <i className="ri-arrow-left-line text-2xl"></i>
                </button>
                <h1 className="text-xl font-bold">Captain Profile</h1>
                <button 
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800"
                >
                    <i className="ri-logout-box-r-line text-2xl"></i>
                </button>
            </div>

            {/* Profile Info */}
            <div className="bg-white p-6 shadow-md">
                <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                        <i className="ri-user-line text-4xl text-gray-600"></i>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">
                            {`${captain.fullname.firstname} ${captain.fullname.lastname}`}
                        </h2>
                        <p className="text-gray-600">{captain.email}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b mb-4">
                    <button 
                        className={`py-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button 
                        className={`py-2 px-4 ${activeTab === 'rides' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
                        onClick={() => setActiveTab('rides')}
                    >
                        Ride History
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Name</span>
                                    <span className="font-medium">{`${captain.fullname.firstname} ${captain.fullname.lastname}`}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Email</span>
                                    <span className="font-medium">{captain.email}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Vehicle Type</span>
                                    <span className="font-medium capitalize">{captain.vehicle.vehicleType}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Color</span>
                                    <span className="font-medium capitalize">{captain.vehicle.color}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Plate Number</span>
                                    <span className="font-medium uppercase">{captain.vehicle.plate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Capacity</span>
                                    <span className="font-medium">{captain.vehicle.capacity} persons</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'rides' && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
                        {loading ? (
                            <div className="text-center py-4">Loading ride history...</div>
                        ) : error ? (
                            <div className="text-center py-4 text-red-500">{error}</div>
                        ) : rideHistory.length > 0 ? (
                            <div className="space-y-4">
                                {rideHistory.map((ride) => {
                                    // Format booking time
                                    const bookingDate = ride.bookingTime ? new Date(ride.bookingTime) : null;
                                    const formattedBookingDate = bookingDate ? bookingDate.toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : 'Not known';
                                    const formattedBookingTime = bookingDate ? bookingDate.toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : 'Not known';

                                    // Get status color and text
                                    const getStatusInfo = (status) => {
                                        switch (status) {
                                            case 'completed':
                                                return {
                                                    color: 'bg-green-100 text-green-800',
                                                    text: 'Completed'
                                                };
                                            case 'cancelled':
                                                return {
                                                    color: 'bg-red-100 text-red-800',
                                                    text: 'Cancelled'
                                                };
                                            case 'ongoing':
                                                return {
                                                    color: 'bg-blue-100 text-blue-800',
                                                    text: 'Ongoing'
                                                };
                                            case 'pending':
                                                return {
                                                    color: 'bg-yellow-100 text-yellow-800',
                                                    text: 'Pending'
                                                };
                                            default:
                                                return {
                                                    color: 'bg-gray-100 text-gray-800',
                                                    text: status.charAt(0).toUpperCase() + status.slice(1)
                                                };
                                        }
                                    };

                                    const statusInfo = getStatusInfo(ride.status);

                                    return (
                                        <div key={ride._id} className={`bg-white p-4 rounded-lg shadow-sm ${ride.status === 'cancelled' ? 'border border-red-200' : ''}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <div className="text-sm text-gray-500">
                                                        <span>Booked on: {formattedBookingDate}</span>
                                                        <span className="ml-2">{formattedBookingTime}</span>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                                    {statusInfo.text}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">From</span>
                                                    <span className="font-medium">{ride.pickupAddress}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">To</span>
                                                    <span className="font-medium">{ride.destinationAddress}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Fare</span>
                                                    <span className="font-medium">₹{ride.fare}</span>
                                                </div>
                                                {ride.duration && (
                                                    <div className="flex justify-between text-sm text-gray-500">
                                                        <span>Duration</span>
                                                        <span>{Math.round(ride.duration / 60)} mins</span>
                                                    </div>
                                                )}
                                                {ride.distance && (
                                                    <div className="flex justify-between text-sm text-gray-500">
                                                        <span>Distance</span>
                                                        <span>{(ride.distance / 1000).toFixed(1)} km</span>
                                                    </div>
                                                )}
                                            </div>
                                            {ride.user && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <div className="text-sm font-medium text-gray-600 mb-1">User Details</div>
                                                    <div className="text-sm">
                                                        <span className="font-medium">{ride.user.fullname}</span>
                                                        <span className="ml-2 text-gray-500">{ride.user.phone}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                No ride history available
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptainProfile; 