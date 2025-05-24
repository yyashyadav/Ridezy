import axios from 'axios';
import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptainContext';
import { toast } from 'react-toastify';
import gsap from 'gsap';

const CaptainLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { captain, setCaptain } = useContext(CaptainDataContext);
    const navigate = useNavigate();

    useEffect(() => {
        gsap.from('.form-element', {
            y: 20,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out'
        });
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
    
        const captain = {
            email,
            password
        };
    
        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captain);
    
            if (response.status === 200) {
                const data = response.data;
                setCaptain(data.captain);
                localStorage.setItem('captainToken', data.token);
    
                toast.success('Logged in successfully');
                navigate('/captain-home');
            }
    
            setEmail('');
            setPassword('');
        } catch (error) {
            const msg = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(msg);
        }
    };
    

    const handleGuestLogin = async () => {
        try {
            const guestData = {
                email: 'testcaptain@gmail.com',
                password: 'testcaptain'
            };
            
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, guestData);
            
            if (response.status === 200) {
                const data = response.data;
                setCaptain(data.captain);
                localStorage.setItem('captainToken', data.token);
                toast.success('Guest login successful');
                navigate('/captain-home');
            }
        } catch (error) {
            console.error('Guest login failed:', error);
            if (error.response?.status === 401) {
                try {
                    const createResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, {
                        fullname: {
                            firstname: 'Test',
                            lastname: 'Captain'
                        },
                        email: 'testcaptain@gmail.com',
                        password: 'testcaptain',
                        vehicle: {
                            color: 'Black',
                            plate: 'TEST123',
                            capacity: 4,
                            vehicleType: 'car'
                        },
                        location: {
                            type: 'Point',
                            coordinates: [0, 0]
                        }
                    });
                    
                    if (createResponse.status === 201) {
                        toast.info('Guest account created, logging in...');
                        const loginResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, {
                            email: 'testcaptain@gmail.com',
                            password: 'testcaptain'
                        });
                        
                        if (loginResponse.status === 200) {
                            const data = loginResponse.data;
                            setCaptain(data.captain);
                            localStorage.setItem('captainToken', data.token);
                            toast.success('Logged in as guest captain');
                            navigate('/captain-home');
                        }
                    }
                } catch (createError) {
                    console.error('Failed to create test account:', createError);
                    toast.error('Failed to create guest account');
                }
            }
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-green-100 p-7 flex flex-col justify-between'>
            <div className='max-w-md mx-auto w-full'>
                <div className='text-center mb-10 form-element'>
                    <img className='w-45 mx-auto mb-4' src="/ridezy-logo.png" alt="Ridezy Logo" />
                    <h1 className='text-3xl font-bold text-gray-800'>Welcome Back, Captain</h1>
                    <p className='text-gray-600 mt-2'>Sign in to start driving</p>
                </div>

                <form onSubmit={submitHandler} className='space-y-6'>
                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                        <input
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                            type="email"
                            placeholder='example@gmail.com'
                        />
                    </div>

                    <div className='form-element'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>Password</label>
                        <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 outline-none'
                            type="password"
                            placeholder='Enter your password'
                        />
                    </div>

                    <div className='space-y-4 form-element'>
                        <button
                            type="submit"
                            className='w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200'
                        >
                            Sign In
                        </button>

                        <button
                            type="button"
                            onClick={handleGuestLogin}
                            className='w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200'
                        >
                            Continue as Guest Captain
                        </button>
                    </div>

                    <p className='text-center text-gray-600 form-element'>
                        New to driving? <Link to='/captain-signup' className='text-green-600 font-medium hover:text-green-700'>Register as a Captain</Link>
                    </p>
                </form>
            </div>

            <div className='max-w-md mx-auto w-full form-element'>
                <Link to='/login'
                    className='block w-full bg-orange-500 text-white font-semibold py-3 px-4 rounded-lg text-center hover:bg-orange-600 transition-colors duration-200'
                >
                    Sign in as User
                </Link>
            </div>
        </div>
    )
}

export default CaptainLogin