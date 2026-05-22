import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/LandingStyles.css';
import '../styles/AuthStyles.css';
import API_BASE_URL from '../apiConfig';

const Login = () => {
    const navigate = useNavigate();
    const { toasts, addToast, removeToast } = useToast();
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        role: 'CUSTOMER'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('user', JSON.stringify(user));
                addToast('Login Successful', 'success', 2500);

                setTimeout(() => {
                    if (user.role === 'ADMIN') {
                        navigate('/admin');
                    } else if (user.role === 'CAFE_OWNER') {
                        navigate('/cafe/dashboard');
                    } else if (user.role === 'CHEF') {
                        navigate('/chef/dashboard');
                    } else if (user.role === 'WAITER') {
                        navigate('/waiter/dashboard');
                    } else if (user.role === 'CUSTOMER') {
                        navigate('/customer/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                }, 1500);
            } else {
                if (response.status === 403) {
                    addToast('Account pending approval — contact admin', 'error', 4000);
                } else {
                    addToast('Login Failed: Invalid email, password or role', 'error');
                }
            }
        } catch (error) {
            console.error('Login failed:', error);
            addToast('Server not responding', 'error');
        }
    };

    return (
        <div className="landing-page">
            <Navbar />

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
                    <Toast toasts={toasts} removeToast={removeToast} />

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
                                    Industrial <br />Dining <span className="hero-title-accent" style={{ display: 'inline', color: 'var(--orange)' }}>Reimagined</span>
                                </h2>
                                <p style={{
                                    color: 'rgba(255,255,255,0.9)',
                                    lineHeight: '1.6',
                                    fontSize: '1rem',
                                    maxWidth: '320px'
                                }}>
                                    Experience the fusion of heritage atmosphere and modern digital convenience.
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
                                }}>Secure Portal Access</h4>
                                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--text)' }}>Welcome <span style={{ color: 'var(--orange)' }}>Back</span></h2>
                                <div className="gold-divider" style={{ margin: '15px 0 0 0', width: '40px', background: 'var(--orange)' }}></div>
                            </div>

                            <form className="elite-form-matrix" onSubmit={handleSubmit}>
                                <div className="field-group full-width">
                                    <label style={{ color: 'var(--text-2)' }}>Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="alex.p@example.com"
                                        value={credentials.email}
                                        onChange={handleChange}
                                        required
                                        style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px' }}
                                    />
                                </div>
                                <div className="field-group full-width mt-4">
                                    <label style={{ color: 'var(--text-2)' }}>Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px' }}
                                    />
                                </div>

                                <div className="field-group full-width mt-4">
                                    <label style={{ color: 'var(--text-2)' }}>Portal Role</label>
                                    <select
                                        name="role"
                                        value={credentials.role}
                                        onChange={handleChange}
                                        className="elite-select"
                                        style={{ height: '52px', border: '1.5px solid var(--border)', borderRadius: '12px' }}
                                        required
                                    >
                                        <option value="CUSTOMER">Customer Portal</option>
                                        <option value="CAFE_OWNER">Cafe Owner Portal</option>
                                        <option value="CHEF">Chef Dashboard</option>
                                        <option value="WAITER">Waiter Dashboard</option>
                                        <option value="ADMIN">System Administrator</option>
                                    </select>
                                </div>

                                <div className="login-options mt-3" style={{ textAlign: 'right' }}>
                                    <Link to="/forgot-password" style={{ color: 'var(--orange)', fontWeight: '600', fontSize: '0.9rem', textDecoration: 'none' }}>Forgot Password?</Link>
                                </div>

                                <div className="form-actions-elite mt-4">
                                    <button type="submit" className="hero-btn-primary w-full-btn" style={{ height: '52px', borderRadius: '12px', fontSize: '1rem' }}>
                                        Sign In to Portal
                                    </button>
                                </div>

                                <div className="auth-footer-simple mt-4" style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-2)' }}>
                                        New to the platform? <Link to="/register" style={{ color: 'var(--orange)', fontWeight: '800', textDecoration: 'none' }}>Join Now</Link>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Login;
