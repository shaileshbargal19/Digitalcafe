import React from 'react';
import '../styles/LandingStyles.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container about-grid">
        <div className="about-visual">
          <div className="about-image-frame">
            <img 
              src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=1000" 
              alt="Artisanal culinary preparation" 
              className="about-img" 
            />
            <div className="about-badge">
              <span className="about-badge-icon">🍳</span>
              <div>
                <div className="about-badge-title">Crafted with Care</div>
                <div className="about-badge-sub">Michelin Quality standards</div>
              </div>
            </div>
          </div>
        </div>
        <div className="about-content">
          <h4 className="section-subtitle">Since 2024</h4>
          <h2 className="section-title">A Legacy of <br /> <span className="text-accent">Modern Taste</span></h2>
          <p>
            Digital Cafe was founded on the principle that high-end hospitality
            can be seamlessly integrated with cutting-edge technology. We don't
            just serve coffee; we curate an atmosphere of innovation and excellence.
            Each ingredient is sustainably sourced, and every recipe is refined to perfection.
          </p>
          <div className="signature">
            <div className="sig-line"></div>
            <p className="sig-text">Founder of Digital Cafe</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
