import React, { useRef, useState } from 'react'
import { Link,useLocation } from 'react-router-dom'
import FinishRide from '../../components/FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import LiveTracking from '../../components/LiveTracking';

const CaptainRiding = () => {

    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const finishRidePanelRef=useRef(null);
    const location=useLocation();
    const rideData = location.state?.ride;

    useGSAP(()=>{
        if(finishRidePanel){
            gsap.to(finishRidePanelRef.current,{
                transform:'translateY(0)'
            })
        }else{
            gsap.to(finishRidePanelRef.current,{
                transform:'translateY(100%)'
            })
        }
    },[finishRidePanel])

  return (
    <div className='h-screen'>
        
        <div className='fixed p-4 top-0 flex items-center justify-between w-screen'>
            <img className='w-16' src="https://cdn.worldvectorlogo.com/logos/uber-2.svg"/>
            <Link to='/home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
            <i className="text-xl ri-logout-box-r-line"></i>
            </Link>
        </div>
        <div className='h-4/5'>
            <LiveTracking 
                pickupLocation={rideData?.pickup}
                isDriver={true}
            />
        </div>
        <div  className='h-1/5 p-6 bg-yellow-400 flex justify-between items-center relative '
           onClick={()=>{
            setFinishRidePanel(true);
           }} >
            <h5 className='p-1 text-center w-[90%] absolute top-0' 
                onClick={()=>{

            }}><i className=" text-2xl text-gray-800 ri-arrow-up-wide-fill"></i></h5>
            <h4 className='text-xl font-semibold'>4 KM away</h4>
            <button className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>Complete Ride</button>
        </div>
        <div ref={finishRidePanelRef} className=' fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 pt-12 bg-white'>
              <FinishRide 
              ride={rideData}
              setFinishRidePanel={setFinishRidePanel}/>
        </div>
        
    </div>
  )
}

export default CaptainRiding