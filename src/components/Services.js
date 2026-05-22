import React from 'react';
import '../styles/LandingStyles.css';

const services = [
  {
    title: 'Gourmet Selection',
    desc: 'Indulge in our handpicked menu featuring artisan ingredients and local flavors.',
    icon: '🍽️'
  },
  {
    title: 'Digital Concierge',
    desc: 'Streamlined table bookings and contactless ordering at your fingertips.',
    icon: '📱'
  },
  {
    title: 'Elite Membership',
    desc: 'Unlock private dining access, vintage collections, and bespoke rewards.',
    icon: '💎'
  },
  {
    title: 'Boutique Events',
    desc: 'From private tastings to corporate mixers, we host with industrial precision.',
    icon: '🥂'
  }
];

const Services = () => {
  return (
    <section id="services" className="services-section">
      <div className="container">
        <div className="header-stack">
          <h4 className="section-subtitle">Our Expertise</h4>
          <h2 className="section-title">Digital Cafe <span className="text-accent">Services</span></h2>
          <div className="gold-divider"></div>
        </div>
        <div className="services-grid">
          {services.map((s, i) => (
            <div key={i} className="premium-card service-box">
              <div className="icon-wrapper">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
              <div className="card-link">Learn More  →</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
