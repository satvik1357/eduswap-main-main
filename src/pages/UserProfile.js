// src/pages/UserProfile.js

import React from 'react';
import SendRequest from '../components/SendRequest'; // Updated path

const UserProfile = ({ receiverId }) => {
  return (
    <div>
      <h1>User Profile</h1>
      <SendRequest receiverId={receiverId} />
    </div>
  );
};

export default UserProfile;
