import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CafeOwnerDashboard.css';
import API_BASE_URL from '../apiConfig';

/* ─── Sparkline ─────────────────── */
const Sparkline = ({ data, color = '#f97316' }) => {
    const w = 80, h = 36;
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const id = `sg-${color.replace('#', '')}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity=".22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${id})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/* ─── Bar Chart ─────────────────── */
const BarChart = ({ data, color = '#f97316' }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="cafe-barchart">
            {data.map((d, i) => (
                <div className="cafe-bar-col" key={i}>
                    <div className="cafe-bar-track">
                        <div className="cafe-bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}bb)` }}>
                            <span className="cafe-bar-tip">₹{Math.round(d.value)}</span>
                        </div>
                    </div>
                    <span className="cafe-bar-label">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

/* ─── Line Chart ─────────────────── */
const LineChart = ({ data, color = '#3b82f6' }) => {
    const w = 280, h = 100;
    const vals = data.map(d => d.value);
    const max = Math.max(...vals, 1), min = Math.min(...vals);
    const y = v => h - ((v - min) / (max - min || 1)) * (h - 12) - 6;
    const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${y(d.value)}`).join(' ');
    const gid = `lg-${color.replace('#', '')}`;
    return (
        <div style={{ width: '100%' }}>
            <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity=".2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${gid})`} />
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * w;
                    return <circle key={i} cx={x} cy={y(d.value)} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />;
                })}
            </svg>
            <div className="cafe-line-labels">
                {data.map((d, i) => <span key={i}>{d.label}</span>)}
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const CafeOwnerDashboard = () => {
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
    const [stats, setStats] = useState({
        todayOrders: 0, todayRevenue: 0, activeOrders: 0, menuCount: 0, staffCount: 0,
        weeklyRevenue: [], weeklyOrders: []
    });
    const [liveOrders, setLiveOrders] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const overlayRef = useRef(null);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        if (stored.role !== 'CAFE_OWNER') { navigate('/login'); return; }
        setUser(stored);
        fetchData(stored.id);
        const interval = setInterval(() => fetchData(stored.id), 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    const fetchData = async (ownerId) => {
        try {
            const [statsRes, ordersRes, staffRes] = await Promise.all([
                fetch(`${API_BASE_URL}/cafe/${ownerId}/stats`),
                fetch(`${API_BASE_URL}/cafe/${ownerId}/orders`),
                fetch(`${API_BASE_URL}/cafe/${ownerId}/staff`),
            ]);
            if (statsRes.ok) setStats(await statsRes.json());
            if (ordersRes.ok) setLiveOrders(await ordersRes.json());
            if (staffRes.ok) setStaff(await staffRes.json());
        } catch (e) { console.error('Dashboard fetch error', e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        const h = e => { if (!overlayRef.current?.contains(e.target)) setProfileOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    if (!user) return <div className="cafe-loading"><div className="cafe-spinner" /><p>Loading…</p></div>;

    /* ── Nav ── */
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '⊞', path: '/cafe/dashboard' },
        { id: 'orders', label: 'Live Orders', icon: '📦', path: '/cafe/orders' },
        { id: 'history', label: 'Order History', icon: '📜', path: '/cafe/history' },
        { id: 'menu', label: 'Menu Manager', icon: '🍽️', path: '/cafe/menu' },
        { id: 'bookings', label: 'Bookings', icon: '📅', path: '/cafe/bookings' },
        { id: 'staff', label: 'Staff', icon: '👨‍🍳', path: '/cafe/staff' },
        { id: 'profile', label: 'My Profile', icon: '👤', path: '/profile' },
    ];

    const badge = s => s === 'COMPLETED' || s === 'READY' ? 'cafe-badge green' : s === 'PREPARING' ? 'cafe-badge orange' : 'cafe-badge red';
    const weeklyRevenue = (stats.weeklyRevenue && stats.weeklyRevenue.length > 0) ? stats.weeklyRevenue : [{ label: 'Mon', value: 0 }, { label: 'Tue', value: 0 }, { label: 'Wed', value: 0 }, { label: 'Thu', value: 0 }, { label: 'Fri', value: 0 }, { label: 'Sat', value: 0 }, { label: 'Sun', value: 0 }];
    const weeklyOrders = (stats.weeklyOrders && stats.weeklyOrders.length > 0) ? stats.weeklyOrders : [{ label: 'Mon', value: 0 }, { label: 'Tue', value: 0 }, { label: 'Wed', value: 0 }, { label: 'Thu', value: 0 }, { label: 'Fri', value: 0 }, { label: 'Sat', value: 0 }, { label: 'Sun', value: 0 }];

    const cards = [
        { label: "Today's Orders", value: stats.todayOrders, icon: '📦', trend: `${stats.activeOrders} active`, up: stats.todayOrders > 0, color: '#3b82f6', spark: weeklyOrders.map(d => d.value) },
        { label: "Today's Revenue", value: `₹${Math.round(stats.todayRevenue).toLocaleString('en-IN')}`, icon: '💰', trend: 'live', up: stats.todayRevenue > 0, color: '#10b981', spark: weeklyRevenue.map(d => d.value) },
        { label: 'Menu Items', value: stats.menuCount, icon: '🍽️', trend: 'total', up: true, color: '#f59e0b', spark: [1, 1, 1, 1, 1, 1, stats.menuCount].map(v => v || 0) },
        { label: 'Team Members', value: stats.staffCount, icon: '👨‍🍳', trend: 'staff', up: true, color: '#8b5cf6', spark: [1, 1, 1, 1, 1, 1, stats.staffCount].map(v => v || 0) },
    ];

    const displayOrders = liveOrders.slice(0, 5);
    const activeOrders = liveOrders.filter(o => o.status !== 'COMPLETED');

    return (
        <div className="cafe-root">
            {/* ── Sidebar ── */}
            <aside className={`cafe-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
                <div className="cafe-sidebar-brand">
                    <div className="cafe-logo-icon" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>☕</div>
                    {sidebarOpen && <span className="cafe-logo-text">My<span className="cafe-logo-accent"> Café</span></span>}
                </div>
                <nav className="cafe-nav">
                    {navItems.map(item => (
                        <button key={item.id}
                            className={`cafe-nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}>
                            <span className="cafe-nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="cafe-nav-label">{item.label}</span>}
                            {window.location.pathname === item.path && <span className="cafe-nav-pill" />}
                        </button>
                    ))}
                </nav>
                <div className="cafe-sidebar-footer">
                    <button className="cafe-btn-secondary" style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: '.9rem' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
                    
                    {sidebarOpen && (
                        <div className="cafe-user-mini">
                            <div className="cafe-avatar-sm" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </div>
                            <div>
                                <p className="cafe-um-name">{user.firstName} {user.lastName}</p>
                                <p className="cafe-um-role">Cafe Owner</p>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <div className="cafe-main-wrap">
                {/* ── Top Nav ── */}
                <header className="cafe-topnav" ref={overlayRef}>
                    <div className="cafe-topnav-left">
                        <button className="cafe-toggle-btn" onClick={() => setSidebarOpen(p => !p)}>
                            <span /><span /><span />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: 10, fontSize: '.8rem', fontWeight: 700 }}>
                            <span style={{ width: 8, height: 8, background: '#16a34a', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            Live Synced
                        </div>
                    </div>
                    <div className="cafe-topnav-right">
                        <div style={{ position: 'relative' }} ref={overlayRef}>
                            <button className="cafe-profile-btn" onClick={() => setProfileOpen(p => !p)}>
                                <div className="cafe-avatar" style={{ background: 'linear-gradient(135deg,#f97316,#ef4444)' }}>
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                </div>
                                <div className="cafe-profile-info">
                                    <span className="cafe-profile-name">{user.firstName} {user.lastName}</span>
                                    <span className="cafe-profile-role">Cafe Owner</span>
                                </div>
                                <span style={{ fontSize: '9px', opacity: .4, marginLeft: 4 }}>▼</span>
                            </button>
                            {profileOpen && (
                                <div className="cafe-dropdown">
                                    <div className="cafe-dp-header">{user.email}</div>
                                    <button className="cafe-dp-item" onClick={() => navigate('/profile')}>👤  My Profile</button>
                                    <button className="cafe-dp-item" onClick={() => navigate('/cafe/orders')}>📦  Live Orders</button>
                                    <button className="cafe-dp-item" onClick={() => navigate('/cafe/staff')}>👨‍🍳  Manage Staff</button>
                                    <div className="cafe-dp-divider" />
                                    <button className="cafe-dp-item danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪  Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Content ── */}
                <main className="cafe-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.5)), url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=2071&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '48px 56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--cafe-border)', boxShadow: '0 12px 40px rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #f97316 0%, transparent 50%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div className="cafe-hero-text">
                            <h1>Welcome to the Kitchen, {user.firstName}!</h1>
                            <p>Here’s what’s cooking today. Manage your menu, track live orders, and review your daily performance all from your restaurant command center.</p>
                        </div>
                        <div className="cafe-hero-actions">
                            <button className="cafe-btn-secondary" onClick={() => navigate('/cafe/menu')}>🍽️ Manage Menu</button>
                            <button className="cafe-btn-primary" onClick={() => navigate('/cafe/orders')}>📦 Live Orders</button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="cafe-loading" style={{ height: 200 }}><div className="cafe-spinner" /><p>Fetching live data…</p></div>
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <section className="cafe-cards-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                                {cards.map((c, i) => (
                                    <div className="cafe-summary-card" key={i} style={{ '--card-accent': c.color }}>
                                        <div className="cafe-card-top">
                                            <div className="cafe-card-icon" style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
                                            <span className={`cafe-card-trend ${c.up ? 'up' : 'down'}`}>{c.trend}</span>
                                        </div>
                                        <div className="cafe-card-value">{c.value}</div>
                                        <div className="cafe-card-label">{c.label}</div>
                                        <div className="cafe-card-spark"><Sparkline data={c.spark.length > 1 ? c.spark : [0, 0, 0, 0, 0, 0, 0]} color={c.color} /></div>
                                    </div>
                                ))}
                            </section>

                            {/* Dashboard Grid */}
                            <div className="cafe-dashboard-grid">
                                {/* Live Orders Panel */}
                                <div className="cafe-panel">
                                    <div className="cafe-panel-header">
                                        <h3 className="cafe-panel-title">Live Orders</h3>
                                        <button className="cafe-panel-action" onClick={() => navigate('/cafe/orders')}>View Kitchen Board →</button>
                                    </div>
                                    <div className="cafe-list">
                                        {displayOrders.length === 0 ? (
                                            <div className="cafe-empty-state">
                                                <span>🍽️</span>
                                                <p>No active orders in the kitchen.</p>
                                            </div>
                                        ) : displayOrders.map((o, i) => (
                                            <div className="cafe-list-item" key={i}>
                                                <div className="cafe-item-info">
                                                    <div className="cafe-item-icon">📦</div>
                                                    <div>
                                                        <div className="cafe-item-title">#{o.id?.toString().padStart(4, '0')} · {o.customer?.firstName || 'Guest'}</div>
                                                        <div className="cafe-item-sub">{o.items?.map(it => it.menuItem?.name).filter(Boolean).join(', ') || 'Custom Order'}</div>
                                                    </div>
                                                </div>
                                                <div className="cafe-item-right">
                                                    <div className="cafe-item-value">₹{o.totalAmount}</div>
                                                    <span className={badge(o.status)}>{o.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Analytics Panel */}
                                <div className="cafe-panel">
                                    <div className="cafe-panel-header" style={{ marginBottom: 12 }}>
                                        <h3 className="cafe-panel-title">Weekly Revenue</h3>
                                    </div>
                                    <BarChart data={weeklyRevenue} color="#f97316" />
                                    
                                    <div className="cafe-panel-header" style={{ marginTop: 40, marginBottom: 12 }}>
                                        <h3 className="cafe-panel-title">Orders Trend</h3>
                                    </div>
                                    <LineChart data={weeklyOrders} color="#ef4444" />
                                </div>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default CafeOwnerDashboard;
