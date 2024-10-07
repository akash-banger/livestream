import React from 'react';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import OverlaySettingsPage from './pages/OverlaySettingsPage';
import LandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/overlay-settings" element={<OverlaySettingsPage />} />
            <Route path="/login" element={
              localStorage.getItem('userData') ? <Navigate to="/" /> : <LoginPage />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;