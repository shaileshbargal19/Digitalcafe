import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = ({ user, collapsed }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');

    useEffect(() => {
        const storedTheme = localStorage.getItem('cafeTheme') || 'dark';
        setTheme(storedTheme);
        if (storedTheme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        localStorage.setItem('cafeTheme', nextTheme);
        if (nextTheme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
    };

    const navItems = [
        { label: 'Dashboard', icon: '⊞', path: '/admin' },
        { label: 'Users', icon: '👥', path: '/admin/users' },
        { label: 'Cafes', icon: '☕', path: '/admin/cafes' },
        { label: 'Analytics', icon: '📊', path: '/admin/analytics' },
        { label: 'Complaints', icon: '⚠️', path: '/admin/complaints' },
        { label: 'My Profile', icon: '👤', path: '/profile' },
    ];

    return (
        <aside className={`adn-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="adn-sidebar-brand">
                <div className="adn-logo-icon">☕</div>
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

            <div className="adn-sidebar-theme-toggle">
                <button
                    onClick={toggleTheme}
                    className="adn-theme-btn"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                    {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>
            </div>

            {!collapsed && (
                <div className="adn-sidebar-footer">
                    <div className="adn-user-mini">
                        <div className="adn-avatar-sm">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </div>
                        <div>
                            <p className="adn-um-name">{user?.firstName} {user?.lastName}</p>
                            <p className="adn-um-role">{user?.role}</p>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};

export default AdminSidebar;
