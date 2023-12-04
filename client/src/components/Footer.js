// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f5f5f5' }}>
      <p>&copy; {new Date().getFullYear()} Eric Uehling and Mark Fuentes</p>
    </footer>
  );
};

export default Footer;
