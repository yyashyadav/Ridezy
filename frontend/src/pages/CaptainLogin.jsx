import axios from 'axios';
import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { CaptainDataContext } from '../context/CaptainContext';

const CaptainLogin = () => {
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const { captain, setCaptain }=useContext(CaptainDataContext);
    // const [captainData,setCaptainData]=useState({});
    const navigate=useNavigate();

    const submitHandler=async(e)=>{
        e.preventDefault();
        // console.log(email,password);
        
        const captain={
            email:email,
            password:password
        }
        const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`,captain);
        if(response.status==200){
            const data=response.data;
            setCaptain(data.captain);
            localStorage.setItem('token', data.token)
            navigate('/captain-home');
        }
        setEmail('');
        setPassword('');
    }

    const handleGuestLogin = async () => {
        try {
            // Use the actual test credentials to make a real API call
            const guestData = {
                email: 'testcaptain@gmail.com',
                password: 'testcaptain'
            };
            
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, guestData);
            
            if (response.status === 200) {
                const data = response.data;
                setCaptain(data.captain);
                localStorage.setItem('token', data.token);
                navigate('/captain-home');
            }
        } catch (error) {
            console.error('Guest login failed:', error);
            // If the test account doesn't exist, create it
            if (error.response?.status === 401) {
                try {
                    // Try to create the test account
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
                        // Now try to login again
                        const loginResponse = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, {
                            email: 'testcaptain@gmail.com',
                            password: 'testcaptain'
                        });
                        
                        if (loginResponse.status === 200) {
                            const data = loginResponse.data;
                            setCaptain(data.captain);
                            localStorage.setItem('token', data.token);
                            navigate('/captain-home');
                        }
                    }
                } catch (createError) {
                    console.error('Failed to create test account:', createError);
                }
            }
        }
    };

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
       <div>
       <img className='w-16 mb-10' src="https://www.svgrepo.com/show/505031/uber-driver.svg" alt="" />
        <form onSubmit={(e) => {
          submitHandler(e)
        }}>
            <h3 className='text-lg font-medium mb-2'>What's your email</h3>

            <input
             value={email}
             //this is called two way binding
             onChange={(e)=>{
                setEmail(e.target.value)
                // console.log(e.target.value)
             }}
             required
             className='bg-[#eeeeee] mb-7 px-4 py-2 rounded border w-full text-lg placeholder:text-base'
             type="email" 
             placeholder='example@gmail.com' />

            <h3 className='text-lg font-medium mb-2'>Enter Password</h3>

            <input 
             value={password}
             //this is called two way binding
             onChange={(e)=>{
                setPassword(e.target.value)
                // console.log(e.target.value)
             }}
            required 
            className='bg-[#eeeeee] mb-7 px-4 py-2 rounded border w-full text-lg placeholder:text-base'
            type="password"
            placeholder='password'/>

            <button
            className='bg-[#111] text-white font-semibold mb-3 px-4 py-2 rounded w-full text-lg placeholder:text-base'
            >Login</button>

            <button
            type="button"
            onClick={handleGuestLogin}
            className='bg-[#666] text-white font-semibold mb-3 px-4 py-2 rounded w-full text-lg placeholder:text-base'
            >Login as Guest Captain</button>

            <p className='text-center'>Join a fleet? <Link to='/captain-signup' className='text-blue-600' >Register as a Captain</Link></p>
        </form>

       </div>
       <div>
            <Link to='/login'
                className='bg-[#d5622d] flex items-center justify-center text-white font-semibold mb-7 px-4 py-2 rounded w-full text-lg placeholder:text-base'
            >Sign in as User</Link> 
       </div>
    </div>
  )
}

export default CaptainLogin