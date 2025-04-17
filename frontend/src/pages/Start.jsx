import React from 'react'
import { Link } from 'react-router-dom'

const Start = () => {
  return (
    <div className=' bg-cover bg-bottom bg-[url(https://images.unsplash.com/photo-1527603815363-e79385e0747e?q=80&w=3376&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-screen pt-8 flex justify-between flex-col w-full'>
        <img className='w-16 ml-8' src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png" alt="" />
        <div className='bg-white pb-7 py-4 px-4'>
            <h2 className='text-3xl font-bold'>Get Stated with Uber</h2>
            <Link to='/login' className='flex justify-center items-center w-full bg-black text-white py-3 rounded mt-5'>Continue</Link>
        </div>
    </div>
  )
}

export default Start