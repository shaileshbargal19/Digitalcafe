import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardNew.css';
import CustomerLayout from '../components/CustomerLayout';

const STATUS_CFG = {
    PENDING: { bg: '#fef3c7', color: '#b45309', dot: '#d97706', label: 'Pending' },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6', label: 'In Progress' },
    COMPLETED: { bg: '#dcfce7', color: '#15803d', dot: '#16a34a', label: 'Completed' },
    CANCELLED: { bg: '#fee2e2', color: '#b91c1c', dot: '#dc2626', label: 'Cancelled' },
};

const SERVICE_ICON = { DINE_IN: '🍽️', TAKEAWAY: '🥡', DELIVERY: '🛵' };

const FOOD_IMAGES = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1490818387583-1b0ba689a074?auto=format&fit=crop&w=150&q=80'
];

const CustomerOrders = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    const fetchOrders = useCallback(async (uid) => {
        setLoading(true);
        try {
            const r = await fetch(`/api/orders/customer/${uid}`);
            if (r.ok) setOrders(await r.json());
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        fetchOrders(stored.id);
    }, [navigate, fetchOrders]);

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    /* ── derive status label for filtering ── */
    const statusOf = (o) => {
        const s = (o.status || '').toUpperCase();
        if (s === 'PENDING' || s === 'IN_PROGRESS') return 'active';
        if (s === 'COMPLETED') return 'completed';
        if (s === 'CANCELLED') return 'cancelled';
        return 'active';
    };

    const filtered = orders
        .filter(o => activeTab === 'all' || statusOf(o) === activeTab)
        .filter(o => !search
            || String(o.id).includes(search)
            || (o.serviceType || '').toLowerCase().includes(search.toLowerCase())
            || (o.items || []).some(i => (i.menuItem?.name || '').toLowerCase().includes(search.toLowerCase()))
        );

    const buildItemsLabel = (items) => {
        if (!items || items.length === 0) return 'No items';
        return items.map(i => `${i.menuItem?.name || 'Item'} × ${i.quantity}`).join(', ');
    };

    const formatDate = (dt) => {
        if (!dt) return '';
        try {
            const d = new Date(dt);
            return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } catch { return dt; }
    };

    const TABS = [
        { id: 'all', label: 'All Orders', count: orders.length },
        { id: 'active', label: '🔄 Active', count: orders.filter(o => statusOf(o) === 'active').length },
        { id: 'completed', label: '✅ Completed', count: orders.filter(o => statusOf(o) === 'completed').length },
        { id: 'cancelled', label: '❌ Cancelled', count: orders.filter(o => statusOf(o) === 'cancelled').length },
    ];

    return (
        <CustomerLayout>
            {/* Hero */}
            <div style={{ 
                backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                borderRadius: 20, padding: '32px 28px', marginBottom: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ margin: '0 0 8px', color: 'white', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.5px' }}>📦 My Orders</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,.8)', fontSize: '.9rem', fontWeight: 500 }}>{orders.length} total orders · Real-time from your cafés</p>
                </div>
                <button onClick={() => navigate('/customer/explore')}
                    style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: 'white', color: '#0f172a', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', position: 'relative', zIndex: 1, boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
                    + New Order
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 20 }}>
                {[
                    { label: 'Total Orders', val: orders.length, icon: '📦', color: '#3b82f6' },
                    { label: 'Active', val: orders.filter(o => statusOf(o) === 'active').length, icon: '🔄', color: '#f59e0b' },
                    { label: 'Completed', val: orders.filter(o => statusOf(o) === 'completed').length, icon: '✅', color: '#10b981' },
                    { label: 'Total Spent', val: `₹${orders.reduce((s, o) => s + (o.totalAmount || 0), 0).toFixed(0)}`, icon: '💰', color: '#8b5cf6' },
                ].map((s, i) => (
                    <div key={i} className="adn-chart-card" style={{ padding: '15px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: `1px solid ${s.color}30` }}>{s.icon}</div>
                        <div><p style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem' }}>{s.val}</p><p style={{ margin: 0, fontSize: '.73rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</p></div>
                    </div>
                ))}
            </div>

            {/* Tabs + List */}
            <div className="adn-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Status tabs */}
                <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)', overflowX: 'auto' }}>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            style={{ padding: '13px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, color: activeTab === tab.id ? '#3b82f6' : 'var(--text-3)', borderBottom: activeTab === tab.id ? '2.5px solid #3b82f6' : '2.5px solid transparent', marginBottom: -1.5, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}>
                            {tab.label}
                            <span style={{ background: activeTab === tab.id ? '#3b82f620' : 'var(--bg)', color: activeTab === tab.id ? '#3b82f6' : 'var(--text-3)', borderRadius: 99, padding: '1px 7px', fontSize: '.7rem', fontWeight: 800 }}>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div style={{ padding: '12px 18px', borderBottom: '1.5px solid var(--border)', background: 'var(--bg)' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: 12, color: 'var(--text-3)' }}>🔍</span>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search orders by ID, service type, or items…"
                            style={{ width: '100%', padding: '10px 14px 10px 38px', borderRadius: 12, border: '1.5px solid var(--border)', fontSize: '.84rem', outline: 'none', transition: 'border-color .2s', background: 'var(--surface)', color: 'var(--text)' }}
                        />
                        {search && (
                            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: '1rem' }}>✕</button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <div className="adn-spinner" />
                        <p style={{ marginTop: 14, color: 'var(--text-3)', fontWeight: 600 }}>Loading your orders…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 70 }}>
                        <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80" alt="No orders" style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 20, boxShadow: '0 8px 24px rgba(0,0,0,.15)', opacity: 0.8 }} />
                        <h3 style={{ margin: '0 0 8px' }}>{orders.length === 0 ? 'No orders yet' : 'Nothing here'}</h3>
                        <p style={{ color: 'var(--text-3)', margin: '0 0 16px' }}>{orders.length === 0 ? 'Place your first order from any café!' : 'Try a different filter'}</p>
                        {orders.length === 0 && (
                            <button onClick={() => navigate('/customer/explore')} className="adn-btn-download">Browse Cafés</button>
                        )}
                    </div>
                ) : (
                    <div style={{ maxHeight: 'calc(100vh - 425px)', overflowY: 'auto' }}>
                        {filtered.map((o, i) => {
                            const sc = STATUS_CFG[(o.status || '').toUpperCase()] || STATUS_CFG.PENDING;
                            const isExpanded = expandedId === o.id;
                            const itemsLabel = buildItemsLabel(o.items);
                            const svcIcon = SERVICE_ICON[o.serviceType] || '📦';
                            return (
                                <div key={o.id}>
                                    {/* Main row */}
                                    <div onClick={() => setExpandedId(isExpanded ? null : o.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: !isExpanded && i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', background: isExpanded ? 'var(--bg)' : 'var(--surface)', transition: 'background .15s' }}
                                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--bg)'; }}
                                        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'var(--surface)'; }}>
                                        {/* Icon */}
                                        <img src={FOOD_IMAGES[o.id % FOOD_IMAGES.length]} alt="Order" style={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                                <span style={{ fontWeight: 800, fontSize: '.88rem' }}>Order #{o.id}</span>
                                                <span style={{ background: sc.bg, color: sc.color, borderRadius: 99, padding: '2px 9px', fontSize: '.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block', animation: sc.dot === '#d97706' ? 'pulse 1.5s ease-in-out infinite' : 'none' }} />
                                                    {sc.label}
                                                </span>
                                                <span style={{ background: 'var(--bg)', borderRadius: 8, padding: '2px 8px', fontSize: '.7rem', fontWeight: 600, color: 'var(--text-3)' }}>
                                                    {o.serviceType === 'DINE_IN' ? '🍽️ Dine In' : o.serviceType === 'TAKEAWAY' ? '🥡 Takeaway' : o.serviceType || ''}
                                                </span>
                                            </div>
                                            <p style={{ margin: '0 0 2px', color: 'var(--text-2)', fontSize: '.8rem', fontWeight: 500 }}>
                                                {itemsLabel.length > 60 ? itemsLabel.substring(0, 60) + '…' : itemsLabel}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '.73rem', color: 'var(--text-3)' }}>{formatDate(o.createdAt)}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '.95rem', color: '#f97316' }}>₹{(o.totalAmount || 0).toFixed(0)}</p>
                                            <span style={{ fontSize: '.78rem', color: 'var(--text-3)', fontWeight: 600 }}>{isExpanded ? '▲ Hide' : '▼ Details'}</span>
                                        </div>
                                    </div>

                                    {/* Expanded detail panel */}
                                    {isExpanded && (
                                        <div style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', padding: '16px 20px' }}>
                                            <p style={{ margin: '0 0 10px', fontWeight: 700, fontSize: '.8rem', color: 'var(--text-3)' }}>ORDER ITEMS</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                                                {(o.items || []).map((item, j) => (
                                                    <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <img src={FOOD_IMAGES[(o.id + j) % FOOD_IMAGES.length]} alt="Item" style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)' }} />
                                                            <div>
                                                                <p style={{ margin: 0, fontWeight: 700, fontSize: '.84rem' }}>{item.menuItem?.name || 'Item'}</p>
                                                                <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-3)' }}>₹{item.price} × {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <span style={{ fontWeight: 800, color: '#f97316', fontSize: '.86rem' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#3b82f608', borderRadius: 10, marginBottom: 14 }}>
                                                <span style={{ fontWeight: 700, fontSize: '.84rem' }}>Total Amount</span>
                                                <span style={{ fontWeight: 800, fontSize: '.9rem', color: '#f97316' }}>₹{(o.totalAmount || 0).toFixed(0)}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => navigate('/customer/explore')}
                                                    style={{ flex: 1, padding: '9px', border: 'none', borderRadius: 10, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}>
                                                    🔄 Reorder
                                                </button>
                                                <button onClick={() => navigate('/customer/explore')}
                                                    style={{ flex: 1, padding: '9px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'var(--surface)', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', color: 'var(--text)' }}>
                                                    ⭐ Rate Order
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default CustomerOrders;
