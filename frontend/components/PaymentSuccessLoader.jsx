import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentSuccessLoader.css';

const PaymentSuccessLoader = () => {
  const [countdown, setCountdown] = useState(15);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/home'); // Navigate to user's home page after countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="payment-success-loader">
      <div className="loader-container">
        <div className="success-icon">✓</div>
        <h2>Payment Successful!</h2>
        <p>Thank you for your payment</p>
        <div className="loader">
          <div className="spinner"></div>
        </div>
        <p className="countdown">Redirecting to home in {countdown} seconds...</p>
      </div>
    </div>
  );
};

export default PaymentSuccessLoader; 