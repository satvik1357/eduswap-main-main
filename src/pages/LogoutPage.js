// src/pages/LogoutPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LogoutPage.css'; // Create this CSS file for styling

function LogoutPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement actual logout logic here
    // For demonstration, we will simply navigate to the home page
    navigate('/');
  };

  return (
    <div className="logout-page">
      <h1>Logout</h1>
      <p>You have been logged out successfully.</p>
      <button onClick={handleLogout}>Go to Home</button>
    </div>
  );
}

export default LogoutPage;
