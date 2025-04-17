import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';

const UserLogin = () => {
    //we use this for data handling in react calle two way binding 

    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    // const [userData,setUserData]=useState({});

    const {user,setUser}=useContext(UserDataContext);
    const navigate=useNavigate();

    const submitHandler=async(e)=>{
        e.preventDefault();
        // console.log(email,password);
       const userData={
        email:email,
        password:password
       }
        // console.log(userData);
       const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/users/login`,userData);
       if(response.status==200){
        const data=response.data;
        // console.log(data);
        setUser(data.user);
        localStorage.setItem('token',data.token);
        navigate('/home');
       }
        setEmail('');
        setPassword('');
    }

  return (
    <div className='p-7 h-screen flex flex-col justify-between'>
       <div>
       <img className='w-16 mb-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
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
            placeholder='password' />

            <button
            className='bg-[#111] text-white font-semibold mb-3 px-4 py-2 rounded w-full text-lg placeholder:text-base'
            >Login</button>

            <p className='text-center'>New here? <Link to='/signup' className='text-blue-600' >Create new Account</Link></p>
        </form>

       </div>
       <div>
            <Link to='/captain-login'
                className='bg-[#10b461] flex items-center justify-center text-white font-semibold mb-7 px-4 py-2 rounded w-full text-lg placeholder:text-base'
            >Sign in as Captain</Link> 
       </div>
    </div>
  )
}

export default UserLogin