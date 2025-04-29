import React, { useContext, useEffect, useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';

const CaptainProfile = () => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const token = localStorage.getItem('captainToken');
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain/history`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRideHistory(response.data.rides || []);
      } catch (err) {
        console.error('Error fetching ride history:', err);
        setError('Failed to load ride history');
      } finally {
        setLoading(false);
      }
    };

    fetchRideHistory();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('captainToken');
    setCaptain(null);
    if (socket) {
      socket.disconnect();
    }
    navigate('/captain-login');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
        return 'bg-yellow-100 text-yellow-800';
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
              {captain.fullname.firstname} {captain.fullname.lastname}
            </h2>
            <p className="text-gray-600">{captain.email}</p>
            <p className="text-gray-600">{captain.phone || 'Not set'}</p>
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
          <button 
            className={`py-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-black font-semibold' : 'text-gray-500'}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">
                    {captain.fullname.firstname} {captain.fullname.lastname}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{captain.email}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{captain.phone || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Vehicle Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Vehicle Type</span>
                  <span className="font-medium">{captain.vehicle?.vehicleType || 'Not set'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Plate Number</span>
                  <span className="font-medium">{captain.vehicle?.plate || 'Not set'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Color</span>
                  <span className="font-medium">{captain.vehicle?.color || 'Not set'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">{captain.vehicle?.capacity || 'Not set'} passengers</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rides' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Recent Rides</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : rideHistory.length > 0 ? (
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <div key={ride._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          {ride.pickupAddress} → {ride.destinationAddress}
                        </p>
                        <p className="text-sm text-gray-500">{formatDate(ride.bookingTime)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Fare: ₹{ride.fare}</p>
                      {ride.distance && (
                        <p>Distance: {(ride.distance / 1000).toFixed(1)} km</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No ride history available
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-gray-600">Manage your notification preferences</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl"></i>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Payment Settings</h4>
                  <p className="text-sm text-gray-600">Manage your payment settings</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl"></i>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Privacy</h4>
                  <p className="text-sm text-gray-600">Manage your privacy settings</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl"></i>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Help & Support</h4>
                  <p className="text-sm text-gray-600">Get help with your account</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainProfile; 