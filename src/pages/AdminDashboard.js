import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Sparkline, BarChart, DonutChart, LineChart } from '../components/Charts';
import '../styles/AdminDashboardNew.css';
import API_BASE_URL from '../apiConfig';

/* ═══════════════════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [dateRange, setDateRange] = useState('7d');
    const [searchQuery, setSearchQuery] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0, totalCafes: 0, totalOrders: 0, totalRevenue: 0, totalComplaints: 0,
        recentOrders: [], recentUsers: []
    });
    const [currentTime, setCurrentTime] = useState(new Date());
    const overlayRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = () => {
        const hrs = currentTime.getHours();
        if (hrs < 12) return 'Good morning ☀️';
        if (hrs < 17) return 'Good afternoon 🌤️';
        return 'Good evening 🌙';
    };

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        if (stored.role !== 'ADMIN') {
            // Redirect non-admins to their correct dashboard
            if (stored.role === 'CAFE_OWNER') navigate('/cafe/dashboard');
            else if (stored.role === 'CUSTOMER') navigate('/customer/dashboard');
            else if (stored.role === 'CHEF' || stored.role === 'WAITER') navigate('/staff');
            else navigate('/login');
            return;
        }
        setUser(stored);
        fetchStats();
    }, [navigate]);

    const fetchStats = async () => {
        try {
            const r = await fetch(`${API_BASE_URL}/admin/stats`);
            if (r.ok) setStats(await r.json());
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        const h = e => { if (!overlayRef.current?.contains(e.target)) { setProfileOpen(false); setNotifOpen(false); } };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    if (!user) return (
        <div className="adn-loading">
            <div className="adn-spinner" />
            <p>Loading Dashboard…</p>
        </div>
    );

    /* ── Summary Cards Data ── */
    const cards = [
        { label: 'Total Users', value: stats.totalUsers, icon: '👥', trend: '+12%', up: true, color: '#f97316', spark: [20, 35, 28, 45, 38, 55, 42, 60, 52, 70] },
        { label: 'Registered Cafes', value: stats.totalCafes, icon: '☕', trend: '+2', up: true, color: '#f97316', spark: [6, 7, 7, 8, 9, 10, 10, 11, 12, 12] },
        { label: 'Total Orders', value: stats.totalOrders, icon: '📦', trend: '+23%', up: true, color: '#8b5cf6', spark: [80, 120, 95, 140, 110, 160, 130, 180, 210, 284] },
        { label: 'Revenue', value: `₹${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: '💰', trend: '+15%', up: true, color: '#f59e0b', spark: [40, 60, 55, 80, 70, 90, 85, 100, 110, 124] },
        { label: 'Complaints', value: stats.totalComplaints, icon: '⚠️', trend: 'Active', up: false, color: '#ef4444', spark: [15, 12, 10, 14, 11, 9, 10, 8, 9, 7] },
        { label: 'Active Today', value: 47, icon: '🟢', trend: 'Live', up: true, color: '#10b981', spark: [15, 20, 18, 30, 25, 35, 40, 38, 45, 47] },
    ];

    const barData = [
        { label: 'Alpha', value: 84 }, { label: 'Beta', value: 62 },
        { label: 'Gamma', value: 105 }, { label: 'Delta', value: 47 },
        { label: 'Zeta', value: 91 }, { label: 'Eta', value: 73 },
    ];

    const donutSegs = [
        { label: 'Alpha', pct: 32, color: '#3b82f6' },
        { label: 'Beta', pct: 24, color: '#f97316' },
        { label: 'Gamma', pct: 20, color: '#10b981' },
        { label: 'Others', pct: 24, color: '#e2e8f0' },
    ];

    const weeklyData = [
        { label: 'Mon', value: 45 }, { label: 'Tue', value: 72 }, { label: 'Wed', value: 58 },
        { label: 'Thu', value: 90 }, { label: 'Fri', value: 112 }, { label: 'Sat', value: 138 }, { label: 'Sun', value: 95 },
    ];

    const peakData = [
        { label: '8AM', value: 30 }, { label: '10AM', value: 48 }, { label: '12PM', value: 118 },
        { label: '1PM', value: 140 }, { label: '3PM', value: 70 }, { label: '5PM', value: 110 }, { label: '7PM', value: 60 },
    ];

    const recentOrders = stats.recentOrders;

    const recentUsers = stats.recentUsers;

    const cafePerf = [
        { name: 'Cafe Alpha', orders: 284, revenue: '₹42,500', rating: 4.8, up: true },
        { name: 'Cafe Beta', orders: 219, revenue: '₹32,100', rating: 4.5, up: true },
        { name: 'Cafe Gamma', orders: 176, revenue: '₹28,900', rating: 4.2, up: false },
        { name: 'Cafe Delta', orders: 134, revenue: '₹21,200', rating: 4.6, up: true },
    ];

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'cafes', label: 'Cafes', icon: '☕' },
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
        { id: 'complaints', label: 'Complaints', icon: '⚠️' },
        { id: 'reports', label: 'Reports', icon: '📄' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    const notifs = [
        { text: 'New cafe registration — Cafe Horizon', time: '3m ago', dot: '#f97316' },
        { text: 'Order #1045 completed successfully', time: '8m ago', dot: '#10b981' },
        { text: 'Complaint #C-12 requires review', time: '25m ago', dot: '#ef4444' },
        { text: 'Weekly report ready to download', time: '1h ago', dot: '#3b82f6' },
    ];

    const avatarGrads = ['linear-gradient(135deg,#3b82f6,#8b5cf6)', 'linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#10b981,#3b82f6)', 'linear-gradient(135deg,#f59e0b,#f97316)'];
    const badge = s => s === 'Completed' || s === 'Approved' ? 'adn-badge green' : s === 'Processing' || s === 'Pending' ? 'adn-badge orange' : 'adn-badge red';

    return (
        <div className="adn-root">
            <AdminSidebar user={user} collapsed={!sidebarOpen} />

            <div className="adn-main-wrap">
                {/* ── Top Nav ── */}
                <header className="adn-topnav" ref={overlayRef}>
                    <div className="adn-topnav-left">
                        <button className="adn-toggle-btn" onClick={() => setSidebarOpen(p => !p)}>
                            <span /><span /><span />
                        </button>
                        <div className="adn-search-box">
                            <span>🔍</span>
                            <input placeholder="Search users, cafes, orders…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <div className="adn-live-time">
                            🕒 {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                    </div>

                    <div className="adn-topnav-right">
                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <button className="adn-icon-btn" onClick={() => { setNotifOpen(p => !p); setProfileOpen(false); }}>
                                🔔<span className="adn-notif-dot">4</span>
                            </button>
                            {notifOpen && (
                                <div className="adn-dropdown adn-notif-panel">
                                    <div className="adn-dp-header">Notifications <span className="adn-badge orange">4 new</span></div>
                                    {notifs.map((n, i) => (
                                        <div key={i} className="adn-notif-item">
                                            <span className="adn-notif-dot-c" style={{ background: n.dot }} />
                                            <div><p>{n.text}</p><small>{n.time}</small></div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div style={{ position: 'relative' }}>
                            <button className="adn-profile-btn" onClick={() => { setProfileOpen(p => !p); setNotifOpen(false); }}>
                                <div className="adn-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                                <div className="adn-profile-info">
                                    <span className="adn-profile-name">{user.firstName} {user.lastName}</span>
                                    <span className="adn-profile-role">Administrator</span>
                                </div>
                                <span style={{ fontSize: '9px', opacity: .4, marginLeft: 4 }}>▼</span>
                            </button>
                            {profileOpen && (
                                <div className="adn-dropdown">
                                    <div className="adn-dp-header">{user.email}</div>
                                    <button className="adn-dp-item" onClick={() => navigate('/profile')}>👤  My Profile</button>
                                    <button className="adn-dp-item" onClick={() => navigate('/profile')}>⚙️  Settings</button>
                                    <div className="adn-dp-divider" />
                                    <button className="adn-dp-item danger" onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪  Sign Out</button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <main className="adn-content">
                    {/* Page Hero Banner */}
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.6)), url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #f97316 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.8rem', fontWeight: 700, margin: '0 0 12px 0', color: '#fff' }}>Digital Café Operations</h1>
                            <p style={{ fontSize: '1.15rem', color: '#cbd5e1', margin: 0, maxWidth: 500, lineHeight: 1.5 }}>{getGreeting()}, {user.firstName}. Monitor platform health, manage registered cafes, and review system analytics from the global command center.</p>
                        </div>
                        <div style={{ display: 'flex', gap: 16, zIndex: 1 }}>
                            <button style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 30, cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(8px)' }} onClick={() => navigate('/admin/cafes')}>🏢 Manage Cafes</button>
                            <button style={{ padding: '14px 28px', background: 'linear-gradient(135deg, #f97316, #ea580c)', color: 'white', border: 'none', borderRadius: 30, cursor: 'pointer', fontWeight: 600, boxShadow: '0 0 20px rgba(249,115,22,0.3)' }} onClick={() => navigate('/admin/analytics')}>📊 View Reports</button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <section className="adn-cards-grid">
                        {cards.map((c, i) => (
                            <div className="adn-summary-card" key={i} style={{ '--card-accent': c.color }}>
                                <div className="adn-card-top">
                                    <div className="adn-card-icon" style={{ background: c.color + '18', color: c.color }}>{c.icon}</div>
                                    <span className={`adn-card-trend ${c.up ? 'up' : 'down'}`}>{c.trend}</span>
                                </div>
                                <div className="adn-card-value">{c.value}</div>
                                <div className="adn-card-label">{c.label}</div>
                                <div className="adn-card-spark"><Sparkline data={c.spark} color={c.color} /></div>
                            </div>
                        ))}
                    </section>

                    {/* Charts Row 1 */}
                    <div className="adn-chart-row">
                        <div className="adn-chart-card">
                            <div className="adn-chart-header">
                                <div><h3>Orders Per Cafe</h3><p>Total orders handled by each cafe</p></div>
                                <span className="adn-badge-blue">● Live</span>
                            </div>
                            <BarChart data={barData} />
                        </div>
                        <div className="adn-chart-card">
                            <div className="adn-chart-header">
                                <div><h3>Revenue Distribution</h3><p>% share by cafe</p></div>
                            </div>
                            <div className="adn-donut-wrap">
                                <DonutChart segments={donutSegs} />
                                <div className="adn-donut-legend">
                                    {donutSegs.map((s, i) => (
                                        <div key={i} className="adn-legend-row">
                                            <span className="adn-legend-dot" style={{ background: s.color }} />
                                            <span>{s.label}</span>
                                            <span className="adn-legend-pct">{s.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="adn-chart-row">
                        <div className="adn-chart-card">
                            <div className="adn-chart-header">
                                <div><h3>Weekly Sales Trend</h3><p>Orders Mon – Sun</p></div>
                            </div>
                            <LineChart data={weeklyData} color="#3b82f6" />
                        </div>
                        <div className="adn-chart-card">
                            <div className="adn-chart-header">
                                <div><h3>Peak Order Hours</h3><p>Order volume by hour</p></div>
                            </div>
                            <LineChart data={peakData} color="#f97316" />
                        </div>
                    </div>

                    {/* Tables Row */}
                    <div className="adn-tables-row">
                        {/* Recent Orders */}
                        <div className="adn-table-card">
                            <div className="adn-chart-header">
                                <div><h3>Recent Orders</h3><p>Latest transactions across all cafes</p></div>
                                <button className="adn-btn-sm">View All</button>
                            </div>
                            <table className="adn-table">
                                <thead>
                                    <tr><th>Order</th><th>User</th><th>Cafe</th><th>Amount</th><th>Status</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((o, i) => (
                                        <tr key={i}>
                                            <td className="adn-td-id">#{o.id}</td>
                                            <td>{o.customer?.firstName} {o.customer?.lastName}</td>
                                            <td>Cafe {o.id % 2 === 0 ? 'Alpha' : 'Beta'}</td>
                                            <td className="adn-td-amount">₹{o.totalAmount}</td>
                                            <td><span className={badge(o.status)}>{o.status}</span></td>
                                            <td className="adn-td-time">{new Date(o.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Recent Users */}
                        <div className="adn-table-card">
                            <div className="adn-chart-header">
                                <div><h3>New Registrations</h3><p>Recent signups</p></div>
                                <button className="adn-btn-sm" onClick={() => navigate('/admin/users')}>Manage</button>
                            </div>
                            <table className="adn-table">
                                <thead>
                                    <tr><th>User</th><th>Role</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {recentUsers.map((u, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="adn-user-cell">
                                                    <div className="adn-avatar-xs" style={{ background: avatarGrads[i % avatarGrads.length] }}>{u.firstName?.[0]}</div>
                                                    <div>
                                                        <p className="adn-cell-name">{u.firstName} {u.lastName}</p>
                                                        <p className="adn-cell-email">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="adn-role-chip">{u.role}</span></td>
                                            <td><span className={badge(u.status)}>{u.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Cafe Performance removed by user request */}

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
