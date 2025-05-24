import React from 'react'

const LookingForDriver = (props) => {
  const vehicleImages = {
    car: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_538,w_956/v1688398971/assets/29/fbb8b0-75b1-4e2a-8533-3a364e7042fa/original/UberSelect-White.png",
    moto: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png",
    auto: "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png"
  };

  return (
    <div>
      <div className="w-full h-2 rounded-sm bg-gray-200 overflow-hidden">
        <div className="w-full h-full bg-green-500 animate-loading"></div>
      </div>
      <h5 className='p-1 text-center w-[93%] absolute top-0' onClick={() => {
        props.setVehicleFound(false)
      }}><i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i></h5>
      <h3 className='text-2xl font-semibold mb-5'>Looking for a Driver</h3>

      <div className='flex gap-2 justify-between flex-col items-center'>
        <img className='h-20' src={vehicleImages[props.vehicleType]} alt={`${props.vehicleType} vehicle`} />
        <div className='w-full mt-5'>
          <div className='flex items-center gap-5 px-1 py-3 border-b-2'>
            <i className="ri-map-pin-user-fill text-3xl"></i>
            <div>
              <h3 className='text-lg font-semibold'>Pickup</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.pickup}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 px-1 py-3 border-b-2'>
            <i className="ri-map-pin-2-fill text-3xl"></i>
            <div>
              <h3 className='text-lg font-semibold'>Destination</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.destination}</p>
            </div>
          </div>
          <div className='flex items-center gap-5 px-1 py-3 border-b-2'>
            <i className="ri-currency-line text-3xl"></i>
            <div>
              <h3 className='text-lg font-semibold'>₹{props.fare[ props.vehicleType ]} </h3>
              <p className='text-sm -mt-1 text-gray-600'>Cash</p>
            </div>
          </div>
          <div className='flex items-center gap-5 px-1 py-3'>
            <i className="ri-shield-keyhole-line text-3xl"></i>
            <div>
              <h3 className='text-lg font-semibold'>OTP</h3>
              <p className='text-sm -mt-1 text-gray-600'>{props.ride?.otp}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LookingForDriver