import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingStyles.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('cafeTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <nav className={`navbar ${scrolled ? 'glass scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          DIGITAL<span className="text-accent">CAFE</span>
        </Link>
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/#services">Services</Link>
          <Link to="/#about">About</Link>
          <Link to="/#contact">Contact</Link>
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Toggle Theme">
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <Link to="/login" className="login-btn">Sign In</Link>
          <Link to="/register" className="btn-primary">Join Now</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
