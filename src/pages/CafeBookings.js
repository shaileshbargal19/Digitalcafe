import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/CafeOwnerDashboard.css';

const BOOKING_TYPE_CFG = {
    TABLE: { icon: '🍽️', label: 'Table Booking', color: '#3b82f6', grad: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
    BIRTHDAY: { icon: '🎂', label: 'Birthday Hall', color: '#f97316', grad: 'linear-gradient(135deg,#f97316,#ef4444)' },
    FUNCTION: { icon: '🎊', label: 'Function Hall', color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#06b6d4)' },
};

const STATUS_CFG = {
    PENDING: { bg: '#fef3c7', color: '#b45309', dot: '#d97706', label: 'Pending' },
    CONFIRMED: { bg: '#dcfce7', color: '#15803d', dot: '#16a34a', label: '✓ Confirmed' },
    CANCELLED: { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626', label: 'Cancelled' },
};

const CafeBookings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');
    useEffect(() => {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        localStorage.setItem('cafeTheme', theme);
    }, [theme]);

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [activeType, setActiveType] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [showSuccessPop, setShowSuccessPop] = useState(null);

    const nav = [
        { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/cafe/dashboard' },
        { id: 'orders', label: 'Live Orders', icon: '📦', path: '/cafe/orders' },
        { id: 'history', label: 'Order History', icon: '📜', path: '/cafe/history' },
        { id: 'menu', label: 'Menu Manager', icon: '🍽️', path: '/cafe/menu' },
        { id: 'bookings', label: 'Bookings', icon: '📅', path: '/cafe/bookings' },
        { id: 'staff', label: 'Staff', icon: '👨‍🍳', path: '/cafe/staff' },
        { id: 'profile', label: 'My Profile', icon: '👤', path: '/profile' },
    ];

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBookings = useCallback(async (uid) => {
        setLoading(true);
        try {
            const r = await fetch(`/api/bookings/cafe/${uid}`);
            if (r.ok) setBookings(await r.json());
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        fetchBookings(stored.id);
    }, [navigate, fetchBookings]);

    if (!user) return <div className="cafe-loading"><div className="cafe-spinner" /></div>;

    /* ── Stats ──────────────────────────────────────────────────────────────── */
    const pending = bookings.filter(b => b.status === 'PENDING');
    const confirmed = bookings.filter(b => b.status === 'CONFIRMED');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.bookingDate === todayStr);

    /* ── Filter ─────────────────────────────────────────────────────────────── */
    const filtered = bookings
        .filter(b => activeTab === 'all' || b.status === activeTab.toUpperCase())
        .filter(b => activeType === 'all' || b.bookingType === activeType)
        .filter(b => !search
            || (b.cafeName || '').toLowerCase().includes(search.toLowerCase())
            || String(b.id).includes(search)
            || (b.bookingDate || '').includes(search)
            || (b.bookingType || '').toLowerCase().includes(search.toLowerCase())
        );

    /* ── Update booking status ──────────────────────────────────────────────── */
    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            const r = await fetch(`/api/bookings/${id}/status?status=${status}`, { method: 'PUT' });
            if (r.ok) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
                if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, status }));
                if (status === 'CONFIRMED') {
                    const b = bookings.find(x => x.id === id);
                    setShowSuccessPop(b || { id });
                } else {
                    showToast(`Booking #${id} cancelled ✓`);
                }
            } else showToast('Failed to update', 'error');
        } catch { showToast('Network error', 'error'); }
        finally { setUpdatingId(null); }
    };

    const TABS = [
        { id: 'all', label: 'All', count: bookings.length },
        { id: 'pending', label: 'Pending', count: pending.length },
        { id: 'confirmed', label: 'Confirmed', count: confirmed.length },
        { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'CANCELLED').length },
    ];

    const TYPES = [
        { id: 'all', label: 'All Types' },
        { id: 'TABLE', label: '🍽️ Table' },
        { id: 'BIRTHDAY', label: '🎂 Birthday' },
        { id: 'FUNCTION', label: '🎊 Function' },
    ];

    return (
        <div className="cafe-root">
            {/* ════ Sidebar ════ */}
            <aside className={`cafe-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="cafe-sidebar-brand">
                    <div className="cafe-logo-icon">☕</div>
                    {sidebarOpen && <span className="cafe-logo-text">My<span className="cafe-logo-accent"> Café</span></span>}
                </div>
                <nav className="cafe-nav">
                    {nav.map(item => (
                        <button key={item.id} className={`cafe-nav-item ${item.id === 'bookings' ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}>
                            <span className="cafe-nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="cafe-nav-label">{item.label}</span>}
                            {item.id === 'bookings' && <span className="cafe-nav-pill" />}
                            {item.id === 'bookings' && pending.length > 0 && (
                                <span className="cafe-notif-dot" style={{ position: 'relative', top: 0, right: 0, marginLeft: 'auto' }}>{pending.length}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="cafe-sidebar-footer">
                    <button className="cafe-btn-secondary" style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: '.9rem' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
                    
                    {sidebarOpen && (
                        <div className="cafe-user-mini">
                            <div className="cafe-avatar-sm" style={{ background: 'linear-gradient(135deg, var(--orange), var(--red))' }}>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                                <p className="cafe-um-name">{user.firstName} {user.lastName}</p>
                                <p className="cafe-um-role">Café Owner</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* ════ Main ════ */}
            <div className="cafe-main-wrap">
                <header className="cafe-topnav">
                    <div className="cafe-topnav-left">
                        <button className="cafe-toggle-btn" onClick={() => setSidebarOpen(p => !p)}>
                            <span /><span /><span />
                        </button>
                        <div className="cafe-search-box">
                            <span>🔍</span>
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..." />
                            {search && <button onClick={() => setSearch('')} className="cafe-clear-btn">✕</button>}
                        </div>
                    </div>
                    <div className="cafe-topnav-right">
                        <button className="cafe-icon-btn" onClick={() => { setLoading(true); fetchBookings(user.id); }}>
                            🔄
                        </button>
                        <div style={{ position: 'relative' }}>
                            <button className="cafe-profile-btn" onClick={() => setProfileOpen(p => !p)}>
                                <div className="cafe-avatar" style={{ background: 'linear-gradient(135deg, var(--orange), var(--red))' }}>
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <div className="cafe-profile-info">
                                    <span className="cafe-profile-name">{user.firstName} {user.lastName}</span>
                                    <span className="cafe-profile-role">Café Owner</span>
                                </div>
                                <span style={{ fontSize: '9px', opacity: .4, marginLeft: 4 }}>▼</span>
                            </button>
                            {profileOpen && (
                                <div className="cafe-dropdown">
                                    <div className="cafe-dp-header">{user.email}</div>
                                    <button className="cafe-dp-item" onClick={() => navigate('/cafe/dashboard')}>⊞ Dashboard</button>
                                    <button className="cafe-dp-item" onClick={() => navigate('/cafe/menu')}>🍽️ Menu Manager</button>
                                    <div className="cafe-dp-divider" />
                                    <button className="cafe-dp-item danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="cafe-content">
                    {/* Page Header */}
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.65)), url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=2070&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #3b82f6 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Booking Management</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Manage reservations, table bookings, and events for your cafe's floor plan.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                📅 {todayBookings.length} bookings today
                            </div>
                        </div>
                        <div className="cafe-header-actions" style={{ zIndex: 1 }}>
                            <button className="cafe-btn-download" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', boxShadow: '0 0 20px rgba(59,130,246,0.3)', padding: '12px 24px', fontSize: '.9rem' }} onClick={() => { setLoading(true); fetchBookings(user.id); }}>🔄 Refresh Floor Data</button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <section className="cafe-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {[
                            { label: 'Total Bookings', val: bookings.length, icon: '📅', color: 'var(--blue)' },
                            { label: 'Pending Review', val: pending.length, icon: '⏳', color: 'var(--orange)', urgent: pending.length > 0 },
                            { label: 'Confirmed', val: confirmed.length, icon: '✅', color: 'var(--green)' },
                            { label: "Today's Bookings", val: todayBookings.length, icon: '🗓️', color: 'var(--purple)' },
                        ].map((s, i) => (
                            <div key={i} className="cafe-summary-card" style={{ '--card-accent': s.color }}>
                                <div className="cafe-card-top">
                                    <div className="cafe-card-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
                                    {s.urgent && <span className="cafe-card-trend down">Action Required</span>}
                                </div>
                                <div className="cafe-card-value">{s.val}</div>
                                <div className="cafe-card-label">{s.label}</div>
                            </div>
                        ))}
                    </section>

                    {/* Filters Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {TYPES.map(t => (
                                <button key={t.id} onClick={() => setActiveType(t.id)}
                                    className={`cafe-btn-sm ${activeType === t.id ? 'active' : ''}`}
                                    style={{
                                        padding: '6px 14px', borderRadius: 10, border: '1px solid var(--border)',
                                        background: activeType === t.id ? 'var(--orange)' : 'var(--surface)',
                                        color: activeType === t.id ? 'white' : 'var(--text-2)',
                                        fontWeight: 700, cursor: 'pointer', transition: 'all .2s'
                                    }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: selectedBooking ? '1fr 340px' : '1fr', gap: 20, alignItems: 'start' }}>
                        {/* Bookings Table/List */}
                        <div className="cafe-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                                {TABS.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        style={{
                                            padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                                            fontSize: '.82rem', fontWeight: 700,
                                            color: activeTab === tab.id ? 'var(--orange)' : 'var(--text-3)',
                                            borderBottom: activeTab === tab.id ? '2px solid var(--orange)' : '2px solid transparent',
                                            transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 6
                                        }}>
                                        {tab.label}
                                        <span style={{
                                            background: activeTab === tab.id ? 'var(--orange-soft)' : 'var(--bg)',
                                            color: activeTab === tab.id ? 'var(--orange)' : 'var(--text-3)',
                                            borderRadius: 6, padding: '1px 6px', fontSize: '.7rem'
                                        }}>{tab.count}</span>
                                    </button>
                                ))}
                            </div>

                            {loading ? (
                                <div className="cafe-loading" style={{ height: 300 }}><div className="cafe-spinner" /></div>
                            ) : filtered.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
                                    <h3 style={{ color: 'var(--text)', marginBottom: 4 }}>No bookings found</h3>
                                    <p style={{ color: 'var(--text-3)', fontSize: '.9rem' }}>Try adjusting your filters or search terms</p>
                                </div>
                            ) : (
                                <div>
                                    {filtered.map((b, i) => {
                                        const bt = BOOKING_TYPE_CFG[b.bookingType] || BOOKING_TYPE_CFG.TABLE;
                                        const sc = STATUS_CFG[b.status] || STATUS_CFG.PENDING;
                                        const isSelected = selectedBooking?.id === b.id;
                                        return (
                                            <div key={b.id}
                                                onClick={() => setSelectedBooking(isSelected ? null : b)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                                                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                                    cursor: 'pointer', background: isSelected ? 'var(--orange-soft)' : 'transparent',
                                                    transition: 'all .2s'
                                                }}>
                                                <div style={{ width: 44, height: 44, borderRadius: 12, background: bt.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--cafe-text-1)' }}>
                                                    {bt.icon}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                        <span style={{ fontWeight: 800, fontSize: '.9rem' }}>#{b.id}</span>
                                                        <span style={{ fontWeight: 700, fontSize: '.78rem', color: bt.color }}>{bt.label}</span>
                                                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 6, padding: '2px 8px', fontSize: '.68rem', fontWeight: 800 }}>
                                                            {sc.label}
                                                        </span>
                                                    </div>
                                                    <p style={{ margin: 0, fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 500 }}>
                                                        {b.bookingDate} at {String(b.bookingTime || '').substring(0, 5)} · {b.guestCount} Guests
                                                    </p>
                                                </div>
                                                {b.status === 'PENDING' && (
                                                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                                                        <button className="cafe-btn-sm" style={{ background: 'var(--green)', color: 'var(--cafe-text-1)', border: 'none' }} onClick={() => updateStatus(b.id, 'CONFIRMED')}>Confirm</button>
                                                        <button className="cafe-btn-sm" style={{ background: 'var(--red-soft)', color: 'var(--red)', border: 'none' }} onClick={() => updateStatus(b.id, 'CANCELLED')}>Cancel</button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Details Panel */}
                        {selectedBooking && (
                            <div className="cafe-chart-card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: 20 }}>
                                <div style={{ background: (BOOKING_TYPE_CFG[selectedBooking.bookingType] || BOOKING_TYPE_CFG.TABLE).grad, padding: '20px', color: 'var(--cafe-text-1)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: 0 }}>Booking #{selectedBooking.id}</h3>
                                            <p style={{ opacity: .8, fontSize: '.8rem', margin: '4px 0 0' }}>{selectedBooking.bookingType} Selection</p>
                                        </div>
                                        <button onClick={() => setSelectedBooking(null)} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: 'var(--cafe-text-1)', cursor: 'pointer', borderRadius: '50%', width: 24, height: 24 }}>✕</button>
                                    </div>
                                </div>
                                <div style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {[
                                            { l: 'Customer', v: selectedBooking.customerName || 'N/A' },
                                            { l: 'Date', v: selectedBooking.bookingDate },
                                            { l: 'Time', v: String(selectedBooking.bookingTime || '').substring(0, 5) },
                                            { l: 'Guests', v: selectedBooking.guestCount },
                                            { l: 'Phone', v: selectedBooking.phone || 'N/A' },
                                            { l: 'Requests', v: selectedBooking.specialRequests || 'None' }
                                        ].map((row, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
                                                <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>{row.l}</span>
                                                <span style={{ color: 'var(--text)', fontWeight: 700 }}>{row.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {selectedBooking.status === 'PENDING' && (
                                            <>
                                                <button className="cafe-btn-download" style={{ width: '100%' }} onClick={() => updateStatus(selectedBooking.id, 'CONFIRMED')}>Confirm Booking</button>
                                                <button className="cafe-btn-sm" style={{ width: '100%', padding: 10, background: 'var(--red-soft)', color: 'var(--red)' }} onClick={() => updateStatus(selectedBooking.id, 'CANCELLED')}>Cancel Booking</button>
                                            </>
                                        )}
                                        {selectedBooking.status !== 'PENDING' && (
                                            <button className="cafe-btn-sm" style={{ width: '100%', padding: 10 }} onClick={() => updateStatus(selectedBooking.id, 'PENDING')}>Set to Pending</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {toast && <div className="cafe-toast">{toast.msg}</div>}

            {/* Success Popup */}
            {showSuccessPop && createPortal(
                <div className="cafe-modal-overlay" onClick={() => setShowSuccessPop(null)}>
                    <div className="cafe-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="cafe-modal-icon green">
                            ✅
                        </div>
                        <h2 className="cafe-modal-title">Booking Confirmed!</h2>
                        <p className="cafe-modal-body">
                            Booking <strong>#{showSuccessPop.id}</strong> has been successfully confirmed. The customer will be notified!
                        </p>
                        <div className="cafe-modal-footer center">
                            <button onClick={() => setShowSuccessPop(null)} className="cafe-modal-btn primary">
                                Great, Back to Work
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default CafeBookings;
