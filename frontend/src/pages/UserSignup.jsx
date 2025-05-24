// Import React and its hooks for state, context, and effects
import React, { useContext, useState, useEffect } from 'react'
// Import Link for navigation and useNavigate for programmatic navigation
import { Link, useNavigate } from 'react-router-dom'
// Import axios for HTTP requests
import axios from 'axios';
// Import UserDataContext for global user state
import { UserDataContext } from '../context/UserContext';
// Import toast for notifications
import { toast } from 'react-toastify';
// Import GSAP for animations
import gsap from 'gsap';

// UserSignup component for user registration
const UserSignup = () => {
    // State for email input (two-way binding)
    const [email, setEmail] = useState('');
    // State for password input (two-way binding)
    const [password, setPassword] = useState('');
    // State for first name input
    const [firstName, setFirstName] = useState('');
    // State for last name input
    const [lastName, setLastName] = useState('');
    // const [userData,setUserData ]=useState({}); // (Unused)
    
    // useNavigate hook for navigation
    const navigate = useNavigate();

    // Access user state and setter from context
    // iss vali line hum user,setUser ko hum UserDataContext se  nikal rahe hai 
    const { user, setUser } = useContext(UserDataContext);

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

    // Handle form submission for registration
    const submitHandler = async (e) => {
        e.preventDefault(); // Prevent default form submission
    
        // Password validation
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
    
        // Construct new user object for API
        const newUser = {
            fullname: {
                firstname: firstName,
                lastname: lastName,
            },
            email,
            password,
        };
    
        try {
            // Send registration request to backend
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser);
    
            if (response.status === 201) {
                const data = response.data;
                setUser(data.user); // Set user in context
                localStorage.setItem('token', data.token); // Store token
                toast.success('Account created successfully'); // Show success notification
                navigate('/home'); // Redirect to user home
            }
        } catch (error) {
            console.error('Signup error:', error);
            // Handle specific error messages
            if (error.response?.data?.message === 'User Already Exists') {
                toast.error('User already exists');
            } else if (error.response?.data?.errors) {
                toast.error(error.response.data.errors[0].msg);
            } else {
                toast.error('Something went wrong during signup');
            }
        }
    
        // Clear form fields after submission
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
    };
    
    return (
        // Main container with gradient background and padding
        <div className='min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 p-7 flex flex-col justify-between'>
            <div className='max-w-md mx-auto w-full'>
                {/* Logo and welcome text */}
                <div className='text-center mb-10 form-element'>
                <img className='w-45 mx-auto mb-4' src="/ridezy-logo.png" alt="Ridezy Logo" />
                    <h1 className='text-3xl font-bold text-gray-800'>Create Account</h1>
                    <p className='text-gray-600 mt-2'>Join us for a better ride experience</p>
                </div>

                {/* Signup form */}
                <form onSubmit={submitHandler} className='space-y-6'>
                    {/* Full name fields */}
                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Full Name</label>
                        <div className='grid grid-cols-2 gap-4'>
                            <input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none'
                                type="text"
                                placeholder='First name'
                            />
                            <input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none'
                                type="text"
                                placeholder='Last name'
                            />
                        </div>
                    </div>

                    {/* Email field */}
                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none'
                            type="email"
                            placeholder='example@gmail.com'
                        />
                    </div>

                    {/* Password field */}
                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none'
                            type="password"
                            placeholder='Create a password'
                        />
                        <p className='text-xs text-gray-500 mt-1'>Must be at least 6 characters long</p>
                    </div>

                    {/* Submit button */}
                    <div className='form-element'>
                        <button
                            type="submit"
                            className='w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200'
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Link to user login */}
                    <p className='text-center text-gray-600 form-element'>
                        Already have an account? <Link to='/login' className='text-blue-600 font-medium hover:text-blue-700'>Sign In</Link>
                    </p>
                </form>
            </div>

            {/* Terms and privacy policy note */}
            <div className='max-w-md mx-auto w-full form-element'>
                <p className='text-xs text-gray-500 text-center'>
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    )
}

// Export the UserSignup component
export default UserSignup