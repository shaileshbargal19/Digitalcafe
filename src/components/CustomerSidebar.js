import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CustomerSidebar = ({ user, collapsed, theme, setTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/customer/dashboard' },
        { id: 'explore', label: 'Explore Cafes', icon: '🗺️', path: '/customer/explore' },
        { id: 'orders', label: 'My Orders', icon: '📦', path: '/customer/orders' },
        { id: 'bookings', label: 'Bookings', icon: '📅', path: '/customer/bookings' },
        { id: 'vouchers', label: 'Vouchers', icon: '🎟️', path: '/customer/vouchers' },
        { id: 'profile', label: 'My Profile', icon: '👤', path: '/profile' },
    ];

    return (
        <aside className={`adn-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="adn-sidebar-brand">
                <div className="adn-logo-icon" style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>☕</div>
                {!collapsed && (
                    <span className="adn-logo-text">
                        Digital<span className="adn-logo-accent"> Café</span>
                    </span>
                )}
            </div>
            <nav className="adn-nav">
                {navItems.map((item, i) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={i}
                            className={`adn-nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            title={collapsed ? item.label : ''}
                        >
                            <span className="adn-nav-icon">{item.icon}</span>
                            {!collapsed && <span className="adn-nav-label">{item.label}</span>}
                            {isActive && !collapsed && <span className="adn-nav-pill" />}
                        </button>
                    );
                })}
            </nav>
            {!collapsed && (
                <div className="adn-sidebar-footer">
                    <button 
                        style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: '.9rem', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }} 
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    >
                        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <div className="adn-user-mini">
                        <div className="adn-avatar-sm" style={{ background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' }}>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div>
                            <p className="adn-um-name">{user?.firstName} {user?.lastName}</p>
                            <p className="adn-um-role">🥈 Silver Member</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default CustomerSidebar;
