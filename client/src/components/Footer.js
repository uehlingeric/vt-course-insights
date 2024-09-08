import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [showFooter, setShowFooter] = useState(false);

  const handleScroll = () => {
    // Check if the user has reached the bottom of the page
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      setShowFooter(true);
    } else {
      setShowFooter(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {showFooter && (
        <footer style={{ textAlign: 'center', padding: '20px' }}>
          <p>&copy; {new Date().getFullYear()} Eric Uehling and Gandizh Azzizi</p>
        </footer>
      )}
    </>
  );
};

export default Footer;
