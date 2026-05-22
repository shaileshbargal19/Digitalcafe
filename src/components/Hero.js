import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingStyles.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-inner">
        {/* LEFT - rich text side */}
        <div className="hero-text-col">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            Exquisite Brews &amp; Bites
          </div>
          
          <h1 className="hero-title">
            The Future of 
            <span className="hero-title-accent">Digital Dining</span>
          </h1>
          
          <p className="hero-description">
            Experience a curated culinary journey powered by modern technology.
            From artisan coffee to gourmet collections, we redefine the cafe experience.
          </p>
          
          {/* Mini stats row */}
          <div className="hero-stats-row">
            {[
              { value: '38+', label: 'Partner Cafes' },
              { value: '4.9⭐', label: 'Average Rating' },
              { value: '12K+', label: 'Happy Guests' },
            ].map((s, i) => (
              <div key={i} className="hero-mini-stat">
                <span className="hero-mini-val">{s.value}</span>
                <span className="hero-mini-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-cta-row">
            <Link to="/register" className="hero-btn-primary">
              Get Started &nbsp;→
            </Link>
            <Link to="/login" className="hero-btn-outline">
              Sign In
            </Link>
          </div>
        </div>

        {/* RIGHT - beautiful image frame */}
        <div className="hero-image-col">
          <div className="hero-image-frame">
            <img 
              src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200" 
              alt="Premium restaurant with gourmet dining" 
              className="hero-img" 
            />
            {/* Floating badge over image */}
            <div className="hero-img-badge">
              <span className="hib-icon">🍽️</span>
              <div>
                <div className="hib-title">Live Orders</div>
                <div className="hib-sub">1,240 orders today</div>
              </div>
              <div className="hib-dot" />
            </div>

            <div className="hero-img-tag">
              ✨ "Exceptional taste, elegantly served"
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
