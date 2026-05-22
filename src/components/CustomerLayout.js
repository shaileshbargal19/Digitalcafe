import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerSidebar from './CustomerSidebar';

const CustomerLayout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const overlayRef = useRef(null);
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');

    useEffect(() => {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        localStorage.setItem('cafeTheme', theme);
    }, [theme]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
    }, [navigate]);

    useEffect(() => {
        const h = e => { if (!overlayRef.current?.contains(e.target)) setProfileOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /><p>Loading...</p></div>;

    return (
        <div className="adn-root">
            <CustomerSidebar user={user} collapsed={!sidebarOpen} theme={theme} setTheme={setTheme} />
            <div className="adn-main-wrap">
                <header className="adn-topnav" ref={overlayRef}>
                    <div className="adn-topnav-left">
                        <button className="adn-toggle-btn" onClick={() => setSidebarOpen(p => !p)}>
                            <span /><span /><span />
                        </button>
                        <div className="adn-search-box">
                            <span>🔍</span>
                            <input placeholder="Search cafes, items, vouchers..." />
                        </div>
                    </div>
                    <div className="adn-topnav-right">
                         <button style={{ position: 'relative', background: 'var(--bg)', border: '1.5px solid var(--border)', borderRadius: 10, width: 38, height: 38, cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🔔<span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button className="adn-profile-btn" onClick={() => setProfileOpen(p => !p)}>
                                <div className="adn-avatar" style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <div className="adn-profile-info">
                                    <span className="adn-profile-name">{user.firstName} {user.lastName}</span>
                                    <span className="adn-profile-role">Customer</span>
                                </div>
                                <span style={{ fontSize: '9px', opacity: .4, marginLeft: 4 }}>▼</span>
                            </button>
                            {profileOpen && (
                                <div className="adn-dropdown">
                                    <div className="adn-dp-header">{user.email}</div>
                                    <button className="adn-dp-item" onClick={() => navigate('/profile')}>👤  My Profile</button>
                                    <button className="adn-dp-item" onClick={() => navigate('/customer/orders')}>📦  My Orders</button>
                                    <button className="adn-dp-item" onClick={() => navigate('/customer/vouchers')}>🎟️  My Vouchers</button>
                                    <div className="adn-dp-divider" />
                                    <button className="adn-dp-item danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪  Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="adn-content">{children}</main>
            </div>
        </div>
    );
};

export default CustomerLayout;
