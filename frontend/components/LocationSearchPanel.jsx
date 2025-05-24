import React, { useEffect, useState, useCallback } from 'react'

const LocationSearchPanel = ({ suggestions, setVehiclePanel, setPanelOpen, setPickup, setDestination, activeField, pickup, destination }) => {
    const [recentLocations, setRecentLocations] = useState([]);

    // Load recent locations only once when component mounts
    useEffect(() => {
        const storedLocations = localStorage.getItem('recentPickupLocations');
        if (storedLocations) {
            setRecentLocations(JSON.parse(storedLocations));
        }
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        if (activeField === 'pickup') {
            setPickup(suggestion);
            // Update recent locations
            const updatedLocations = [
                suggestion,
                ...recentLocations.filter(loc => loc !== suggestion)
            ].slice(0, 2);
            
            setRecentLocations(updatedLocations);
            localStorage.setItem('recentPickupLocations', JSON.stringify(updatedLocations));
        } else if (activeField === 'destination') {
            setDestination(suggestion);
        }

        // Only close panel and show vehicle panel if both pickup and destination are selected
        if (pickup && (activeField === 'destination' && suggestion) || 
            (activeField === 'pickup' && suggestion && destination)) {
            setVehiclePanel(true);
            setPanelOpen(false);
        }
    }, [activeField, pickup, destination, recentLocations, setPickup, setDestination, setVehiclePanel, setPanelOpen]);

    return (
        <div className="p-4">
            {activeField === 'pickup' && recentLocations.length > 0 && (
                <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Locations</h3>
                    {recentLocations.map((location, idx) => (
                        <div 
                            key={`recent-${idx}`} 
                            onClick={() => handleSuggestionClick(location)} 
                            className='flex gap-4 border-2 p-3 border-gray-50 hover:border-blue-500 rounded-xl items-center my-2 justify-start cursor-pointer'
                        >
                            <h2 className='bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full'>
                                <i className="ri-history-line"></i>
                            </h2>
                            <h4 className='font-medium text-sm'>{location}</h4>
                        </div>
                    ))}
                </div>
            )}
            
            <h3 className="text-sm font-medium text-gray-500 mb-2">Suggestions</h3>
            {suggestions.map((elem, idx) => (
                <div 
                    key={idx} 
                    onClick={() => handleSuggestionClick(elem)} 
                    className='flex gap-4 border-2 p-3 border-gray-50 hover:border-blue-500 rounded-xl items-center my-2 justify-start cursor-pointer'
                >
                    <h2 className='bg-[#eee] h-8 flex items-center justify-center w-8 rounded-full'>
                        <i className="ri-map-pin-fill"></i>
                    </h2>
                    <h4 className='font-medium text-sm'>{elem}</h4>
                </div>
            ))}
        </div>
    )
}

export default React.memo(LocationSearchPanel)