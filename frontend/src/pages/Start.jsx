import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

const Start = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const carRef = useRef(null);

  useEffect(() => {
    // Create a timeline for sequential animations
    const tl = gsap.timeline();

    // Animate the Ridezy title
    tl.from(titleRef.current, {
      y: -100,
      opacity: 0,
      duration: 1,
      ease: "power4.out"
    })
    // Animate the subtitle
    .from(subtitleRef.current, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    }, "-=0.5")
    // Animate the button
    .from(buttonRef.current, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)"
    }, "-=0.3");

    // Animate the car: from right to stop at 'zy'
    gsap.fromTo(carRef.current,
      { x: '60vw', opacity: 0 },
      {
        x: '53vw', // Even further right to stop above 'zy'
        opacity: 1,
        duration: 1.6,
        ease: 'power4.out',
        delay: 0.5
      }
    );
  }, []);

  return (
    <div className='bg-gradient-to-b from-blue-900 to-black h-screen flex flex-col items-center justify-center relative overflow-hidden'>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGMwIDIuMjA5LTEuNzkxIDQtNCA0cy00LTEuNzkxLTQtNCAxLjc5MS00IDQtNCA0IDEuNzkxIDQgNHoiIGZpbGw9IiNmZmYiLz48L2c+PC9zdmc+')]"></div>
      </div>

      {/* Car SVG Animation */}
      <div
        ref={carRef}
        style={{ position: 'absolute', top: '29%', left: 0, zIndex: 20, width: '160px', height: '80px', pointerEvents: 'none' }}
      >
        {/* White Sedan Taxi SVG */}
        <svg viewBox="0 0 180 80" width="160" height="80" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Car body */}
          <rect x="30" y="44" width="120" height="20" rx="10" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
          {/* Sedan roof and windows */}
          <path d="M50 44 Q62 28 90 28 Q118 28 130 44 Z" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2" />
          {/* Taxi sign */}
          <rect x="82" y="20" width="16" height="8" rx="2" fill="#fde047" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Windows */}
          <rect x="62" y="32" width="20" height="12" rx="2" fill="#d1d5db" />
          <rect x="98" y="32" width="20" height="12" rx="2" fill="#d1d5db" />
          {/* Wheels */}
          <ellipse cx="55" cy="68" rx="11" ry="11" fill="#222" stroke="#fff" strokeWidth="4" />
          <ellipse cx="125" cy="68" rx="11" ry="11" fill="#222" stroke="#fff" strokeWidth="4" />
          {/* Headlights */}
          <rect x="28" y="52" width="8" height="6" rx="2" fill="#fbbf24" />
          <rect x="144" y="52" width="8" height="6" rx="2" fill="#fbbf24" />
          {/* Sedan details: door lines */}
          <line x1="75" y1="44" x2="75" y2="64" stroke="#bdbdbd" strokeWidth="2" />
          <line x1="105" y1="44" x2="105" y2="64" stroke="#bdbdbd" strokeWidth="2" />
          {/* Door handles */}
          <rect x="70" y="54" width="8" height="2" rx="1" fill="#bdbdbd" />
          <rect x="110" y="54" width="8" height="2" rx="1" fill="#bdbdbd" />
        </svg>
      </div>

      {/* Content */}
      <div className='text-center z-10 px-4'>
        <h1 
          ref={titleRef}
          className='text-7xl md:text-9xl font-bold text-white mb-4 tracking-tight'
        >
          RIDEZY
        </h1>
        <p 
          ref={subtitleRef}
          className='text-xl md:text-2xl text-gray-300 mb-12'
        >
          Your Journey, Our Priority
        </p>
        <Link 
          ref={buttonRef}
          to='/login' 
          className='inline-block bg-white text-blue-900 px-12 py-4 rounded-full text-lg font-semibold hover:bg-blue-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
        >
          Get Started
        </Link>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
    </div>
  )
}

export default Start