// Header.js
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from './VTlogo.png'; 

const Header = ({ isAuthenticated, handleSignOut, username }) => {
  const navigate = useNavigate();

  const navigateTo = (path) => {
    navigate(path);
  };

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px', backgroundColor: '#f5f5f5' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <img src={logo} alt="Logo" style={{ width: '150px', height: 'auto', marginRight: '10px' }} />
        </Link>
        <h1>Course Insights</h1>
      </div>
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