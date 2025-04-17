import React, { useContext, useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import axios from 'axios';
import { UserDataContext } from '../context/UserContext';
const UserSignup = () => {
    const [email,setEmail]=useState('');
    const  [password,setPassword]=useState('');
    const [firstName,setFirstName]=useState('');
    const [lastName,setLastName]=useState('');
    // const [userData,setUserData ]=useState({});
    
    const navigate=useNavigate();

    //iss vali line hum user,setUser ko hum UserDataContext se  nikal rahe hai 
    const {user,setUser}=useContext(UserDataContext);

    const submitHandler=async(e)=>{
        e.preventDefault();
        // setUserData({
        //     fullname:{
        //         firstName:firstName,
        //         lastName:lastName,
        //     },
        //     email:email,
        //     password:password,
            
        // });

    const newUser={
            fullname:{
                 firstname:firstName,
                 lastname:lastName,
            },
                    email:email,
                    password:password,
        }

    const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`,newUser);

    if(response.status==201){
        //iss vali line se hum response mein aaye data ko data mein store kar rahe hai 
       const data=response.data;
    //    console.log(data);
        setUser(data.user);
        localStorage.setItem('token',data.token);
        navigate('/home');
    }

        // console.log(userData);
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');

    }

  return (
    <div>
        
        <div className='p-7 h-screen flex flex-col justify-between'>
            <div>
            <img className='w-16 mb-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <form onSubmit={(e) => {
                submitHandler(e)
                }}>
                    <h3 className='text-base font-medium mb-2'>What's your name</h3>
                    <div className='flex gap-4 mb-6 '>
                        <input
                        value={firstName}
                        onChange={(e)=>{
                            setFirstName(e.target.value)
                        }}
                        required
                        className='bg-[#eeeeee]  px-4 py-2 rounded  w-1/2 text-base placeholder:text-sm'
                        type="text" 
                        placeholder='First name' />

                        <input
                        value={lastName}
                        onChange={(e)=>{
                            setLastName(e.target.value);
                        }}
                        required
                        className='bg-[#eeeeee]  px-4 py-2 rounded  w-1/2 text-base placeholder:text-sm'
                        type="text" 
                        placeholder='Last name' />
                    </div>


                    <h3 className='text-base font-medium mb-2'>What's your email</h3>

                    <input
                    value={email}
                    onChange={(e)=>{
                        setEmail(e.target.value);
                    }}
                    required
                    className='bg-[#eeeeee] mb-6 px-4 py-2 rounded  w-full text-base placeholder:text-sm'
                    type="email" 
                    placeholder='example@gmail.com' />

                    <h3 className='text-base font-medium mb-2'>Enter Password</h3>

                    <input 
                    value={password}
                    onChange={(e)=>{
                        setPassword(e.target.value);
                    }}
                    required 
                    className='bg-[#eeeeee] mb-6 px-4 py-2 rounded  w-full text-base placeholder:text-sm'
                    type="password"
                    placeholder='password' />

                    <button
                    className='bg-[#111] text-white font-semibold mb-3 px-4 py-2 rounded w-full text-lg placeholder:text-base'
                    >Create account</button>

                    <p className='text-center'>Already have a account? <Link to='/login' className='text-blue-600' >Login here</Link></p>
                </form>

            </div>
            <div>
            <p className='text-[10px] leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy
            Policy</span> and <span className='underline'>Terms of Service apply</span>.</p>
            </div>
        </div>

    </div>
  )
}

export default UserSignup