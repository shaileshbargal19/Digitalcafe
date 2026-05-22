import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import AdminSidebar from '../components/AdminSidebar';
import CustomerLayout from '../components/CustomerLayout';
import '../styles/AdminDashboardNew.css';

import API_BASE_URL from '../apiConfig';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', gender: '', dob: '', email: '', phone: '',
        address: '', city: '', pincode: '', state: '', country: '',
        education: '', experienceYears: '', foodPreference: '', roleMetadata: '', password: ''
    });
    const [loading, setLoading] = useState(false);
    const { toasts, addToast, removeToast } = useToast();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        setFormData({
            firstName: stored.firstName || '',
            lastName: stored.lastName || '',
            gender: stored.gender || '',
            dob: stored.dob || '',
            email: stored.email || '',
            phone: stored.phone || '',
            address: stored.address || '',
            city: stored.city || '',
            pincode: stored.pincode || '',
            state: stored.state || '',
            country: stored.country || '',
            education: stored.education || '',
            experienceYears: stored.experienceYears || '',
            foodPreference: stored.foodPreference || '',
            roleMetadata: stored.roleMetadata || '',
            password: ''
        });
    }, [navigate]);

    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = { ...formData };
        if (user.role === 'CUSTOMER') {
            payload.roleMetadata = formData.foodPreference;
        }

        try {
            const r = await fetch(`${API_BASE_URL}/auth/profile/${user.id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (r.ok) {
                const updated = await r.json();
                localStorage.setItem('user', JSON.stringify(updated));
                setUser(updated);
                addToast('Profile updated successfully!', 'success');
            } else addToast('Failed to update profile', 'error');
        } catch { addToast('Network error', 'error'); }
        finally { setLoading(false); }
    };

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    const isAdmin = user.role === 'ADMIN';
    const isCustomer = user.role === 'CUSTOMER';
    const dashPath = isAdmin ? '/admin' : user.role === 'CAFE_OWNER' ? '/cafe/dashboard' : user.role === 'CUSTOMER' ? '/customer/dashboard' : '/staff';
    const inputStyle = { border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '.85rem', fontFamily: 'Inter,sans-serif', outline: 'none', width: '100%', background: 'var(--bg)', color: 'var(--text)', transition: 'border-color .2s' };
    const labelStyle = { fontSize: '.76rem', fontWeight: 700, marginBottom: 5, display: 'block', color: 'var(--text-2)' };
    const sectionTitle = { fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.7px', color: 'var(--text-3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 };
    const roleGrad = { ADMIN: 'linear-gradient(135deg,#f97316,#ef4444)', CAFE_OWNER: 'linear-gradient(135deg,#f97316,#ef4444)', CUSTOMER: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', CHEF: 'linear-gradient(135deg,#10b981,#3b82f6)', WAITER: 'linear-gradient(135deg,#10b981,#059669)' };

    const content = (
        <main className="adn-content" style={{ maxWidth: 860, margin: '0 auto', width: '100%', padding: isCustomer ? 0 : '24px' }}>
            <div className="adn-page-header">
                <div>
                    <h1 className="adn-page-title">My Profile</h1>
                    <p className="adn-page-sub">Manage your personal information</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 20 }}>
                {/* Profile Card */}
                <div className="adn-chart-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', gap: 12, textAlign: 'center', alignSelf: 'start' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: roleGrad[user.role] || '#64748b', color: 'white', fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(59,130,246,.3)' }}>
                        {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: '1rem' }}>{user.firstName} {user.lastName}</p>
                        <p style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: 3 }}>{user.email}</p>
                    </div>
                    <span className="adn-role-chip" style={{ marginTop: 4 }}>{user.role}</span>
                    {user.role === 'CUSTOMER' && (
                        <div style={{ marginTop: 12, width: '100%', background: 'var(--bg)', borderRadius: 10, padding: 14, textAlign: 'center' }}>
                            <p style={{ fontSize: '.72rem', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px' }}>Loyalty Points</p>
                            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>1,250</p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="adn-chart-card" style={{ padding: 28 }}>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Personal Info */}
                        <div>
                            <div style={sectionTitle}><span>👤</span> Personal Information</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={labelStyle}>First Name *</label>
                                    <input style={inputStyle} name="firstName" value={formData.firstName} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Last Name *</label>
                                    <input style={inputStyle} name="lastName" value={formData.lastName} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Gender</label>
                                    <select style={inputStyle} name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Date of Birth</label>
                                    <input style={inputStyle} type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Email (Read-only)</label>
                                    <input style={{ ...inputStyle, background: 'var(--surface)', cursor: 'not-allowed', color: 'var(--text-3)' }} value={formData.email} disabled />
                                </div>
                                <div>
                                    <label style={labelStyle}>Phone</label>
                                    <input style={inputStyle} name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9000 0000" />
                                </div>
                            </div>
                        </div>

                        {/* Education & Experience (if applicable) */}
                        {(user.role === 'CAFE_OWNER' || user.role === 'CHEF' || user.role === 'WAITER') && (
                            <div>
                                <div style={sectionTitle}><span>🎓</span> Education & Experience</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                    <div>
                                        <label style={labelStyle}>Highest Education</label>
                                        <input style={inputStyle} name="education" value={formData.education || ''} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Experience (Years)</label>
                                        <input style={inputStyle} type="number" name="experienceYears" value={formData.experienceYears || ''} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Role-specific Fields */}
                        {user.role === 'CAFE_OWNER' && (
                            <div>
                                <div style={sectionTitle}><span>☕</span> Cafe Information</div>
                                <div>
                                    <label style={labelStyle}>Cafe / Establishment Name</label>
                                    <input style={inputStyle} name="roleMetadata" value={formData.roleMetadata} onChange={handleChange} placeholder="e.g. Morning Dew Cafe" />
                                </div>
                            </div>
                        )}
                        {isAdmin && (
                            <div>
                                <div style={sectionTitle}><span>🔑</span> Administrative Info</div>
                                <div>
                                    <label style={labelStyle}>Admin ID / Staff Code</label>
                                    <input style={inputStyle} name="roleMetadata" value={formData.roleMetadata} onChange={handleChange} />
                                </div>
                            </div>
                        )}
                        {user.role === 'CUSTOMER' && (
                            <div>
                                <div style={sectionTitle}><span>🥗</span> Food Preference</div>
                                <select style={inputStyle} name="foodPreference" value={formData.foodPreference} onChange={handleChange}>
                                    <option value="">Select Preference</option>
                                    <option value="Veg">Vegetarian</option>
                                    <option value="Non-Veg">Non-Vegetarian</option>
                                    <option value="Vegan">Vegan</option>
                                </select>
                            </div>
                        )}

                        {/* Address */}
                        <div>
                            <div style={sectionTitle}><span>📍</span> Address</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={labelStyle}>Full Address</label>
                                    <input style={inputStyle} name="address" value={formData.address} onChange={handleChange} placeholder="Street, Area…" />
                                </div>
                                <div>
                                    <label style={labelStyle}>City</label>
                                    <input style={inputStyle} name="city" value={formData.city} onChange={handleChange} placeholder="Mumbai" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Pincode</label>
                                    <input style={inputStyle} name="pincode" value={formData.pincode || ''} onChange={handleChange} placeholder="400001" />
                                </div>
                                <div>
                                    <label style={labelStyle}>State</label>
                                    <input style={inputStyle} name="state" value={formData.state} onChange={handleChange} placeholder="Maharashtra" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Country</label>
                                    <input style={inputStyle} name="country" value={formData.country || ''} onChange={handleChange} placeholder="India" />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            {!isCustomer && <button type="button" className="adn-btn-sm" onClick={() => navigate(dashPath)}>Cancel</button>}
                            <button type="submit" className="adn-btn-download" disabled={loading}>
                                {loading ? '⏳ Saving…' : '💾 Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );

    if (isCustomer) {
        return (
            <CustomerLayout>
                <Toast toasts={toasts} removeToast={removeToast} />
                {content}
            </CustomerLayout>
        );
    }

    return (
        <div className="adn-root">
            <Toast toasts={toasts} removeToast={removeToast} />
            {isAdmin && <AdminSidebar user={user} />}

            <div className="adn-main-wrap">
                {/* Top Nav for non-customers */}
                <header className="adn-topnav">
                    <div className="adn-topnav-left">
                        {isAdmin ? (
                            <h2 className="adn-page-title" style={{ fontSize: '1.2rem' }}>Account Settings</h2>
                        ) : (
                            <>
                                <div className="adn-logo-icon">☕</div>
                                <span className="adn-logo-text">Digital<span className="adn-logo-accent"> Café</span></span>
                            </>
                        )}
                    </div>
                    <div className="adn-topnav-right">
                        <button className="adn-btn-sm" onClick={() => navigate(dashPath)}>← Dashboard</button>
                        <button className="adn-btn-download" style={{ fontSize: '.75rem', padding: '7px 14px' }}
                            onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>
                {content}
            </div>
        </div>
    );
};

export default Profile;
