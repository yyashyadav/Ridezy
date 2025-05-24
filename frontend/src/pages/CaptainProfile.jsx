import React, { useContext, useEffect, useState } from 'react';
import { CaptainDataContext } from '../context/CaptainContext';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'remixicon/fonts/remixicon.css';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const CaptainProfile = () => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    vehicleType: '',
    plate: '',
    color: ''
  });

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

  useEffect(() => {
    if (captain) {
      setFormData({
        firstname: captain.fullname.firstname || '',
        lastname: captain.fullname.lastname || '',
        email: captain.email || ' ',
        phone: captain.phone || ' ',
        vehicleType: captain.vehicle?.vehicleType || '',
        plate: captain.vehicle?.plate || '',
        color: captain.vehicle?.color || ''
      });
    }
  }, [captain]);

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
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.02,
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, or JPG image.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('File size too large. Maximum size is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      setUploading(true);
      setError(null);
      const token = localStorage.getItem('captainToken');
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/profile/photo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.profilePhoto) {
        setCaptain({ ...captain, profilePhoto: response.data.profilePhoto });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError(error.response?.data?.message || 'Failed to upload profile photo');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      const token = localStorage.getItem('captainToken');
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/captains/profile`,
        {
          fullname: {
            firstname: formData.firstname,
            lastname: formData.lastname
          },
          email: formData.email,
          phone: formData.phone,
          vehicle: {
            vehicleType: formData.vehicleType,
            plate: formData.plate,
            color: formData.color
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCaptain(response.data.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  if (!captain) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
        <p className="text-lg text-gray-600">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <button 
          onClick={() => navigate('/captain-home')}
          className="text-gray-600 hover:text-gray-800 transition-colors header-element"
        >
          <i className="ri-arrow-left-line text-2xl"></i>
        </button>
        <h1 className="text-xl font-bold header-element">Captain Profile</h1>
        <button 
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-800 transition-colors header-element"
        >
          <i className="ri-logout-box-r-line text-2xl"></i>
        </button>
      </div>

      {/* Profile Info */}
      <div className="bg-white/90 backdrop-blur-sm p-6 shadow-lg mx-4 my-4 rounded-xl">
        <div className="flex items-center mb-6">
          <div className="relative">
            {captain.profilePhoto ? (
              <img 
                src={captain.profilePhoto} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover shadow-md transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 shadow-md">
                {captain.fullname.firstname.charAt(0).toUpperCase()}
              </div>
            )}
            {isEditing && (
              <label 
                htmlFor="photo-upload"
                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors shadow-md"
              >
                <i className="ri-camera-line"></i>
              </label>
            )}
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {captain.fullname.firstname} {captain.fullname.lastname}
            </h2>
            <p className="text-gray-600 mt-1">{captain.email}</p>
            <p className="text-gray-600">{captain.phone || 'Not set'}</p>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="mb-6">
          <button
            onClick={(e) => {
              if (isEditing) {
                e.preventDefault();
                handleSubmit(e);
              } else {
                setIsEditing(true);
              }
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all duration-300 shadow-md"
            disabled={uploading}
          >
            {uploading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg shadow-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg shadow-sm">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button 
            className={`py-3 px-6 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`py-3 px-6 ${activeTab === 'rides' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            onClick={() => setActiveTab('rides')}
          >
            Ride History
          </button>
          <button 
            className={`py-3 px-6 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 font-semibold text-blue-600' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Edit Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                      <input
                        type="text"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                      <input
                        type="text"
                        name="plate"
                        value={formData.plate}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Color</label>
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                  <div className="bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Name</span>
                        <span className="font-medium text-gray-800">
                          {captain.fullname.firstname} {captain.fullname.lastname}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-2 p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Email</span>
                        <span className="font-medium text-gray-800">{captain.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Phone</span>
                        <span className="font-medium text-gray-800">{captain.phone || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Information</h3>
                  <div className="bg-gray-50/80 backdrop-blur-sm p-3 rounded-xl shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Vehicle Type</span>
                        <span className="font-medium text-gray-800">{captain.vehicle?.vehicleType || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Plate Number</span>
                        <span className="font-medium text-gray-800">{captain.vehicle?.plate || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                        <span className="text-gray-600">Color</span>
                        <span className="font-medium text-gray-800">{captain.vehicle?.color || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rides' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Rides</h3>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">{error}</div>
            ) : rideHistory.length > 0 ? (
              <div className="space-y-4">
                {rideHistory.map((ride) => (
                  <div key={ride._id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-gray-800">
                          {ride.pickupAddress} → {ride.destinationAddress}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(ride.bookingTime)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                        {ride.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium">Fare: ₹{ride.fare}</p>
                      {ride.distance && (
                        <p className="mt-1">Distance: {(ride.distance / 1000).toFixed(1)} km</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                No ride history available
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-800">Notifications</h4>
                  <p className="text-sm text-gray-600">Manage your notification preferences</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-800">Payment Settings</h4>
                  <p className="text-sm text-gray-600">Manage your payment settings</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-800">Privacy</h4>
                  <p className="text-sm text-gray-600">Manage your privacy settings</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
                <div>
                  <h4 className="font-medium text-gray-800">Help & Support</h4>
                  <p className="text-sm text-gray-600">Get help with your account</p>
                </div>
                <i className="ri-arrow-right-s-line text-xl text-gray-400"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptainProfile;