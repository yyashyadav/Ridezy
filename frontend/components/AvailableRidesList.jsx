import React, { useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const AvailableRidesList = ({ rides, onAccept, onReject }) => {
    // Effect hook to animate new rides when they are added to the list
    useEffect(() => {
        // Select the most recently added ride item
        const lastRide = document.querySelector('.ride-item:last-child');
        if (lastRide) {
            // Animate the new ride sliding up from bottom with fade in
            gsap.from(lastRide, {
                y: 50, // Start 50px below final position
                opacity: 0, // Start fully transparent
                duration: 0.5, // Animation takes 0.5 seconds
                ease: 'power2.out' // Smooth easing function
            });
        }
    }, [rides]); // Re-run effect when rides array changes

    // GSAP hook to animate the panel when it first appears
    useGSAP(() => {
        // Animate the entire panel sliding in from right
        gsap.from('.rides-panel', {
            x: 100, // Start 100px to the right
            opacity: 0, // Start fully transparent
            duration: 0.5, // Animation takes 0.5 seconds
            ease: 'power2.out' // Smooth easing function
        });
    }, []); // Run only once on mount

    return (
        // Main container for the rides panel
        <div className="rides-panel fixed top-20 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100">
            {/* Header section with title and ride count */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-green-50 to-white">
                {/* Left side with icon and title */}
                <div className="flex items-center gap-2">
                    {/* Icon container with gradient background */}
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="ri-route-line text-green-600 text-lg"></i>
                    </div>
                    {/* Panel title */}
                    <h2 className="text-lg font-semibold text-gray-800">Available Rides</h2>
                </div>
                {/* Right side showing number of new rides with pulse animation */}
                <span className="bg-green-100 text-green-800 text-xs px-3 py-1.5 rounded-full font-medium animate-pulse">
                    {rides.length} new
                </span>
            </div>

            {/* Scrollable container for ride items */}
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                {/* Map through available rides to create ride items */}
                {rides.map((ride) => (
                    // Individual ride item container
                    <div 
                        key={ride._id} 
                        className="ride-item p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-all duration-200 group"
                    >
                        {/* Flex container for ride details */}
                        <div className="flex items-start gap-4">
                            {/* Left side icon container */}
                            <div className="flex-shrink-0">
                                {/* Icon with gradient background and hover animation */}
                                <div className="h-10 w-10 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                                    <i className="ri-route-line text-green-600 text-lg"></i>
                                </div>
                            </div>
                            {/* Right side content container */}
                            <div className="flex-grow min-w-0">
                                {/* Fare and distance display */}
                                <div className="flex items-center justify-between mb-2">
                                    {/* Ride fare with larger text */}
                                    <span className="font-semibold text-lg text-green-600">₹{ride.fare}</span>
                                    {/* Distance in kilometers */}
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                        {ride.distance?.toFixed(1)} km
                                    </span>
                                </div>
                                {/* Addresses container */}
                                <div className="space-y-2">
                                    {/* Pickup address with blue icon */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center">
                                            <i className="ri-map-pin-line text-blue-500 text-sm"></i>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{ride.pickupAddress}</p>
                                    </div>
                                    {/* Destination address with red icon */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 bg-red-50 rounded-full flex items-center justify-center">
                                            <i className="ri-map-pin-line text-red-500 text-sm"></i>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{ride.destinationAddress}</p>
                                    </div>
                                </div>
                                {/* Action buttons container */}
                                <div className="flex justify-end gap-3 mt-3">
                                    {/* Reject ride button */}
                                    <button
                                        onClick={() => onReject(ride._id)}
                                        className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 transform hover:scale-110"
                                        title="Reject Ride"
                                    >
                                        <i className="ri-close-line text-lg"></i>
                                    </button>
                                    {/* Accept ride button */}
                                    <button
                                        onClick={() => onAccept(ride)}
                                        className="p-2 text-gray-600 hover:text-green-500 hover:bg-green-50 rounded-full transition-all duration-200 transform hover:scale-110"
                                        title="Accept Ride"
                                    >
                                        <i className="ri-check-line text-lg"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty state when no rides are available */}
                {rides.length === 0 && (
                    <div className="p-8 text-center">
                        {/* Empty state icon */}
                        <div className="h-16 w-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <i className="ri-route-line text-gray-400 text-2xl"></i>
                        </div>
                        {/* Empty state messages */}
                        <p className="text-gray-700 font-medium">No rides available</p>
                        <p className="text-sm text-gray-500 mt-1">We'll notify you when new rides come in</p>
                    </div>
                )}
            </div>

            {/* Custom scrollbar styling */}
            <style jsx>{`
                /* Custom scrollbar width */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                /* Transparent scrollbar track */
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                /* Light gray scrollbar thumb */
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e5e7eb;
                    border-radius: 3px;
                }
                /* Darker gray on scrollbar thumb hover */
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #d1d5db;
                }
            `}</style>
        </div>
    );
};

export default AvailableRidesList; 