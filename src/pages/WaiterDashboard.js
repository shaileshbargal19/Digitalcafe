import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import '../styles/AdminDashboardNew.css';
import API_BASE_URL from '../apiConfig';

const WaiterDashboard = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('floor'); // 'floor', 'history', 'profile'
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');
    const { toasts, addToast, removeToast } = useToast();

    useEffect(() => {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        localStorage.setItem('cafeTheme', theme);
    }, [theme]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored || stored.role !== 'WAITER') { navigate('/login'); return; }
        setUser(stored);
        const fetch_ = () => fetchOrders(stored);
        fetch_();
        const interval = setInterval(fetch_, 10000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchOrders = async (currentUser) => {
        try {
            const r = await fetch(`${API_BASE_URL}/orders/staff/${currentUser.id}`);
            if (r.ok) {
                const allOrders = await r.json();
                // Serving Floor: READY
                setOrders(allOrders.filter(o => o.status === 'READY'));
                // Delivery History: COMPLETED
                setCompletedOrders(allOrders.filter(o => o.status === 'COMPLETED').sort((a,b) => b.id - a.id));
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const markServed = async (orderId) => {
        try {
            const r = await fetch(`${API_BASE_URL}/orders/${orderId}/status?status=COMPLETED`, { method: 'PATCH' });
            if (r.ok) {
                addToast('Order Completed & Served! ✅', 'success');
                fetchOrders(user);
            } else {
                addToast('Update failed', 'error');
            }
        } catch {
            addToast('Request failed', 'error');
        }
    };

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    const renderFloor = () => (
        <>
            <div className="adn-page-header">
                <div>
                    <h1 className="adn-page-title">Serving Floor</h1>
                    <p className="adn-page-sub">{orders.length} orders ready to be served</p>
                </div>
                <button className="adn-btn-download" onClick={() => fetchOrders(user)}>🔄 Sync</button>
            </div>
            {orders.length === 0 ? (
                <div className="adn-table-card" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-3)', fontStyle: 'italic' }}>
                    <p style={{ fontSize: '3rem' }}>🏖️</p>
                    <p style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 600 }}>Floor is clear.</p>
                </div>
            ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                        {orders.map(order => (
                            <div key={order.id} className="adn-chart-card floor-card" style={{ 
                                padding: '24px', 
                                borderTop: '5px solid #3b82f6',
                                transition: 'all 0.3s ease',
                                position: 'relative'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div>
                                        <span className="adn-td-id" style={{ fontSize: '1.2rem', fontWeight: 800 }}>#{order.id?.toString().padStart(4, '0')}</span>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: order.serviceType === 'DINE_IN' ? '#eff6ff' : '#f0fdf4', color: order.serviceType === 'DINE_IN' ? '#1d4ed8' : '#15803d', border: '1px solid currentColor' }}>
                                                {order.serviceType === 'DINE_IN' ? 'DINE-IN' : 'TAKEAWAY'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="adn-badge green" style={{ padding: '6px 12px', fontSize: '0.7rem' }}>READY</span>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: 20 }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Customer Priority</p>
                                    <p style={{ fontWeight: 800, fontSize: '1.15rem', margin: 0 }}>{order.customer?.firstName} {order.customer?.lastName}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-2)', marginTop: 4 }}>{order.serviceType === 'DINE_IN' ? 'Table Section A-12' : 'Counter Pickup'}</p>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, padding: '0 4px' }}>
                                    {order.items?.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600 }}>
                                            <span style={{ color: 'var(--text-1)' }}>{item.menuItem?.name}</span>
                                            <span style={{ color: '#3b82f6' }}>×{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="adn-btn-download" style={{ 
                                    width: '100%', 
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
                                    justifyContent: 'center',
                                    height: '48px',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
                                }} onClick={() => markServed(order.id)}>
                                    🏁 Mark as Served
                                </button>
                            </div>
                        ))}
                    </div>
            )}
        </>
    );

    const renderHistory = () => (
        <>
            <div className="adn-page-header">
                <div>
                    <h1 className="adn-page-title">Delivery Log</h1>
                    <p className="adn-page-sub">Your recently completed deliveries</p>
                </div>
            </div>
            <div className="adn-table-card">
                <table className="adn-table">
                    <thead>
                        <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        {completedOrders.map(order => (
                            <tr key={order.id}>
                                <td className="adn-td-id">#{order.id}</td>
                                <td style={{fontWeight: 600}}>{order.customer?.firstName}</td>
                                <td style={{fontSize: '.85rem'}}>{order.items?.map(i => `${i.quantity}x ${i.menuItem?.name}`).join(', ')}</td>
                                <td className="adn-td-amount">₹{order.totalAmount}</td>
                            </tr>
                        ))}
                        {completedOrders.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding: '40px', fontStyle: 'italic', color: 'var(--text-3)'}}>No delivery history yet.</td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );

    const renderProfile = () => (
        <>
            <div className="adn-page-header">
                <h1 className="adn-page-title">My Profile</h1>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
                <div className="adn-table-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ height: 120, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: -40, left: 32, width: 100, height: 100, borderRadius: 24, background: 'white', padding: 4, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                            <div style={{ width: '100%', height: '100%', borderRadius: 20, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                        </div>
                    </div>
                    <div style={{ padding: '60px 32px 32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>{user.firstName} {user.lastName}</h2>
                                <p style={{ color: '#3b82f6', fontWeight: 700, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%' }} />
                                    Guest Relations • Service Team
                                </p>
                            </div>
                            <button className="adn-btn-sm" style={{ padding: '8px 20px', borderRadius: 12 }}>Edit Profile</button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 16, border: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Email ID</label>
                                    <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>{user.email}</p>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 16, border: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Phone Number</label>
                                    <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>{user.phone || '+91 ———— ————'}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 16, border: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Waiter ID</label>
                                    <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-1)' }}>WTR-{user.id.toString().padStart(6, '0')}</p>
                                </div>
                                <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 16, border: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: 8 }}>Shift Status</label>
                                    <p style={{ fontWeight: 700, margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <span style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }} />
                                        On-Floor Duty
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="adn-table-card" style={{ padding: '24px', textAlign: 'center' }}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 16px' }}>⚡</div>
                        <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', fontWeight: 800 }}>Star Waiter</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-3)', margin: 0 }}>Efficient Service</p>
                    </div>
                    <div className="adn-table-card" style={{ padding: '24px' }}>
                        <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 800 }}>Daily Stats</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-3)' }}>Served Today</span>
                                <span style={{ fontWeight: 700 }}>42</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-3)' }}>Avg. Rating</span>
                                <span style={{ fontWeight: 700 }}>4.8/5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="adn-root">
            <Toast toasts={toasts} removeToast={removeToast} />
            
            <aside className="adn-sidebar open">
                <div className="adn-sidebar-brand">
                    <div className="adn-logo-icon">🛎️</div>
                    <span className="adn-logo-text">Digital<span className="adn-logo-accent"> Café</span></span>
                </div>
                <nav className="adn-nav">
                    {[
                        { id: 'floor', label: 'Serving Floor', icon: '🏃', active: activeTab === 'floor' },
                        { id: 'history', label: 'Delivery Log', icon: '📜', active: activeTab === 'history' },
                        { id: 'profile', label: 'My Profile', icon: '👤', active: activeTab === 'profile' },
                    ].map((item) => (
                        <button key={item.id} className={`adn-nav-item ${item.active ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                            <span className="adn-nav-icon">{item.icon}</span>
                            <span className="adn-nav-label">{item.label}</span>
                            {item.active && <span className="adn-nav-pill" />}
                        </button>
                    ))}
                </nav>
                <div className="adn-sidebar-footer">
                   <button className="adn-nav-item" style={{ color: 'var(--red)', border: 'none', background: 'none', width: '100%', cursor: 'pointer' }} onClick={() => { localStorage.clear(); navigate('/login'); }}>
                      <span className="adn-nav-icon">🚪</span>
                      <span className="adn-nav-label">End Shift</span>
                   </button>
                </div>
            </aside>

            <div className="adn-main-wrap">
                <header className="adn-topnav">
                    <div className="adn-topnav-left">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '6px 14px', borderRadius: 10, fontSize: '.8rem', fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <span style={{ width: 8, height: 8, background: '#3b82f6', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            ON FLOOR DUTY
                        </div>
                    </div>
                    <div className="adn-topnav-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '6px 14px', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, color: 'var(--text)', transition: 'all 0.2s' }}>
                            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                        </button>
                        <p style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--text-2)' }}>Welcome, Waiter {user?.firstName}</p>
                    </div>
                </header>

                <main className="adn-content">
                    {activeTab === 'floor' && renderFloor()}
                    {activeTab === 'history' && renderHistory()}
                    {activeTab === 'profile' && renderProfile()}
                </main>
            </div>
        </div>
    );
};


export default WaiterDashboard;
