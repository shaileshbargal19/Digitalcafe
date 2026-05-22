import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import '../styles/CafeOwnerDashboard.css';
import API_BASE_URL from '../apiConfig';

const OrderHistory = () => {
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

    const { toasts, removeToast } = useToast();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored || stored.role !== 'CAFE_OWNER') { navigate('/login'); return; }
        setUser(stored);
        fetchOrders(stored);
    }, [navigate]);

    const fetchOrders = async (currentUser) => {
        setLoading(true);
        try {
            const r = await fetch(`${API_BASE_URL}/cafe/${currentUser.id}/orders`);
            if (r.ok) {
                const allOrders = await r.json();
                // ONLY show COMPLETED orders
                const completedOrders = allOrders.filter(o => o.status === 'COMPLETED');
                // Sort by ID descending (newest first)
                completedOrders.sort((a, b) => b.id - a.id);
                setOrders(completedOrders);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="cafe-loading"><div className="cafe-spinner" /></div>;

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
                    {[
                        { label: 'Dashboard', icon: '⊞', path: '/cafe/dashboard' },
                        { label: 'Live Orders', icon: '📦', path: '/cafe/orders' },
                        { label: 'Order History', icon: '📜', path: '/cafe/history', active: true },
                        { label: 'Menu Manager', icon: '🍽️', path: '/cafe/menu' },
                        { label: 'Bookings', icon: '📅', path: '/cafe/bookings' },
                        { label: 'Staff', icon: '👨‍🍳', path: '/cafe/staff' },
                        { label: 'My Profile', icon: '👤', path: '/profile' },
                    ].map((item, i) => (
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
                        <div className="cafe-avatar-sm" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div>
                            <p className="cafe-um-name">{user.firstName} {user.lastName}</p>
                            <p className="cafe-um-role">Cafe Owner</p>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="cafe-main-wrap">
                <header className="cafe-topnav">
                    <div className="cafe-topnav-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f3f4f6', color: '#4b5563', padding: '6px 14px', borderRadius: 10, fontSize: '.8rem', fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, background: '#9ca3af', borderRadius: '50%' }} />
                            Past Records
                        </div>
                    </div>
                    <div className="cafe-topnav-right">
                        <button className="cafe-btn-sm" onClick={() => navigate('/cafe/dashboard')}>← Dashboard</button>
                        <button className="cafe-btn-download" style={{ fontSize: '.75rem', padding: '7px 14px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
                            onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="cafe-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2074&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #10b981 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Order History</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Review past transactions and completed deliveries.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                📜 {orders.length} completed records
                            </div>
                        </div>
                        <div style={{ zIndex: 1 }}>
                            <button className="cafe-btn-download" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', boxShadow: '0 0 20px rgba(16,185,129,0.3)', padding: '12px 24px', fontSize: '.9rem' }} onClick={() => fetchOrders(user)}>🔄 Refresh History</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cafe-loading" style={{ height: 300 }}><div className="cafe-spinner" /><p>Fetching history…</p></div>
                    ) : orders.length === 0 ? (
                        <div className="cafe-table-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                            <p style={{ fontSize: '2rem' }}>📜</p>
                            <p style={{ marginTop: 8 }}>No completed orders found.</p>
                        </div>
                    ) : (
                        <div className="cafe-table-card" style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                            <table className="cafe-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date/Time</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="cafe-td-id">#{order.id.toString().padStart(4, '0')}</td>
                                            <td style={{ color: 'var(--text-2)', fontSize: '.85rem' }}>
                                                {/* Fallback to simple generic string if date not available */}
                                                Delivered Log
                                            </td>
                                            <td>{order.customer?.firstName || 'Guest'} {order.customer?.lastName || ''}</td>
                                            <td style={{ color: 'var(--text-2)', fontSize: '.78rem' }}>
                                                {order.items?.map(item => `${item.quantity}× ${item.menuItem?.name}`).join(', ') || '—'}
                                            </td>
                                            <td className="cafe-td-amount">₹{order.totalAmount}</td>
                                            <td><span className="cafe-badge green">{order.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default OrderHistory;
