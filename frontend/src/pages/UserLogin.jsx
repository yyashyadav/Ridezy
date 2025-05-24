// Import React and its hooks for state, context, and effects
import React, { useContext, useState, useEffect } from 'react'
// Import Link for navigation and useNavigate for programmatic navigation
import { Link, useNavigate } from 'react-router-dom'
// Import UserDataContext for global user state
import { UserDataContext } from '../context/UserContext';
// Import userLogin service for authentication
import { userLogin } from '../services/auth.service';
// Import toast for notifications
import { toast } from 'react-toastify';
// Import GSAP for animations
import gsap from 'gsap';

// UserLogin component for user authentication
const UserLogin = () => {
    // State for email input (two-way binding)
    const [email,setEmail]=useState('');
    // State for password input (two-way binding)
    const [password,setPassword]=useState('');
    // State for error messages
    const [error, setError] = useState('');
    // State for loading indicator
    const [isLoading, setIsLoading] = useState(false);
    // const [userData,setUserData]=useState({}); // (Unused)

    // Access user state and setter from context
    const {user,setUser}=useContext(UserDataContext);
    // useNavigate hook for navigation
    const navigate=useNavigate();

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

    // Handle form submission for login
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setError(''); // Clear previous errors
        setIsLoading(true); // Show loading indicator

        try {
            // Call userLogin service with email and password
            const data = await userLogin(email, password);
            setUser(data.user); // Set user in context
            toast.success('Login successful'); // Show success notification
            navigate('/home'); // Redirect to user home
        } catch (err) {
            toast.error(err.message || 'Login failed. Please try again.'); // Show error notification
            setError(err.message || 'Login failed. Please try again.'); // Set error state
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

    // Handle guest login for demo/testing
    const handleGuestLogin = async () => {
        setError(''); // Clear previous errors
        setIsLoading(true); // Show loading indicator

        try {
            // Call userLogin service with guest credentials
            const data = await userLogin('testuser@gmail.com', 'testuser');
            setUser(data.user); // Set user in context
            toast.success('Guest login successful'); // Show success notification
            navigate('/home'); // Redirect to user home
        } catch (err) {
            toast.error(err.message || 'Guest login failed. Please try again.'); // Show error notification
            setError('Guest login failed. Please try again.'); // Set error state
        } finally {
            setIsLoading(false); // Hide loading indicator
        }
    };

  return (
    // Main container with gradient background and padding
    <div className='min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100 p-7 flex flex-col justify-between'>
       <div className='max-w-md mx-auto w-full'>
       {/* Logo and welcome text */}
       <div className='text-center mb-10 form-element'>
       <img className='w-45 mx-auto mb-4' src="/ridezy-logo.png" alt="Ridezy Logo" />
        <h1 className='text-3xl font-bold text-gray-800'>Welcome Back</h1>
        <p className='text-gray-600 mt-2'>Sign in to continue your journey</p>
       </div>
        {/* Login form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Email input */}
            <div className='form-element'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>

            <input
             value={email}
             // Two-way binding for email
             onChange={(e)=>{
                setEmail(e.target.value)
                // console.log(e.target.value)
             }}
             required
             className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none'
             type="email" 
             placeholder='example@gmail.com'
             disabled={isLoading} />
            </div>

            {/* Password input */}
            <div className='form-element'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>

            <input 
             value={password}
             // Two-way binding for password
             onChange={(e)=>{
                setPassword(e.target.value)
                // console.log(e.target.value)
             }}
            required 
            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none'
            type="password"
            placeholder='Enter your password'
            disabled={isLoading} />
            </div>

            {/* Error message display */}
            {error && (
                <div className="text-red-500 text-sm text-center form-element">
                    {error}
                </div>
            )}

            {/* Sign in and guest login buttons */}
            <div className='space-y-4 form-element'>
            <button
            type="submit"
            className='w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50'
            disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
            type="button"
            onClick={handleGuestLogin}
            className='w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50'
            disabled={isLoading}
            >
                {isLoading ? 'Signing in...' : 'Continue as Guest'}
            </button>
            </div>

            {/* Link to user signup */}
            <p className='text-center text-gray-600 form-element'>
                New here? <Link to='/signup' className='text-blue-600 font-medium hover:text-blue-700'>Create an Account</Link>
            </p>
        </form>

       </div>
       {/* Button to sign in as captain instead */}
       <div className='max-w-md mx-auto w-full form-element'>
            <Link to='/captain-login'
                className='block w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg text-center hover:bg-green-700 transition-colors duration-200'
            >Sign in as Captain</Link> 
       </div>
    </div>
  )
}

// Export the UserLogin component
export default UserLogin