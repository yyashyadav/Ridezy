import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CaptainProtectWrapper = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('captainToken');
    if (!token) {
      navigate('/captain/login');
    }
  }, [navigate]);

  return (
    // Rest of the component code
  );
};

export default CaptainProtectWrapper; 