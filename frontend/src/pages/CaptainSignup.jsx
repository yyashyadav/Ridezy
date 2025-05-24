// Import React and its hooks for state, context, and effects
import React, { useContext, useState, useEffect } from 'react'
// Import Link for navigation and useNavigate for programmatic navigation
import { Link, useNavigate } from 'react-router-dom'
// Import CaptainDataContext for global captain state
import { CaptainDataContext } from '../context/CaptainContext';
// Import toast for notifications
import { toast } from 'react-toastify';
// Import axios for HTTP requests
import axios from 'axios';
// Import GSAP for animations
import gsap from 'gsap';

// CaptainSignup component for captain registration
const CaptainSignup = () => {
    // State for form data, including nested objects for fullname and vehicle
    const [formData, setFormData] = useState({
        fullname: {
            firstname: '', // Captain's first name
            lastname: ''   // Captain's last name
        },
        email: '', // Captain's email
        password: '', // Captain's password
        vehicle: {
            color: '', // Vehicle color
            plate: '', // Vehicle license plate
            capacity: '', // Vehicle seating capacity
            vehicleType: '' // Vehicle type
        },
        location: {
            type: 'Point', // GeoJSON type
            coordinates: [0, 0] // Default coordinates
        }
    });

    // useNavigate hook for navigation
    const navigate = useNavigate();

    // Access captain state and setter from context
    const {captain, setCaptain} = useContext(CaptainDataContext);

    // Animate form elements on mount
    useEffect(() => {
        // Animate elements with class 'form-element'
        gsap.from('.form-element', {
            y: 20, // Start 20px below
            opacity: 0, // Start invisible
            duration: 0.6, // Animation duration
            stagger: 0.1, // Stagger each element
            ease: 'power2.out' // Easing function
        });
    }, []);

    // Handle input changes for both nested and top-level fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            // For nested fields (e.g., fullname.firstname)
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            // For top-level fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle form submission for registration
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Frontend validation for all fields
        if (!formData.fullname.firstname || formData.fullname.firstname.length < 3) {
            toast.error('First name must be at least 3 characters long');
            return;
        }

        if (!formData.fullname.lastname || formData.fullname.lastname.length < 3) {
            toast.error('Last name must be at least 3 characters long');
            return;
        }

        if (!formData.email || !formData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (!formData.vehicle.color || formData.vehicle.color.length < 3) {
            toast.error('Vehicle color must be at least 3 characters long');
            return;
        }

        if (!formData.vehicle.plate || formData.vehicle.plate.length < 3) {
            toast.error('Vehicle plate must be at least 3 characters long');
            return;
        }

        if (!formData.vehicle.capacity || isNaN(formData.vehicle.capacity) || parseInt(formData.vehicle.capacity) < 1) {
            toast.error('Please enter a valid vehicle capacity (minimum 1)');
            return;
        }

        // Map frontend vehicle types to backend expected values
        const vehicleTypeMap = {
            'car': 'car',
            'auto': 'auto',
            'motorcycle': 'motorcycle'
        };

        if (!formData.vehicle.vehicleType || !vehicleTypeMap[formData.vehicle.vehicleType]) {
            toast.error('Please select a valid vehicle type');
            return;
        }

        try {
            // Send registration request to backend
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/captains/register`,
                formData
            );

            if (response.status === 201) {
                const data = response.data;
                setCaptain(data.captain); // Set captain in context
                localStorage.setItem('captainToken', data.token); // Store token
                toast.success('Registration successful! Please login.');
                navigate('/captain-login'); // Redirect to login page
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(msg); // Show error notification
        }
    };

    return (
        // Main container with gradient background and padding
        <div className='min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-green-100 p-7'>
            <div className='max-w-md mx-auto w-full'>
                {/* Logo and welcome text */}
                <div className='text-center mb-10 form-element'>
                    <img className='w-45 mx-auto mb-4' src="/ridezy-logo.png" alt="Ridezy Logo" />
                    <h1 className='text-3xl font-bold text-gray-800'>Join as a Captain</h1>
                    <p className='text-gray-600 mt-2'>Start your journey with us</p>
                </div>

                {/* Signup form */}
                <form onSubmit={handleSubmit} className='space-y-6'>
                    {/* Name fields */}
                    <div className='grid grid-cols-2 gap-4 form-element'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>First Name</label>
                            <input
                                type="text"
                                name="fullname.firstname"
                                value={formData.fullname.firstname}
                                onChange={handleChange}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                                placeholder='John'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Last Name</label>
                            <input
                                type="text"
                                name="fullname.lastname"
                                value={formData.fullname.lastname}
                                onChange={handleChange}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                                placeholder='Doe'
                            />
                        </div>
                    </div>

                    {/* Email field */}
                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                            placeholder='example@gmail.com'
                        />
                    </div>

                    {/* Password field */}
                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                            placeholder='Create a password'
                        />
                    </div>

                    {/* Vehicle color and plate fields */}
                    <div className='grid grid-cols-2 gap-4 form-element'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Vehicle Color</label>
                            <input
                                type="text"
                                name="vehicle.color"
                                value={formData.vehicle.color}
                                onChange={handleChange}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                                placeholder='Black'
                            />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>License Plate</label>
                            <input
                                type="text"
                                name="vehicle.plate"
                                value={formData.vehicle.plate}
                                onChange={handleChange}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                                placeholder='ABC123'
                            />
                        </div>
                    </div>

                    {/* Vehicle type and capacity fields */}
                    <div className='grid grid-cols-2 gap-4 form-element'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Vehicle Type</label>
                            <select
                                name="vehicle.vehicleType"
                                value={formData.vehicle.vehicleType}
                                onChange={handleChange}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                            >
                                <option value="">Select type</option>
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                                <option value="scooter">Scooter</option>
                            </select>
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Seating Capacity</label>
                            <input
                                type="number"
                                name="vehicle.capacity"
                                value={formData.vehicle.capacity}
                                onChange={handleChange}
                                required
                                min="1"
                                max="10"
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                                placeholder='4'
                            />
                        </div>
                    </div>

                    {/* Submit button and link to login */}
                    <div className='space-y-4 form-element'>
                        <button
                            type="submit"
                            className='w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200'
                        >
                            Create Account
                        </button>

                        <p className='text-center text-gray-600'>
                            Already have an account? <Link to='/captain-login' className='text-green-600 font-medium hover:text-green-700'>Sign in</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Export the CaptainSignup component
export default CaptainSignup