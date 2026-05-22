import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Toast, useToast } from '../components/Toast';
import { BarChart, GroupedBarChart, ProgressCircle } from '../components/Charts';
import '../styles/AdminDashboardNew.css';
import API_BASE_URL from '../apiConfig';

const AdminAnalytics = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState('Weekly');
    const [user, setUser] = useState(null);
    const [data, setData] = useState({
        totalUsers: 0, totalCafes: 0, totalOrders: 0, totalRevenue: 0,
        labels: [], userTrend: [], cafeTrend: [], revenueTrend: [],
        userGoal: 0, cafeGoal: 0
    });
    const [loading, setLoading] = useState(true);
    const { toasts, addToast, removeToast } = useToast();

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        if (stored.role !== 'ADMIN') {
            if (stored.role === 'CAFE_OWNER') navigate('/cafe/dashboard');
            else if (stored.role === 'CUSTOMER') navigate('/customer/dashboard');
            else if (stored.role === 'CHEF' || stored.role === 'WAITER') navigate('/staff');
            else navigate('/login');
            return;
        }
        setUser(stored);
    }, [navigate]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const r = await fetch(`${API_BASE_URL}/admin/analytics/${period.toLowerCase()}`);
                if (r.ok) {
                    setData(await r.json());
                } else {
                    addToast(`Failed to fetch ${period} analytics`, 'error');
                }
            } catch (e) {
                console.error(e);
                addToast(`Fetch error: ${e.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [period]);

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    // Map backend data to chart formats
    const userTrend = (data.labels || []).map((l, i) => ({ label: l, value: (data.userTrend || [])[i] || 0 }));
    const cafeTrend = (data.labels || []).map((l, i) => ({ label: l, value: (data.cafeTrend || [])[i] || 0 }));
    const revenueTrend = (data.labels || []).map((l, i) => ({ label: l, value: (data.revenueTrend || [])[i] || 0 }));

    return (
        <div className={`adn-root ${loading ? 'adn-loading-state' : ''}`}>
            {loading && <div className="adn-loading-overlay"><div className="adn-spinner-sm" /></div>}
            <Toast toasts={toasts} removeToast={removeToast} />
            <AdminSidebar user={user} />

            <div className="adn-main-wrap">
                <header className="adn-topnav">
                    <div className="adn-topnav-left">
                        <h2 className="adn-page-title" style={{ fontSize: '1.2rem' }}>Performance Insights</h2>
                    </div>
                </header>

                <main className="adn-content">
                    {/* Page Hero Banner */}
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(15,23,42,0.7)), url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #10b981 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Analytics Dashboard</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Monitor business metrics, growth trends, and financial health across all operational regions.</p>
                        </div>
                        <div className="adn-date-filter" style={{ zIndex: 1, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            {['Weekly', 'Monthly', 'Yearly'].map(p => (
                                <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)} style={period === p ? { background: '#10b981', color: '#fff' } : { color: '#cbd5e1' }}>{p} View</button>
                            ))}
                        </div>
                    </div>

                    <div className="adn-cards-grid">
                        <div className="adn-summary-card">
                            <div className="adn-card-value" style={{ color: 'var(--orange)' }}>{data.totalUsers}</div>
                            <div className="adn-card-label">New Users</div>
                        </div>
                        <div className="adn-summary-card">
                            <div className="adn-card-value" style={{ color: '#10b981' }}>{data.totalCafes}</div>
                            <div className="adn-card-label">Cafes Onboarded</div>
                        </div>
                        <div className="adn-summary-card">
                            <div className="adn-card-value" style={{ color: '#8b5cf6' }}>{data.totalOrders}</div>
                            <div className="adn-card-label">Total Orders</div>
                        </div>
                        <div className="adn-summary-card">
                            <div className="adn-card-value" style={{ color: '#3b82f6' }}>₹{(data.totalRevenue / 1000).toFixed(1)}K</div>
                            <div className="adn-card-label">Gross Revenue</div>
                        </div>
                    </div>

                    <div className="adn-chart-row adn-chart-full">
                        <div className="adn-chart-card">
                            <div className="adn-chart-header">
                                <div>
                                    <h3>Account Analysis</h3>
                                    <p>Side-by-side growth comparison of Users & Cafes</p>
                                </div>
                                <div style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
                                    <ProgressCircle pct={data.userGoal} color="var(--orange)" size={48} stroke={5} label="Users" />
                                    <ProgressCircle pct={data.cafeGoal} color="#10b981" size={48} stroke={5} label="Cafes" />
                                    <span className="adn-badge-blue">{period} Comparison</span>
                                </div>
                            </div>
                            <div style={{ height: 350, padding: '20px 0 10px' }}>
                                <GroupedBarChart
                                    data1={userTrend}
                                    data2={cafeTrend}
                                    color1="var(--orange)"
                                    color2="#10b981"
                                    height={300}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="adn-chart-row adn-chart-full">
                        <div className="adn-chart-card">
                            <div className="adn-chart-header">
                                <div>
                                    <h3>Financial Breakdown</h3>
                                    <p>Revenue distribution and trends</p>
                                </div>
                            </div>
                            <div style={{ height: 320, padding: '10px 0' }}>
                                <BarChart data={revenueTrend} height={300} />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminAnalytics;
