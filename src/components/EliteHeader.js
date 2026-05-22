import React from 'react';
import { useNavigate } from 'react-router-dom';

const EliteHeader = ({ title, subtitle, user, type = 'default' }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className={`elite-dashboard-header ${type}`}>
            <div className="header-glass-layer"></div>
            <div className="header-container">
                <div className="header-left">
                    {subtitle && <span className="header-subtitle">{subtitle}</span>}
                    <h1 className="header-title">{title || 'Dashboard'}</h1>
                </div>

                <div className="header-right">
                    {user && (
                        <div className="user-profile-elite" onClick={handleLogout} title="Click to Logout">
                            <div className="profile-info">
                                <span className="profile-name">{user.firstName} {user.lastName}</span>
                                <span className="profile-role">{user.role}</span>
                            </div>
                            <div className="profile-avatar-glow">
                                <div className="avatar-core">
                                    {user.firstName[0]}{user.lastName[0]}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="header-accent-line"></div>
        </header>
    );
};

export default EliteHeader;
