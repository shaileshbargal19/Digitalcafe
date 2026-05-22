import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import '../styles/CafeOwnerDashboard.css';
import API_BASE_URL from '../apiConfig';

const StaffManager = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');
    useEffect(() => {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        localStorage.setItem('cafeTheme', theme);
    }, [theme]);

    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toasts, addToast, removeToast } = useToast();
    const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER' });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored); fetchStaff();
    }, [navigate]);

    const fetchStaff = async () => {
        setLoading(true);
        const current = JSON.parse(localStorage.getItem('user'));
        try {
            if (current?.role === 'CAFE_OWNER') {
                // Fetch only staff belonging to this cafe owner
                const r = await fetch(`${API_BASE_URL}/cafe/${current.id}/staff`);
                if (r.ok) setStaff(await r.json());
            } else {
                // Admin: fetch all staff
                const r = await fetch(`${API_BASE_URL}/auth/users`);
                if (r.ok) { const all = await r.json(); setStaff(all.filter(u => u.role === 'CHEF' || u.role === 'WAITER')); }
            }
        } catch { }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const current = JSON.parse(localStorage.getItem('user'));
        try {
            const r = await fetch(`${API_BASE_URL}/auth/add-staff?ownerId=${current.id}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (r.ok) {
                addToast('Staff member added!', 'success');
                setShowModal(false); setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'WAITER' });
                fetchStaff();
            } else addToast('Failed to add staff', 'error');
        } catch { addToast('Request failed', 'error'); }
    };

    const handleTerminate = async (staffId) => {
        if (!window.confirm('Remove this staff member?')) return;
        const current = JSON.parse(localStorage.getItem('user'));
        try {
            const r = await fetch(`${API_BASE_URL}/auth/users/${staffId}?requesterId=${current.id}`, { method: 'DELETE' });
            if (r.ok) { addToast('Staff member removed', 'success'); fetchStaff(); }
            else addToast('Delete failed', 'error');
        } catch { addToast('Request failed', 'error'); }
    };

    if (!user) return <div className="cafe-loading"><div className="cafe-spinner" /></div>;

    const chefCount = staff.filter(s => s.role === 'CHEF').length;
    const waiterCount = staff.filter(s => s.role === 'WAITER').length;
    const filtered = staff.filter(s => !searchTerm || `${s.firstName} ${s.lastName} ${s.email} ${s.role}`.toLowerCase().includes(searchTerm.toLowerCase()));
    const inputStyle = { border: '1.5px solid var(--cafe-border)', borderRadius: 10, padding: '10px 14px', fontSize: '.85rem', fontFamily: 'Outfit,sans-serif', outline: 'none', width: '100%', background: 'var(--cafe-hover)', color: 'var(--cafe-text-1)' };

    return (
        <div className="cafe-root">
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Sidebar */}
            <aside className="cafe-sidebar open">
                <div className="cafe-sidebar-brand">
                    <div className="cafe-logo-icon">☕</div>
                    <span className="cafe-logo-text">Digital<span className="cafe-logo-accent"> Café</span></span>
                </div>
                <nav className="cafe-nav">
                    {(user?.role === 'CAFE_OWNER' ? [
                        { label: 'Dashboard', icon: '⊞', path: '/cafe/dashboard' },
                        { label: 'Live Orders', icon: '📦', path: '/cafe/orders' },
                        { label: 'Order History', icon: '📜', path: '/cafe/history' },
                        { label: 'Menu Manager', icon: '🍽️', path: '/cafe/menu' },
                        { label: 'Bookings', icon: '📅', path: '/cafe/bookings' },
                        { label: 'Staff', icon: '👨‍🍳', path: '/cafe/staff', active: true },
                        { label: 'My Profile', icon: '👤', path: '/profile' },
                    ] : [
                        { label: 'Dashboard', icon: '⊞', path: user.role === 'CAFE_OWNER' ? '/cafe/dashboard' : '/admin' },
                        { label: 'Live Orders', icon: '📦', path: '/admin/orders' },
                        { label: 'Menu Manager', icon: '🍽️', path: '/admin/menu' },
                        { label: 'Staff', icon: '👨‍🍳', path: '/admin/staff', active: true },
                    ]).map((item, i) => (
                        <button key={i} className={`cafe-nav-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}>
                            <span className="cafe-nav-icon">{item.icon}</span>
                            <span className="cafe-nav-label">{item.label}</span>
                            {item.active && <span className="cafe-nav-pill" />}
                        </button>
                    ))}
                </nav>
                <div className="cafe-sidebar-footer">
                    <button className="cafe-btn-secondary" style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: '.9rem' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
                    
                    <div className="cafe-user-mini">
                        <div className="cafe-avatar-sm">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                        <div><p className="cafe-um-name">{user.firstName} {user.lastName}</p><p className="cafe-um-role">{user.role}</p></div>
                    </div>
                </div>
            </aside>

            <div className="cafe-main-wrap">
                <header className="cafe-topnav">
                    <div className="cafe-topnav-left">
                        <div className="cafe-search-box">
                            <span>🔍</span>
                            <input placeholder="Search staff by name, email, role…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="cafe-topnav-right">
                        <button className="cafe-btn-primary" style={{ padding: '10px 24px', fontSize: '.85rem', borderRadius: 12 }} onClick={() => setShowModal(true)}>+ Add Staff</button>
                        <button className="cafe-btn-download" style={{ fontSize: '.75rem', padding: '10px 18px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)', color: 'white', border: 'none' }}
                            onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="cafe-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.65)), url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #10b981 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Staff Management</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Manage your cafe's culinary team, waiters, and schedule assignments.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                👥 {staff.length} team members
                            </div>
                        </div>
                        <div style={{ zIndex: 1 }}>
                            <button className="cafe-btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', boxShadow: '0 0 20px rgba(16,185,129,0.3)', padding: '12px 24px', fontSize: '.9rem' }} onClick={() => setShowModal(true)}>+ Onboard Staff</button>
                        </div>
                    </div>

                    {/* Stat Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 32 }}>
                        {[
                            { label: 'Total Staff', value: staff.length, icon: '👥', color: '#3b82f6' },
                            { label: 'Chefs', value: chefCount, icon: '👨‍🍳', color: '#f97316' },
                            { label: 'Waiters', value: waiterCount, icon: '🤵', color: '#10b981' },
                        ].map((c, i) => (
                            <div className="cafe-summary-card" key={i}>
                                <div className="cafe-card-top">
                                    <div className="cafe-card-icon" style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
                                </div>
                                <div className="cafe-card-value">{c.value}</div>
                                <div className="cafe-card-label">{c.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Staff Table */}
                    <div className="cafe-table-card" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 380px)' }}>
                        {loading ? (
                            <div className="cafe-loading" style={{ height: 200 }}><div className="cafe-spinner" /></div>
                        ) : (
                            <table className="cafe-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '32%', textAlign: 'left' }}>Staff</th>
                                        <th style={{ width: '26%', textAlign: 'left' }}>Contact</th>
                                        <th style={{ width: '14%', textAlign: 'center' }}>Role</th>
                                        <th style={{ width: '14%', textAlign: 'center' }}>Status</th>
                                        <th style={{ width: '14%', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((person, i) => (
                                        <tr key={person.id}>
                                            <td>
                                                <div className="cafe-user-cell" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div className="cafe-avatar-xs" style={{ background: person.role === 'CHEF' ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #10b981, #059669)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.2rem', flexShrink: 0, boxShadow: 'var(--shadow-glow)' }}>
                                                        {person.firstName?.[0]}{person.lastName?.[0]}
                                                    </div>
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <p className="cafe-cell-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.firstName} {person.lastName}</p>
                                                        <p className="cafe-cell-email" style={{ opacity: 0.7 }}>ID: #{person.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="cafe-cell-name" style={{ marginBottom: 2 }}>{person.phone || 'N/A'}</p>
                                                <p className="cafe-cell-email" style={{ opacity: 0.7 }}>{person.email}</p>
                                            </td>
                                            <td style={{ textAlign: 'center' }}><span className="cafe-role-chip">{person.role}</span></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={person.status === 'APPROVED' ? 'cafe-badge green' : person.status === 'PENDING' ? 'cafe-badge orange' : 'cafe-badge red'}>
                                                    {person.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                    <button className="cafe-btn-sm" style={{ color: 'var(--cafe-accent)' }} onClick={() => handleTerminate(person.id)}>🗑️ Remove</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--cafe-text-3)', fontStyle: 'italic', fontSize: '1rem' }}>No staff found. Add your first team member!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Add Staff Modal */}
                    {showModal && createPortal(
                        <div className="cafe-modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="cafe-modal-card cafe-modal-card-form" onClick={e => e.stopPropagation()}>
                                <div className="cafe-modal-form-header">
                                    <h2>👨‍🍳 Add Staff Member</h2>
                                    <button className="cafe-modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
                                </div>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        {[['firstName', 'First Name', 'e.g. Ravi'], ['lastName', 'Last Name', 'e.g. Kumar']].map(([n, l, p]) => (
                                            <div key={n}>
                                                <label className="cafe-modal-label">{l} *</label>
                                                <input className="cafe-modal-input" name={n} value={formData[n]} onChange={e => setFormData(prev => ({ ...prev, [n]: e.target.value }))} placeholder={p} required />
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <label className="cafe-modal-label">Email *</label>
                                        <input className="cafe-modal-input" type="email" name="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="staff@cafe.com" required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label className="cafe-modal-label">Phone</label>
                                            <input className="cafe-modal-input" name="phone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9000 0000" />
                                        </div>
                                        <div>
                                            <label className="cafe-modal-label">Role *</label>
                                            <select className="cafe-modal-input" name="role" value={formData.role} onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}>
                                                <option value="WAITER">Waiter</option>
                                                <option value="CHEF">Chef</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="cafe-modal-footer end" style={{ marginTop: 4 }}>
                                        <button type="button" className="cafe-modal-btn secondary sm" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="cafe-modal-btn primary sm">Add Staff</button>
                                    </div>
                                </form>
                            </div>
                        </div>,
                        document.body
                    )}
                </main>
            </div>
        </div>
    );
};

export default StaffManager;
