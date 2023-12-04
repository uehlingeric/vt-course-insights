// Header.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAuthenticated, handleSignOut, username }) => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f5f5f5' }}>
      <h1>CourseCrafters</h1>
      <div>
        <button onClick={() => navigateTo('/')} style={{ marginRight: '10px' }}>Home</button>
        {!isAuthenticated ? (
          <>
            <button onClick={() => navigateTo('/signin')} style={{ marginRight: '10px' }}>Sign In</button>
            <button onClick={() => navigateTo('/signup')} style={{ marginRight: '10px' }}>Sign Up</button>
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>Go Back</button>
          </>
        ) : (
          <>
            <button onClick={() => navigateTo('/schedule')} style={{ marginRight: '10px' }}>Schedule</button>
            <button onClick={() => navigateTo('/user')} style={{ marginRight: '10px' }}>{username}</button>
            <button onClick={() => navigate(-1)} style={{ marginRight: '10px' }}>Go Back</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
