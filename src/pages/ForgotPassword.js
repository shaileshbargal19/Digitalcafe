import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingStyles.css';
import '../styles/AuthStyles.css';
import API_BASE_URL from '../apiConfig';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { toasts, addToast, removeToast } = useToast();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [passwords, setPasswords] = useState({ new: '', confirm: '' });

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`, { method: 'POST' });
            if (response.ok) {
                addToast('OTP sent to your email!', 'success');
                setStep(2);
            } else {
                const msg = await response.text();
                addToast(msg || 'User not found or error sending OTP', 'error');
            }
        } catch (error) {
            addToast('Network error. Please try again.', 'error');
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`, { method: 'POST' });
            if (response.ok) {
                addToast('OTP verified!', 'success');
                setStep(3);
            } else {
                addToast('Invalid OTP. Please try again.', 'error');
            }
        } catch (error) {
            addToast('Network error. Please try again.', 'error');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            addToast('Passwords do not match', 'error');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password?email=${encodeURIComponent(email)}&otp=${otp}&newPassword=${encodeURIComponent(passwords.new)}`, { method: 'POST' });
            if (response.ok) {
                addToast('Password set! Redirecting to login...', 'success', 2500);
                setTimeout(() => navigate('/login'), 2500);
            } else {
                addToast('Failed to reset password. OTP may be invalid or expired.', 'error');
            }
        } catch (error) {
            addToast('Network error. Please try again.', 'error');
        }
    };

    return (
        <div className="landing-page">
            <Navbar />
            <Toast toasts={toasts} removeToast={removeToast} />
            <div className="auth-hero-section" style={{
                minHeight: '100vh',
                padding: '120px 0 80px',
                background: 'var(--bg)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Subtle background glow */}
                <div style={{
                    position: 'absolute',
                    top: '-150px',
                    right: '-150px',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(249, 115, 22, .08) 0%, transparent 70%)',
                    zIndex: 0
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '20px' }}>
                        <Link to="/login" style={{ color: 'var(--orange)', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>←</span> Back to Login
                        </Link>
                    </div>

                    <div className="login-alignment-wrapper" style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(400px, 1.1fr) 1fr',
                        background: 'var(--surface)',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-xl)',
                        border: '1px solid var(--border)',
                        minHeight: '600px'
                    }}>
                        {/* Image Side (Left) */}
                        <div style={{
                            position: 'relative',
                            background: `linear-gradient(rgba(15, 23, 42, 0.45), rgba(15, 23, 42, 0.65)), url('/assets/img/auth-bg.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: '48px',
                            color: 'white'
                        }}>
                            <div style={{ position: 'relative', zIndex: 2 }}>
                                <div className="hero-eyebrow" style={{ color: 'var(--orange)', borderColor: 'rgba(249, 115, 22, 0.3)', background: 'rgba(249, 115, 22, 0.1)' }}>
                                    <span className="hero-eyebrow-dot" style={{ background: 'var(--orange)' }}></span>
                                    DIGITAL CAFE PLATFORM
                                </div>
                                <h2 style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2.8rem',
                                    marginBottom: '16px',
                                    color: '#ffffff'
                                }}>
                                    Account <br />Recovery <span className="hero-title-accent" style={{ display: 'inline', color: 'var(--orange)' }}>Protocol</span>
                                </h2>
                                <p style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: '1.6',
                                    fontSize: '1rem',
                                    maxWidth: '320px'
                                }}>
                                    Secure your account using our authenticated OTP verification process.
                                </p>
                            </div>
                            {/* Overlay for depth */}
                            <div style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'linear-gradient(to top, rgba(15, 15, 20, 0.8) 0%, transparent 50%)',
                                zIndex: 1
                            }}></div>
                        </div>

                        {/* Form Side (Right) */}
                        <div style={{ padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h4 style={{
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    letterSpacing: '1.5px',
                                    color: 'var(--text-3)',
                                    textTransform: 'uppercase',
                                    marginBottom: '10px'
                                }}>Step {step} of 3</h4>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--text)' }}>Password <span style={{ color: 'var(--orange)' }}>Reset</span></h2>
                                <div className="gold-divider" style={{ margin: '15px 0 0 0', width: '40px', background: 'var(--orange)' }}></div>
                            </div>

                            <div className="elite-form-matrix">
                                {step === 1 && (
                                    <form className="matrix-pane animate-pane" onSubmit={handleSendOTP}>
                                        <div className="field-group full-width">
                                            <label style={{ color: 'var(--text-2)' }}>Email Address</label>
                                            <input
                                                type="email"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px', width: '100%', padding: '0 16px' }}
                                            />
                                        </div>
                                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-3)' }}>
                                            We will send a 6-digit OTP to this email address.
                                        </p>
                                        <div className="form-actions-elite mt-4">
                                            <button type="submit" className="hero-btn-primary w-full-btn" style={{ height: '52px', borderRadius: '12px', fontSize: '1rem' }}>
                                                Send OTP →
                                            </button>
                                        </div>
                                    </form>
                                )}

                                {step === 2 && (
                                    <form className="matrix-pane animate-pane" onSubmit={handleVerifyOTP}>
                                        <div className="field-group full-width">
                                            <label style={{ color: 'var(--text-2)' }}>Enter 6-Digit OTP</label>
                                            <input
                                                type="text"
                                                maxLength="6"
                                                placeholder="XXXXXX"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                required
                                                style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px', width: '100%', padding: '0 16px', letterSpacing: '4px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}
                                            />
                                        </div>
                                        <div className="login-options mt-2" style={{ textAlign: 'center' }}>
                                            <button type="button" onClick={() => console.log('Resending OTP')} style={{ background: 'none', border: 'none', color: 'var(--orange)', cursor: 'pointer', fontWeight: '600' }}>Resend OTP</button>
                                        </div>
                                        <div className="form-actions-elite split mt-4" style={{ display: 'flex', gap: '16px' }}>
                                            <button type="button" className="hero-btn-outline" onClick={() => setStep(1)} style={{ flex: 1, height: '52px', borderRadius: '12px' }}>Back</button>
                                            <button type="submit" className="hero-btn-primary" style={{ flex: 2, height: '52px', borderRadius: '12px' }}>Verify OTP</button>
                                        </div>
                                    </form>
                                )}

                                {step === 3 && (
                                    <form className="matrix-pane animate-pane" onSubmit={handleResetPassword}>
                                        <div className="field-group full-width">
                                            <label style={{ color: 'var(--text-2)' }}>New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Create new password"
                                                value={passwords.new}
                                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                                required
                                                style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px', width: '100%', padding: '0 16px' }}
                                            />
                                        </div>
                                        <div className="field-group full-width mt-4">
                                            <label style={{ color: 'var(--text-2)' }}>Confirm Password</label>
                                            <input
                                                type="password"
                                                placeholder="Repeat new password"
                                                value={passwords.confirm}
                                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                                required
                                                style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px', width: '100%', padding: '0 16px' }}
                                            />
                                        </div>
                                        <div className="form-actions-elite mt-4">
                                            <button type="submit" className="hero-btn-primary w-full-btn" style={{ height: '52px', borderRadius: '12px', fontSize: '1rem' }}>
                                                Save New Password
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
