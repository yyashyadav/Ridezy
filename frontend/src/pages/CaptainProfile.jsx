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
            if (!captain || !token) {
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain/history`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                // Sort rides by date (newest first)
                const sortedRides = response.data.rides.sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                setRideHistory(sortedRides || []);
            } catch (error) {
                console.error('Error fetching ride history:', error);
                setError('Failed to load ride history');
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
                                {rideHistory.map((ride) => (
                                    <div key={ride._id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-medium">Ride #{ride._id.slice(-6)}</div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(ride.createdAt)} at {formatTime(ride.createdAt)}
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                                                {ride.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">From</span>
                                                <span className="font-medium">{ride.pickupAddress}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">To</span>
                                                <span className="font-medium">{ride.destinationAddress}</span>
                                            </div>
                                            {ride.fare && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Fare</span>
                                                    <span className="font-medium">₹{ride.fare}</span>
                                                </div>
                                            )}
                                            {ride.distance && (
                                                <div className="flex justify-between text-sm text-gray-500">
                                                    <span>Distance</span>
                                                    <span>{(ride.distance / 1000).toFixed(1)} km</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500">No ride history available</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptainProfile; 