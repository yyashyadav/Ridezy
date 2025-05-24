import React, { useContext, useEffect, useState } from 'react'
import { CaptainDataContext } from '../src/context/CaptainContext'
import axios from 'axios'
import { getToken } from '../src/services/auth.service'

const CaptainDetails = () => {
    const { captain } = useContext(CaptainDataContext);
    const [dailyEarnings, setDailyEarnings] = useState(0);
    const [rideCount, setRideCount] = useState(0);
    const [onlineTime, setOnlineTime] = useState(0);
    const [acceptanceRate, setAcceptanceRate] = useState(0);

    const fetchCaptainStats = async () => {
        try {
            const token = getToken('captain');
            if (!token) return;

            // Fetch daily earnings
            const earningsResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain/daily-earnings`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Fetch ride history for stats
            const historyResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/captain/history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setDailyEarnings(earningsResponse.data.totalEarnings);
            setRideCount(earningsResponse.data.rideCount);

            // Calculate acceptance rate and total time from ride history
            if (historyResponse.data.rides && historyResponse.data.rides.length > 0) {
                const totalRides = historyResponse.data.rides.length;
                const completedRides = historyResponse.data.rides.filter(ride => ride.status === 'completed');
                const rate = (completedRides.length / totalRides) * 100;
                setAcceptanceRate(Math.round(rate));

                // Calculate total time from completed rides using simple distance/60 formula
                const totalTime = completedRides.reduce((sum, ride) => {
                    if (ride.distance) {
                        // Simple calculation: distance/60
                        return sum + (ride.distance / 60);
                    }
                    return sum;
                }, 0);

                setOnlineTime(totalTime.toFixed(1));
            }

        } catch (error) {
            console.error('Error fetching captain stats:', error);
        }
    };

    useEffect(() => {
        fetchCaptainStats();
        // Refresh stats every minute
        const interval = setInterval(fetchCaptainStats, 60000);
        return () => clearInterval(interval);
    }, []);

    if (!captain) {
        return <div>Loading...</div>;
    }

    return (
        <div className='bg-white rounded-lg p-6 shadow-sm mt-10'>
            <div className='grid grid-cols-4 gap-4'>
                <div className='text-center'>
                    <i className="text-3xl mb-2 text-green-600 ri-money-rupee-circle-line"></i>
                    <h5 className='text-lg font-medium'>₹{dailyEarnings}</h5>
                    <p className='text-sm text-gray-600'>Today's Earnings</p>
                </div>
                <div className='text-center'>
                    <i className="text-3xl mb-2 text-blue-600 ri-route-line"></i>
                    <h5 className='text-lg font-medium'>{rideCount}</h5>
                    <p className='text-sm text-gray-600'>Today's Rides</p>
                </div>
                <div className='text-center'>
                    <i className="text-3xl mb-2 text-yellow-500 ri-timer-line"></i>
                    <h5 className='text-lg font-medium'>{onlineTime}h</h5>
                    <p className='text-sm text-gray-600'>Online Time</p>
                </div>
                <div className='text-center'>
                    <i className="text-3xl mb-2 text-purple-600 ri-check-double-line"></i>
                    <h5 className='text-lg font-medium'>{acceptanceRate}%</h5>
                    <p className='text-sm text-gray-600'>Acceptance Rate</p>
                </div>
            </div>
        </div>
    );
};

export default CaptainDetails;