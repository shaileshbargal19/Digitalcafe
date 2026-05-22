import React from 'react';
import '../styles/LandingStyles.css';

const Contact = () => {
    return (
        <section id="contact" className="contact-section">
            <div className="container">
                <div className="contact-wrapper premium-card">
                    <div className="contact-details">
                        <h4 className="section-subtitle">Reach Out</h4>
                        <h2 className="section-title">Visit Our <span className="text-accent">Café Hub</span></h2>
                        <p className="contact-intro">Let's discuss how our digital platform can elevate your experience.</p>
                        <div className="detail-list">
                            <div className="detail-item">
                                <span className="icon">📍</span>
                                <div>
                                    <h6>Location</h6>
                                    <p>101 Industrial Avenue, Tech District</p>
                                </div>
                            </div>
                            <div className="detail-item">
                                <span className="icon">✉️</span>
                                <div>
                                    <h6>Email</h6>
                                    <p>concierge@digitalcafe.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <form className="contact-form">
                        <div className="form-row">
                            <div className="input-group">
                                <label>Name</label>
                                <input type="text" placeholder="Your Name" />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input type="email" placeholder="Email Address" />
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Message</label>
                            <textarea placeholder="How can we help you?" rows="5"></textarea>
                        </div>
                        <button type="submit" className="btn-accent w-full">Send Inquiry</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;
