import React from 'react';
import '../styles/LandingStyles.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <h2 className="logo">DIGITAL<span className="text-accent">CAFE</span></h2>
          <p className="brand-desc">
            Redefining the industrial cafe experience through
            unmatched quality and digital innovation.
          </p>
          <div className="social-links">
            <a href="#">IG</a>
            <a href="#">TW</a>
            <a href="#">LI</a>
          </div>
        </div>
        <div className="footer-nav">
          <div className="nav-col">
            <h6>Explore</h6>
            <a href="#services">Services</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-col">
            <h6>Legal</h6>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2024 Digital Cafe Platform. Established for Excellence.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
