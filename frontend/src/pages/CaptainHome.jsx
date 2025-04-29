import React, { useRef,useState,useContext,useEffect } from 'react'
import { Link } from 'react-router-dom'
import CaptainDetails from '../../components/CaptainDetails'
import RidePopUp from '../../components/RidePopUp'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import ConfirmRidePopUp from '../../components/ConfirmRidePopUp'
import { CaptainDataContext } from '../context/CaptainContext'  
import { SocketContext } from '../context/SocketContext'
import axios from 'axios'
import LiveTracking from '../../components/LiveTracking'

const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const ridePopupPanelRef=useRef(null);
  const confirmRidePopupPanelRef=useRef(null);
const [ride, setRide] = useState(null);
  const { socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);

//   here we find the captain location and send it to the backend

  useEffect(() => {
    socket.emit('join', {
        userId: captain._id,
        userType: 'captain'
    })
    //this is used tp get curreent location continously
    const updateLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                console.log({ 
                    userId: captain._id,
                    location: {
                        ltd: position.coords.latitude,
                        lng: position.coords.longitude
                    }});
                socket.emit('update-location-captain', {
                    userId: captain._id,
                    location: {
                        ltd: position.coords.latitude,
                        lng: position.coords.longitude
                    }
                })
            })
        }
    }

    const locationInterval = setInterval(updateLocation, 10000)
    updateLocation()

    // return () => clearInterval(locationInterval)
}, [])

socket.on('new-ride',(data)=>{
    console.log(data);
    setRide(data);
    setRidePopupPanel(true);
})

async function confirmRide(){
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/confirm`, {
        rideId: ride._id,
        otp: ride.otp || "000000"
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    })

    setRidePopupPanel(false)
    setConfirmRidePopupPanel(true)
}


  useGSAP(()=>{
    if(ridePopupPanel){
        gsap.to(ridePopupPanelRef.current,{
            transform:'translateY(0)'
        })
    }else{
        gsap.to(ridePopupPanelRef.current,{
            transform:'translateY(100%)'
        })
    }
},[ridePopupPanel])

useGSAP(()=>{
    if(confirmRidePopupPanel){
        gsap.to(confirmRidePopupPanelRef.current,{
            transform:'translateY(0)'
        })
    }else{
        gsap.to(confirmRidePopupPanelRef.current,{
            transform:'translateY(100%)'
        })
    }
},[confirmRidePopupPanel])

  return (
    <div className='h-screen'>
        <div className='fixed p-4 top-0 flex items-center justify-between w-screen'>
            <img className='w-16' src="https://cdn.worldvectorlogo.com/logos/uber-2.svg"/>
            <Link to='/home' className='fixed right-2 top-2 h-10 w-10 bg-white flex items-center justify-center rounded-full'>
            <i className="text-xl ri-logout-box-r-line"></i>
            </Link>
        </div>
        <div className='h-3/5'>
            <LiveTracking rideData={null} />
        </div>
        <div className='h-2/5 p-6'>
            <CaptainDetails/>
        </div>
        <div ref={ridePopupPanelRef} className=' fixed w-full z-10 bottom-0 translate-y-full px-3 py-6 pt-12 bg-white'>
              <RidePopUp 
              ride={ride}
              setRidePopupPanel={setRidePopupPanel} 
              setConfirmRidePopupPanel={setConfirmRidePopupPanel}
              confirmRide={confirmRide}
               />
        </div>
        <div ref={confirmRidePopupPanelRef} className=' fixed w-full z-10 h-screen bottom-0 translate-y-full px-3 py-6 pt-12 bg-white'>
              <ConfirmRidePopUp
                ride={ride}
               setConfirmRidePopupPanel={setConfirmRidePopupPanel} 
               setRidePopupPanel={setRidePopupPanel} />
        </div>
    </div>
  )
}

export default CaptainHome