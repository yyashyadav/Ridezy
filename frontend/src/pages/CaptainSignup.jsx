import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CaptainDataContext } from '../context/CaptainContext';
import axios from 'axios';


const CaptainSignup = () => {
    const navigate=useNavigate();
    const [email,setEmail]=useState('');
    const  [password,setPassword]=useState('');
    const [firstName,setFirstName]=useState('');
    const [lastName,setLastName]=useState('');
    // const [userData,setUserData ]=useState({});

    const [ vehicleColor, setVehicleColor ] = useState('')
    const [ vehiclePlate, setVehiclePlate ] = useState('')
    const [ vehicleCapacity, setVehicleCapacity ] = useState('')
    const [ vehicleType, setVehicleType ] = useState('')


    const {captain,setCaptain}=useContext(CaptainDataContext);

    const submitHandler=async(e)=>{
        e.preventDefault();
        const captainData = {
            fullname: {
              firstname: firstName,
              lastname: lastName
            },
            email: email,
            password: password,
            vehicle: {
              color: vehicleColor,
              plate: vehiclePlate,
              capacity: vehicleCapacity,
              vehicleType: vehicleType
            }
          }

        const response=await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`,captainData);
        if(response.status==201){
            const data=response.data;
            console.log(response.data);
            setCaptain(data.captain);
            // this help for protected routing
            localStorage.setItem('captainToken',data.token);
            navigate('/captain-home');
        }
        // console.log(userData);
        setEmail('')
        setFirstName('')
        setLastName('')
        setPassword('')
        setVehicleColor('')
        setVehiclePlate('')
        setVehicleCapacity('')
        setVehicleType('')

    }     


  return (
    <div>
         <div className='p-7 h-screen flex flex-col justify-between'>
            <div>
            <img className='w-16 mb-10' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
                <form onSubmit={(e) => {
                submitHandler(e)
                }}>
                    <h3 className='text-base font-medium mb-2'>What's our Captain's name</h3>
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


                    <h3 className='text-base font-medium mb-2'>What's our Captain email</h3>

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


                <h3 className='text-base font-medium mb-2'>Vehicle Information</h3>
                <div className='flex gap-4 mb-7'>
                    <input
                    required
                    className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-sm'
                    type="text"
                    placeholder='Vehicle Color'
                    value={vehicleColor}
                    onChange={(e) => {
                        setVehicleColor(e.target.value)
                    }}
                    />
                    <input
                    required
                    className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-sm'
                    type="text"
                    placeholder='Vehicle Plate'
                    value={vehiclePlate}
                    onChange={(e) => {
                        setVehiclePlate(e.target.value)
                    }}
                    />
                </div>
                <div className='flex gap-4 mb-7'>
                    <input
                    required
                    className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-lg placeholder:text-sm'
                    type="number"
                    placeholder='Vehicle Capacity'
                    value={vehicleCapacity}
                    onChange={(e) => {
                        setVehicleCapacity(e.target.value)
                    }}
                    />
                    <select
                    required
                    className='bg-[#eeeeee] w-1/2 rounded-lg px-4 py-2 border text-sm placeholder:text-medium'
                    value={vehicleType}
                    onChange={(e) => {
                        setVehicleType(e.target.value)
                    }}
                    >
                    <option value="" disabled>Select Vehicle Type</option>
                    <option value="car">Car</option>
                    <option value="auto">Auto</option>
                    <option value="moto">Moto</option>
                    </select>
                </div>






                    <button
                    className='bg-[#111] text-white font-semibold mb-3 px-4 py-3 rounded w-full text-sm placeholder:text-base'
                    >Create Captain Account</button>

                    <p className='text-center'>Already have a account? <Link to='/captain-login' className='text-blue-600' >Login here</Link></p>
                </form>

            </div>
            <div>
                <p className='text-[10px] mt-6 leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy
                Policy</span> and <span className='underline'>Terms of Service apply</span>.</p>
            </div>
        </div>

    </div>
  )
}

export default CaptainSignup