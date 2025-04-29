import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const ConfirmRidePopUp = (props) => {

    const [otp,setOtp]=useState('');
    const navigate=useNavigate();
    
    const submitHandler=async(e)=>{
        e.preventDefault();

        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/start-ride`, {
            params: {
                rideId: props.ride._id,
                otp: otp
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (response.status === 200) {
            props.setConfirmRidePopupPanel(false)
            props.setRidePopupPanel(false)
            navigate('/captain-riding', { state: { ride: props.ride } })
        }

    }
  return (
    <div>
        <h5 className='p-3 text-center w-[93%] absolute top-0' 
                onClick={()=>{
                   props.setRidePopupPanel(false);
            }}><i className=" text-2xl text-gray-300 ri-arrow-down-wide-fill"></i></h5>
        <h3 className='text-2xl font-semibold mb-5'>Confirm this ride to Start</h3>

        <div className='flex items-center justify-between bg-yellow-400 rounded-lg p-3'> 
                <div className='flex items-center justify-start gap-3'>
                    <img className='h-12 w-10 rounded-full object-cover' src="https://st.depositphotos.com/1011643/4430/i/450/depositphotos_44309759-stock-photo-young-indian-man-outdoors.jpg" alt="" />
                    <h4 className='text-lg font-medium'>{props.ride?.user.fullname.firstname}</h4>
                </div> 
                <h5 className='text-lg font-semibold'>2.2 KM</h5>
        </div>

        <div className='flex gap-2 justify-between flex-col items-center'>
            <div className='w-full mt-5'>
                <div className='flex items-center gap-5 px-1 py-3 border-b-2 border-gray-200'>
                    <i className="ri-map-pin-2-fill text-3xl"></i>
                    <div>
                        <h3 className='text-lg font-semibold'>Pickup</h3>
                        <p className='text-gray-600 -mt-1 '>{props.ride?.pickup}</p>
                    </div>
                </div>
                <div className='flex items-center gap-5 px-1 py-3 border-b-2 border-gray-200'>
                    <i className="ri-map-pin-2-fill text-3xl"></i>
                    <div>
                        <h3 className='text-lg font-semibold'>Destination</h3>
                        <p className='text-gray-600 -mt-1'>{props.ride?.destination}</p>
                    </div>
                </div>
                <div className='flex items-center gap-5 px-1 py-3'>
                    <i className="ri-currency-line text-3xl"></i>
                    <div>
                        <h3 className='text-lg font-semibold'>₹{props.ride?.fare}</h3>
                        <p className='text-gray-600 -mt-1'>Cash</p>
                    </div>
                </div>
            </div>
           
           <div className='mt-6 w-full'>
               <form onSubmit={submitHandler} >
                <input value={otp} onChange={(e)=>setOtp(e.target.value)} type="text" className='bg-[#eee] px-6 py-2 font-mono rounded-lg text-base w-full mt-5'  placeholder='Enter OTP' />
                    <button  className='w-full flex justify-center mt-5 bg-green-600 text-white font-semibold p-2 rounded-lg' >Confirm</button>
                        <button onClick={()=>{
                                props.setConfirmRidePopupPanel(false);
                                props.setRidePopupPanel(false);
                        }} className='w-full mt-1 bg-red-700 text-white font-semibold p-2 rounded-lg' >Cancel</button>
               </form>
           </div>
        </div>
    </div>
  )
}

export default ConfirmRidePopUp