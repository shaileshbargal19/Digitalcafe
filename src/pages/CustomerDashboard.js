import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardNew.css';
import CustomerLayout from '../components/CustomerLayout';

/* ─── Animated Counter ───────────────────────────────────────────────────── */
const AnimCounter = React.memo(({ target, prefix = '', suffix = '', duration = 1200 }) => {
    const [val, setVal] = useState(0);
    const numTarget = parseFloat(String(target).replace(/[^0-9.]/g, '')) || 0;
    useEffect(() => {
        let start = 0;
        const step = numTarget / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= numTarget) { setVal(numTarget); clearInterval(timer); }
            else setVal(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [numTarget, duration]);
    const fmt = n => n >= 1000 ? n.toLocaleString('en-IN') : n;
    return <>{prefix}{fmt(val)}{suffix}</>;
});

/* ─── Sparkline ───────────────────────────────────────────────────────────── */
const Sparkline = React.memo(({ data, color = '#3b82f6' }) => {
    const w = 80, h = 36;
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const id = `sg${color.replace('#', '')}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
            <defs>
                <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity=".25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${id})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
});

/* ─── Bar Chart ───────────────────────────────────────────────────────────── */
const BarChart = React.memo(({ data, color = '#8b5cf6' }) => {
    const [animated, setAnimated] = useState(false);
    useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
    const max = Math.max(...data.map(d => d.value));
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, padding: '0 4px' }}>
            {data.map((d, i) => {
                const pct = max ? (d.value / max) * 100 : 0;
                const isZero = d.value === 0;
                return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: '.66rem', fontWeight: 700, color: isZero ? 'var(--text-3)' : 'var(--text)', opacity: animated ? 1 : 0, transition: 'opacity .6s .2s' }}>
                            {d.value > 0 ? `₹${d.value}` : ''}
                        </span>
                        <div style={{ width: '100%', background: 'var(--bg)', borderRadius: 8, height: 105, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                            <div style={{
                                width: '100%', borderRadius: 8,
                                background: isZero ? 'var(--border)' : `linear-gradient(180deg, ${color}, ${color}99)`,
                                height: animated ? `${Math.max(pct, isZero ? 0 : 8)}%` : '0%',
                                transition: `height .9s cubic-bezier(.34,1.56,.64,1) ${i * 60}ms`,
                                boxShadow: isZero ? 'none' : `0 4px 16px ${color}44`
                            }} />
                        </div>
                        <span style={{ fontSize: '.7rem', fontWeight: 600, color: 'var(--text-3)' }}>{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
});

/* ─── Loyalty Ring ────────────────────────────────────────────────────────── */
const LoyaltyRing = React.memo(({ points, goal, color }) => {
    const [progress, setProgress] = useState(0);
    const r = 48, circ = 2 * Math.PI * r;
    const pct = Math.min(points / goal, 1);
    useEffect(() => { const t = setTimeout(() => setProgress(pct), 300); return () => clearTimeout(t); }, [pct]);
    return (
        <svg width={120} height={120} viewBox="0 0 120 120" style={{ display: 'block' }}>
            <defs>
                <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
            </defs>
            <circle cx="60" cy="60" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
            <circle cx="60" cy="60" r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="10"
                strokeDasharray={`${progress * circ} ${circ}`}
                strokeDashoffset="0" strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(.34,1.2,.64,1) .3s' }}
            />
            <text x="60" y="55" textAnchor="middle" fontSize="15" fontWeight="800" fill="var(--text)">{points.toLocaleString()}</text>
            <text x="60" y="72" textAnchor="middle" fontSize="9.5" fill="var(--text-3)">points</text>
        </svg>
    );
});

/* ═══════════════════════════════════════════════════════════════════════════ */
const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        loyaltyPoints: 0,
        totalOrders: 0,
        monthlySpend: 0,
        activeVouchers: 0,
        recentOrders: [],
        spendChart: []
    });
    const [loading, setLoading] = useState(true);
    const [hovCard, setHovCard] = useState(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);

        const fetchStats = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/customer/${stored.id}/stats`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    }, [navigate]);

    if (!user || loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
            <div style={{ textAlign: 'center' }}><div className="adn-spinner" /><p style={{ marginTop: 12, color: 'var(--text-3)' }}>Loading your dashboard…</p></div>
        </div>
    );

    /* ── Data ──────────────────────────────────────────────────────────────── */
    const cards = [
        { label: 'Loyalty Points', value: stats.loyaltyPoints, prefix: '', suffix: ' pts', icon: '💎', trend: 'Keep earning!', up: true, color: '#8b5cf6', spark: [800, 900, 950, 1000, 1050, 1100, 1150, 1200, 1230, stats.loyaltyPoints], action: () => navigate('/customer/vouchers') },
        { label: 'Total Orders', value: stats.totalOrders, prefix: '', suffix: '', icon: '📦', trend: 'Life of the party', up: true, color: '#3b82f6', spark: [10, 12, 14, 16, 18, 20, 22, 24, 26, stats.totalOrders], action: () => navigate('/customer/orders') },
        { label: 'Total Spent', value: stats.monthlySpend, prefix: '₹', suffix: '', icon: '💰', trend: 'Market value', up: true, color: '#f97316', spark: [1200, 1800, 1500, 2200, 1900, 2800, 2400, 3200, 3800, stats.monthlySpend], action: () => navigate('/customer/orders') },
        { label: 'Active Vouchers', value: stats.activeVouchers, prefix: '', suffix: '', icon: '🎟️', trend: 'Expiring soon', up: false, color: '#10b981', spark: [0, 0, 1, 1, 1, 2, 2, 2, 3, stats.activeVouchers], action: () => navigate('/customer/vouchers') },
    ];

    const spendData = stats.spendChart.length > 0 ? stats.spendChart : [
        { label: 'Mon', value: 0 }, { label: 'Tue', value: 0 }, { label: 'Wed', value: 0 },
        { label: 'Thu', value: 0 }, { label: 'Fri', value: 0 }, { label: 'Sat', value: 0 }, { label: 'Sun', value: 0 },
    ];

    const recentOrders = stats.recentOrders.map(o => ({
        id: `#${o.id}`,
        cafe: 'Digital Cafe', // Assuming names are not in Order object for now
        items: o.items ? o.items.map(i => i.menuItem.name).join(', ') : 'No items',
        amount: `₹${o.totalAmount}`,
        status: o.status,
        date: new Date(o.createdAt).toLocaleDateString(),
        icon: '☕'
    }));

    const recommended = [
        { name: 'Velvet Latte', cafe: 'Cafe Alpha', price: '₹180', tag: 'Bestseller', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=150&q=80', color: '#f97316' },
        { name: 'Butter Croissant', cafe: 'Cafe Beta', price: '₹120', tag: 'Fresh Daily', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80', color: '#f59e0b' },
        { name: 'Cold Brew', cafe: 'Cafe Alpha', price: '₹160', tag: 'New', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80', color: '#3b82f6' },
        { name: 'Avocado Toast', cafe: 'Cafe Gamma', price: '₹220', tag: 'Popular', img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=150&q=80', color: '#10b981' },
    ];

    const quickActions = [
        { icon: '🗺️', label: 'Explore Cafés', color: '#3b82f6', path: '/customer/explore' },
        { icon: '📦', label: 'My Orders', color: '#f97316', path: '/customer/orders' },
        { icon: '🎟️', label: 'Vouchers', color: '#8b5cf6', path: '/customer/vouchers' },
        { icon: '👤', label: 'My Profile', color: '#10b981', path: '/profile' },
    ];

    const statusBadge = s => {
        const m = { DELIVERED: ['#dcfce7', '#15803d'], CANCELLED: ['#fee2e2', '#b91c1c'], PENDING: ['#fef3c7', '#b45309'], PROCESSING: ['#e0f2fe', '#0369a1'] };
        const [bg, color] = m[String(s).toUpperCase()] || ['#f1f5f9', '#64748b'];
        return <span style={{ background: bg, color, borderRadius: 20, padding: '3px 10px', fontSize: '.68rem', fontWeight: 800, textTransform: 'capitalize' }}>{s.toLowerCase()}</span>;
    };

    /* ── Styles ─────────────────────────────────────────────────────────────── */
    const cardHov = {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0,0,0,.12)',
    };

    return (
        <CustomerLayout>
            {/* ── Hero Welcome Banner ── */}
            <div style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1495147466023-05c6efaebeaa?auto=format&fit=crop&w=1200&q=80)',
                backgroundSize: 'cover', backgroundPosition: 'center',
                borderRadius: 24, padding: '40px', marginBottom: 32,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
            }}>
                {/* Dark overlay for readability */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.4) 100%)' }} />
                
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', padding: '6px 14px', borderRadius: 100, marginBottom: 16, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                        <span style={{ fontSize: '1rem' }}>✨</span>
                        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{greeting}</span>
                    </div>
                    <h1 style={{ margin: '0 0 12px', color: 'white', fontSize: '2.4rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        Ready for your <span style={{ background: 'linear-gradient(to right, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>next caffeine fix</span>, {user.firstName}?
                    </h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, fontWeight: 500 }}>
                        Explore 25+ local cafés around you. You've earned <strong style={{ color: 'white' }}>{stats.loyaltyPoints} loyalty points</strong> so far. Treat yourself today!
                    </p>
                    
                    <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                        <button onClick={() => navigate('/customer/explore')}
                            style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', border: 'none', background: '#f97316', color: 'white', boxShadow: '0 10px 20px rgba(249, 115, 22, 0.3)', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = ''}>
                            🗺️ Find Nearest Café
                        </button>
                        <button onClick={() => navigate('/customer/orders')}
                            style={{ padding: '12px 28px', borderRadius: 14, fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                            📜 View History
                        </button>
                    </div>
                </div>

                {/* Right side illustration or floating stats card */}
                <div style={{ position: 'relative', zIndex: 1, display: { md: 'block', xs: 'none' } }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: '24px', backdropFilter: 'blur(20px)', width: '220px', textAlign: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '1.8rem', boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)' }}>
                            💎
                        </div>
                        <h4 style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', fontSize: '.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Active Rewards</h4>
                        <p style={{ color: 'white', margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>{stats.activeVouchers}</p>
                        <div style={{ marginTop: 16, fontSize: '.7rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: 100 }}>
                            1 Expiring Soon
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Quick Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
                {quickActions.map((q, i) => (
                    <button key={i} onClick={() => navigate(q.path)}
                        style={{ border: 'none', cursor: 'pointer', background: 'var(--surface)', borderRadius: 14, padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 2px 12px rgba(0,0,0,.06)', transition: 'all .2s', fontWeight: 700, fontSize: '.82rem', color: 'var(--text)' }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${q.color}30`; e.currentTarget.style.borderLeft = `3px solid ${q.color}`; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; e.currentTarget.style.borderLeft = ''; }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: q.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                            {q.icon}
                        </div>
                        {q.label}
                    </button>
                ))}
            </div>

            {/* ── Summary Cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
                {cards.map((c, i) => (
                    <div key={i}
                        className="adn-chart-card"
                        style={{ padding: '20px', cursor: 'pointer', transition: 'all .25s', ...(hovCard === i ? cardHov : {}) }}
                        onMouseEnter={() => setHovCard(i)}
                        onMouseLeave={() => setHovCard(null)}
                        onClick={c.action}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                {c.icon}
                            </div>
                            <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: c.up ? '#dcfce7' : '#fff7ed', color: c.up ? '#15803d' : '#c2410c' }}>
                                {c.trend}
                            </span>
                        </div>
                        <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text)' }}>
                            <AnimCounter target={c.value} prefix={c.prefix} suffix={c.suffix} />
                        </p>
                        <p style={{ margin: '0 0 12px', fontSize: '.76rem', color: 'var(--text-3)', fontWeight: 600 }}>{c.label}</p>
                        <Sparkline data={c.spark} color={c.color} />
                    </div>
                ))}
            </div>

            {/* ── Charts Row: Spending + Loyalty ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* Weekly Spending */}
                <div className="adn-chart-card">
                    <div className="adn-chart-header" style={{ marginBottom: 20 }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Weekly Spending</h3>
                            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '.78rem' }}>Mon – Sun this week • Total ₹2,120</p>
                        </div>
                        <span style={{ fontSize: '.72rem', fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: '#dcfce7', color: '#15803d' }}>↑ 18% vs last week</span>
                    </div>
                    <BarChart data={spendData} color="#8b5cf6" />
                </div>

                {/* Loyalty Progress */}
                <div className="adn-chart-card">
                    <div className="adn-chart-header" style={{ marginBottom: 16 }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>Loyalty Progress</h3>
                            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '.78rem' }}>Points until Gold Tier</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <LoyaltyRing points={1250} goal={2000} color="#8b5cf6" />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <span style={{ fontSize: '1.2rem' }}>🥈</span>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 800, fontSize: '.9rem' }}>Silver Member</p>
                                    <p style={{ margin: 0, fontSize: '.73rem', color: 'var(--text-3)' }}>750 pts to reach Gold</p>
                                </div>
                            </div>
                            <div style={{ height: 7, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
                                <div style={{ height: '100%', width: '62.5%', background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)', borderRadius: 99, transition: 'width 1.4s .5s cubic-bezier(.34,1.2,.64,1)' }} />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--text-3)', fontWeight: 600 }}>
                                <span>1,250 pts</span><span>2,000 pts (Gold)</span>
                            </div>
                            {/* Tier badges */}
                            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                                {[['🥉', 'Bronze', true], ['🥈', 'Silver', true], ['🥇', 'Gold', false]].map(([ic, name, done], i) => (
                                    <div key={i} style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 10, background: done ? '#8b5cf615' : 'var(--bg)', border: done ? '1.5px solid #8b5cf640' : '1.5px solid var(--border)' }}>
                                        <div style={{ fontSize: '1rem' }}>{ic}</div>
                                        <div style={{ fontSize: '.65rem', fontWeight: 700, color: done ? '#8b5cf6' : 'var(--text-3)', marginTop: 2 }}>{name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Recommended + Recent Orders ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20, marginBottom: 24 }}>

                {/* Recommended Items */}
                <div className="adn-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 20px 14px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '.95rem' }}>Recommended For You</h3>
                            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '.74rem' }}>Based on your order history</p>
                        </div>
                        <button onClick={() => navigate('/customer/explore')}
                            style={{ background: '#3b82f610', border: '1.5px solid #3b82f630', color: '#3b82f6', borderRadius: 8, padding: '5px 12px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            Browse All →
                        </button>
                    </div>
                    <div style={{ padding: '10px 0' }}>
                        {recommended.map((item, i) => (
                            <div key={i}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', cursor: 'pointer', transition: 'background .15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                onClick={() => navigate('/customer/explore')}>
                                <img src={item.img} alt={item.name} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border)' }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '.84rem' }}>{item.name}</p>
                                    <p style={{ margin: 0, fontSize: '.71rem', color: 'var(--text-3)' }}>{item.cafe}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 3px', fontWeight: 800, fontSize: '.88rem' }}>{item.price}</p>
                                    <span style={{ background: item.color + '18', color: item.color, borderRadius: 20, padding: '2px 7px', fontSize: '.65rem', fontWeight: 700 }}>{item.tag}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="adn-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '18px 20px 14px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '.95rem' }}>Recent Orders</h3>
                            <p style={{ margin: 0, color: 'var(--text-3)', fontSize: '.74rem' }}>Your last 4 café visits</p>
                        </div>
                        <button onClick={() => navigate('/customer/orders')}
                            style={{ background: '#3b82f610', border: '1.5px solid #3b82f630', color: '#3b82f6', borderRadius: 8, padding: '5px 12px', fontSize: '.75rem', fontWeight: 700, cursor: 'pointer' }}>
                            View All →
                        </button>
                    </div>
                    <div>
                        {recentOrders.map((o, i) => (
                            <div key={i}
                                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < recentOrders.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                onClick={() => navigate('/customer/orders')}>
                                <img src={'https://images.unsplash.com/photo-1490818387583-1b0ba689a074?auto=format&fit=crop&w=150&q=80'} alt="Order" style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border)' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                        <span style={{ fontWeight: 800, fontSize: '.85rem' }}>{o.id}</span>
                                        {statusBadge(o.status)}
                                    </div>
                                    <p style={{ margin: '0 0 2px', fontSize: '.78rem', color: 'var(--text-2)' }}>{o.cafe} • {o.items}</p>
                                    <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-3)' }}>{o.date}</p>
                                </div>
                                <div style={{ fontWeight: 800, fontSize: '.9rem', flexShrink: 0 }}>{o.amount}</div>
                            </div>
                        ))}
                    </div>
                    {/* Reorder CTA */}
                    <div style={{ padding: '12px 20px', borderTop: '1.5px solid var(--border)', background: 'var(--bg)' }}>
                        <button onClick={() => navigate('/customer/explore')}
                            style={{ width: '100%', padding: '10px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#8b5cf6,#3b82f6)', color: 'white', fontWeight: 700, fontSize: '.84rem', cursor: 'pointer' }}>
                            ☕ Order Again
                        </button>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default CustomerDashboard;
