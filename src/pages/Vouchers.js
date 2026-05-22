import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardNew.css';
import CustomerLayout from '../components/CustomerLayout';

const Vouchers = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active');
    const [copied, setCopied] = useState(null);
    const [hovVoucher, setHovVoucher] = useState(null);
    const [loyaltyAnim, setLoyaltyAnim] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);

        const fetchVouchers = async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/customer/${stored.id}/vouchers`);
                if (res.ok) {
                    const data = await res.json();
                    setVouchers(data.length > 0 ? data : [
                        { id: 1, code: 'CAFE20', title: '20% Off Your Order', desc: 'On orders above ₹300 at any café', discount: '20%', type: 'Percent', expiry: '15 Mar 2026', daysLeft: 13, status: 'active', icon: '☕', color: '#f97316', grad: 'linear-gradient(135deg,#f97316,#ef4444)' },
                    ]);
                }
            } catch (err) {
                console.error("Failed to fetch vouchers:", err);
            } finally {
                setLoading(false);
                setTimeout(() => setLoyaltyAnim(true), 400);
            }
        };

        fetchVouchers();
    }, [navigate]);

    if (!user || loading) return <div className="adn-loading"><div className="adn-spinner" /><p style={{ marginTop: 12, color: 'var(--text-3)' }}>Loading your rewards…</p></div>;

    const filtered = activeTab === 'all' ? vouchers : vouchers.filter(v => v.status === activeTab);
    const activeCount = vouchers.filter(v => v.status === 'active').length;

    const handleCopy = (code, e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code).catch(() => { });
        setCopied(code);
        setTimeout(() => setCopied(null), 2500);
    };

    const TABS = [
        { id: 'all', label: 'All', count: vouchers.length },
        { id: 'active', label: 'Active', count: activeCount },
        { id: 'expired', label: 'Expired', count: vouchers.filter(v => v.status === 'expired').length },
        { id: 'used', label: 'Used', count: vouchers.filter(v => v.status === 'used').length },
    ];

    const statusStyles = {
        active: { bg: '#dcfce7', color: '#15803d', label: '✓ Active' },
        expired: { bg: '#fee2e2', color: '#b91c1c', label: '✗ Expired' },
        used: { bg: '#f1f5f9', color: '#64748b', label: '✓ Used' },
    };

    return (
        <CustomerLayout>
            <main className="adn-content" style={{ padding: 0 }}>
                {/* Loyalty Banner */}
                <div style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    borderRadius: 20, padding: '24px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.5) 100%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, position: 'relative', zIndex: 1 }}>
                        <div>
                            <p style={{ margin: '0 0 4px', color: 'rgba(255,255,255,.8)', fontSize: '.78rem', fontWeight: 600 }}>MY VOUCHERS & REWARDS</p>
                            <h1 style={{ margin: '0 0 6px', color: 'white', fontSize: '1.4rem', fontWeight: 800 }}>🎟️ {activeCount} Active Vouchers</h1>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,.75)', fontSize: '.83rem' }}>
                                💎 <strong style={{ color: 'white' }}>1,250 loyalty pts</strong> · 750 pts to Gold Tier
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 14, padding: '12px 20px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                                <p style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>1,250</p>
                                <p style={{ color: 'rgba(255,255,255,.7)', margin: 0, fontSize: '.7rem' }}>Loyalty Pts</p>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 14, padding: '12px 20px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                                <p style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '1.2rem' }}>₹62</p>
                                <p style={{ color: 'rgba(255,255,255,.7)', margin: 0, fontSize: '.7rem' }}>Pts Value</p>
                            </div>
                        </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 16, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.73rem', color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>
                            <span>Silver (1,000 pts)</span><span>Gold (2,000 pts)</span>
                        </div>
                        <div style={{ height: 8, background: 'rgba(255,255,255,.2)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: loyaltyAnim ? '62.5%' : '0%', background: 'white', borderRadius: 99, transition: 'width 1.6s cubic-bezier(.34,1.2,.64,1)' }} />
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
                    {[
                        { label: 'Active Vouchers', val: activeCount, icon: '🎟️', color: '#8b5cf6', bg: '#f5f3ff' },
                        { label: 'Total Savings', val: '₹350', icon: '💰', color: '#10b981', bg: '#f0fdf4' },
                        { label: 'Expiring Soon', val: 1, icon: '⚡', color: '#f97316', bg: '#fff7ed' },
                    ].map((s, i) => (
                        <div key={i} className="adn-chart-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{s.icon}</div>
                            <div><p style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.val}</p><p style={{ margin: 0, fontSize: '.73rem', color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</p></div>
                        </div>
                    ))}
                </div>

                {/* Voucher List */}
                <div className="adn-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1.5px solid var(--border)' }}>
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                style={{ padding: '13px 18px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, color: activeTab === tab.id ? '#8b5cf6' : 'var(--text-3)', borderBottom: activeTab === tab.id ? '2.5px solid #8b5cf6' : '2.5px solid transparent', marginBottom: -1.5, display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s' }}>
                                {tab.label}
                                <span style={{ background: activeTab === tab.id ? '#8b5cf620' : 'var(--bg)', color: activeTab === tab.id ? '#8b5cf6' : 'var(--text-3)', borderRadius: 99, padding: '1px 7px', fontSize: '.68rem', fontWeight: 800 }}>{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map(v => {
                            const ss = statusStyles[v.status];
                            const isActive = v.status === 'active';
                            const isHov = hovVoucher === v.id;
                            const expiringSoon = isActive && v.daysLeft <= 10;
                            return (
                                <div key={v.id}
                                    onMouseEnter={() => setHovVoucher(v.id)}
                                    onMouseLeave={() => setHovVoucher(null)}
                                    style={{ border: `1.5px solid ${isHov && isActive ? v.color + '60' : 'var(--border)'}`, borderRadius: 16, overflow: 'hidden', opacity: isActive ? 1 : 0.62, transition: 'all .22s', boxShadow: isHov && isActive ? `0 8px 32px ${v.color}22` : '0 2px 8px rgba(0,0,0,.04)', transform: isHov && isActive ? 'translateY(-2px)' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                        {/* Accent Column */}
                                        <div style={{ width: 100, backgroundImage: 'url(https://images.unsplash.com/photo-1490818387583-1b0ba689a074?auto=format&fit=crop&w=300&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '16px 0', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                                            <div style={{ position: 'absolute', inset: 0, background: isActive ? `linear-gradient(135deg, ${v.color}cc, #000000aa)` : 'rgba(15,23,42,0.85)' }} />
                                            {expiringSoon && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(0,0,0,.3)', padding: '3px 0', textAlign: 'center', fontSize: '.6rem', fontWeight: 700, color: 'white', zIndex: 1 }}>⚡ SOON</div>}
                                            <span style={{ fontSize: '1.6rem', position: 'relative', zIndex: 1 }}>{v.icon}</span>
                                            <span style={{ color: 'white', fontWeight: 900, fontSize: '1.05rem', textAlign: 'center', lineHeight: 1, position: 'relative', zIndex: 1 }}>{v.discount}</span>
                                            <span style={{ color: 'rgba(255,255,255,.75)', fontSize: '.62rem', fontWeight: 600, textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>{v.type}</span>
                                        </div>

                                        {/* Body */}
                                        <div style={{ flex: 1, padding: '14px 18px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <h3 style={{ margin: 0, fontSize: '.92rem', fontWeight: 800 }}>{v.title}</h3>
                                                    <span style={{ background: ss.bg, color: ss.color, borderRadius: 99, padding: '2px 9px', fontSize: '.67rem', fontWeight: 700 }}>{ss.label}</span>
                                                </div>
                                            </div>
                                            <p style={{ margin: '0 0 8px', fontSize: '.77rem', color: 'var(--text-3)' }}>{v.desc}</p>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {/* Code pill */}
                                                    <div style={{ background: isActive ? v.color + '10' : 'var(--bg)', border: `1.5px dashed ${isActive ? v.color + '60' : 'var(--border)'}`, borderRadius: 8, padding: '6px 14px', fontFamily: 'monospace', fontWeight: 800, fontSize: '.9rem', letterSpacing: '.08em', color: isActive ? v.color : 'var(--text-3)' }}>
                                                        {v.code}
                                                    </div>
                                                    {isActive && (
                                                        <button onClick={(e) => handleCopy(v.code, e)}
                                                            style={{ padding: '6px 14px', border: 'none', borderRadius: 8, background: copied === v.code ? '#10b981' : v.color, color: 'white', fontWeight: 700, fontSize: '.76rem', cursor: 'pointer', transition: 'background .2s', display: 'flex', alignItems: 'center', gap: 5 }}>
                                                            {copied === v.code ? '✓ Copied!' : '📋 Copy Code'}
                                                        </button>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                                                    <p style={{ margin: 0, fontSize: '.72rem', color: expiringSoon ? '#f97316' : 'var(--text-3)', fontWeight: expiringSoon ? 700 : 500 }}>
                                                        {expiringSoon ? `⚡ Expires in ${v.daysLeft} days` : `Expires: ${v.expiry}`}
                                                    </p>
                                                    {isActive && (
                                                        <button onClick={() => navigate('/customer/explore')}
                                                            style={{ padding: '6px 12px', border: `1.5px solid ${v.color}40`, borderRadius: 8, background: v.color + '10', color: v.color, fontWeight: 700, fontSize: '.73rem', cursor: 'pointer' }}>
                                                            Use Now →
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div style={{ textAlign: 'center', padding: 50 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎟️</div>
                                <h3 style={{ margin: '0 0 6px' }}>No vouchers</h3>
                                <p style={{ color: 'var(--text-3)', margin: '0 0 16px' }}>Keep ordering to earn loyalty rewards!</p>
                                <button onClick={() => navigate('/customer/explore')} className="adn-btn-download">Explore Cafés</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </CustomerLayout>
    );
};

export default Vouchers;
