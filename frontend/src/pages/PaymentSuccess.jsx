import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PaymentSuccessLoader from '../../components/PaymentSuccessLoader';

const PaymentSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { rideId } = location.state || {};

    // If no rideId is provided, redirect to home
    React.useEffect(() => {
        if (!rideId) {
            navigate('/home');
        }
    }, [rideId, navigate]);

    return (
        <div className="payment-success-page">
            <PaymentSuccessLoader />
        </div>
    );
};

export default PaymentSuccess; 