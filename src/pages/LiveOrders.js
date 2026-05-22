import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import '../styles/CafeOwnerDashboard.css';
import API_BASE_URL from '../apiConfig';

const LiveOrders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');
    useEffect(() => {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        localStorage.setItem('cafeTheme', theme);
    }, [theme]);

    const [filter, setFilter] = useState('ACTIVE');
    const [showSuccessPop, setShowSuccessPop] = useState(null);
    const { toasts, addToast, removeToast } = useToast();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        const fetch_ = () => fetchOrders(stored);
        fetch_();
        const interval = setInterval(fetch_, 10000);
        return () => clearInterval(interval);
    }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchOrders = async (currentUser) => {
        const u = currentUser || user;
        try {
            let url = `${API_BASE_URL}/orders/admin`;
            if (u?.role === 'CAFE_OWNER') url = `${API_BASE_URL}/cafe/${u.id}/orders`;
            const r = await fetch(url);
            if (r.ok) setOrders(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const r = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status=${newStatus}`, { method: 'PATCH' });
            if (r.ok) { 
                addToast(`Order marked as ${newStatus}`, 'success'); 
                if (newStatus === 'PREPARING') setShowSuccessPop({ id: orderId });
                fetchOrders(user); 
            }
            else addToast('Update failed', 'error');
        } catch { addToast('Request failed', 'error'); }
    };

    if (!user) return <div className="cafe-loading"><div className="cafe-spinner" /></div>;

    const activeOrders = orders.filter(o => o.status !== 'COMPLETED');
    const displayOrders = filter === 'ACTIVE' ? activeOrders : orders;

    const statusBadge = s => s === 'COMPLETED' ? 'cafe-badge green' : s === 'READY' ? 'cafe-badge green' : s === 'PREPARING' ? 'cafe-badge orange' : 'cafe-badge red';

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
                        { label: 'Live Orders', icon: '📦', path: '/cafe/orders', active: true },
                        { label: 'Order History', icon: '📜', path: '/cafe/history' },
                        { label: 'Menu Manager', icon: '🍽️', path: '/cafe/menu' },
                        { label: 'Bookings', icon: '📅', path: '/cafe/bookings' },
                        { label: 'Staff', icon: '👨‍🍳', path: '/cafe/staff' },
                        { label: 'My Profile', icon: '👤', path: '/profile' },
                    ] : [
                        { label: 'Dashboard', icon: '⊞', path: '/admin' },
                        { label: 'Users', icon: '👥', path: '/admin/users' },
                        { label: 'Live Orders', icon: '📦', path: '/admin/orders', active: true },
                        { label: 'Menu', icon: '🍽️', path: '/admin/menu' },
                        { label: 'Staff', icon: '👨‍🍳', path: '/admin/staff' },
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: 10, fontSize: '.8rem', fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, background: '#16a34a', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            Live Synced
                        </div>
                    </div>
                    <div className="cafe-topnav-right">
                        <div className="cafe-date-filter">
                            <button className={filter === 'ACTIVE' ? 'active' : ''} onClick={() => setFilter('ACTIVE')}>Active</button>
                            <button className={filter === 'ALL' ? 'active' : ''} onClick={() => setFilter('ALL')}>All</button>
                        </div>
                        <button className="cafe-btn-sm" onClick={() => navigate(user?.role === 'CAFE_OWNER' ? '/cafe/dashboard' : '/admin')}>← Dashboard</button>
                        <button className="cafe-btn-download" style={{ fontSize: '.75rem', padding: '7px 14px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
                            onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="cafe-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.65)), url('https://images.unsplash.com/photo-1543362906-acfc16c67564?q=80&w=2065&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #f97316 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Live Kitchen Board</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Monitor and manage incoming orders in real-time from the culinary floor.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                                📦 {activeOrders.length} active orders
                            </div>
                        </div>
                        <div style={{ zIndex: 1 }}>
                            <button className="cafe-btn-download" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', border: 'none', boxShadow: '0 0 20px rgba(249,115,22,0.3)', padding: '12px 24px', fontSize: '.9rem' }} onClick={() => fetchOrders()}>🔄 Sync Now</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cafe-loading" style={{ height: 300 }}><div className="cafe-spinner" /><p>Fetching orders…</p></div>
                    ) : displayOrders.length === 0 ? (
                        <div className="cafe-table-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                            <p style={{ fontSize: '2rem' }}>🎉</p>
                            <p style={{ marginTop: 8 }}>No active orders in the queue.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                            {displayOrders.map(order => (
                                <div key={order.id} className="cafe-chart-card" style={{ padding: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <span className="cafe-td-id">#{order.id?.toString().padStart(4, '0')}</span>
                                        <span className={statusBadge(order.status)}>{order.status}</span>
                                    </div>
                                    <p style={{ fontWeight: 700, marginBottom: 6 }}>
                                        {order.customer?.firstName || 'Guest'} {order.customer?.lastName || ''}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', gap: 6, fontSize: '.78rem', color: 'var(--text-2)' }}>
                                                <span style={{ fontWeight: 700 }}>{item.quantity}×</span>
                                                <span>{item.menuItem?.name}</span>
                                            </div>
                                        ))}
                                        {(!order.items || order.items.length === 0) && <p style={{ color: 'var(--text-3)', fontSize: '.78rem', fontStyle: 'italic' }}>No item details</p>}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 800, fontSize: '.95rem' }}>₹{order.totalAmount}</span>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            {order.status === 'PENDING' && (
                                                <button className="cafe-btn-download" style={{ padding: '5px 12px', fontSize: '.72rem' }}
                                                    onClick={() => updateStatus(order.id, 'PREPARING')}>Accept</button>
                                            )}
                                            {order.status === 'PREPARING' && (user?.role === 'ADMIN' || user?.role === 'CAFE_OWNER') && (
                                                <button className="cafe-btn-download" style={{ padding: '5px 12px', fontSize: '.72rem', background: 'linear-gradient(135deg,#10b981,#059669)' }}
                                                    onClick={() => updateStatus(order.id, 'READY')}>Mark Ready</button>
                                            )}
                                            {order.status === 'READY' && (user?.role === 'ADMIN' || user?.role === 'CAFE_OWNER') && (
                                                <button className="cafe-btn-download" style={{ padding: '5px 12px', fontSize: '.72rem', background: 'linear-gradient(135deg,#f97316,#ea580c)' }}
                                                    onClick={() => updateStatus(order.id, 'COMPLETED')}>Complete</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {/* Success Popup */}
            {showSuccessPop && createPortal(
                <div className="cafe-modal-overlay" onClick={() => setShowSuccessPop(null)}>
                    <div className="cafe-modal-card" onClick={e => e.stopPropagation()}>
                        <div className="cafe-modal-icon green">
                            👨‍🍳
                        </div>
                        <h2 className="cafe-modal-title">Order Accepted!</h2>
                        <p className="cafe-modal-body">
                            Order <strong>#{showSuccessPop.id}</strong> has been sent to the kitchen. Preparation is starting now!
                        </p>
                        <div className="cafe-modal-footer center">
                            <button onClick={() => setShowSuccessPop(null)} className="cafe-modal-btn primary">
                                Kitchen Mode Activated
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default LiveOrders;
