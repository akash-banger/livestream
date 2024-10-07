import React from 'react';
import LiveStreamPage from './LiveStreamPage';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userData')) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div>
      <LiveStreamPage />
    </div>
  );
};

export default LandingPage;