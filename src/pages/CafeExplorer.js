import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import '../styles/AdminDashboardNew.css';
import CustomerLayout from '../components/CustomerLayout';

/* ─── CafeExplorer ─────────────────────────────────────────────────────────── */
const CafeExplorer = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [hovCard, setHovCard] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // grid | list
    const { toasts, addToast, removeToast } = useToast();

    const CAFE_IMAGES = [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
    ];

    const TAGS = ['All Cafés', 'Top Rated', 'Fast Delivery', 'Budget', 'Premium', 'Veg Friendly'];
    const [activeTag, setActiveTag] = useState('All Cafés');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);

        fetch('/api/auth/cafes')
            .then(r => r.ok ? r.json() : [])
            .then(data => setCafes(data))
            .catch(() => addToast('Could not load cafés', 'error'))
            .finally(() => setLoading(false));
    }, [navigate, addToast]);

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    const getName = (meta, first) => !meta ? `${first}'s Café` : meta.split(';')[0].trim();

    // Mock enriched data for demo
    const enrich = (cafe) => ({
        ...cafe,
        name: getName(cafe.roleMetadata, cafe.firstName),
        imageUrl: CAFE_IMAGES[cafe.id % CAFE_IMAGES.length],
        rating: (4.2 + (cafe.id % 8) * 0.1).toFixed(1),
        reviews: 120 + (cafe.id % 200),
        deliveryTime: `${15 + (cafe.id % 20)}-${25 + (cafe.id % 20)} mins`,
        minOrder: `₹${150 + (cafe.id % 100)}`,
        tags: ['Coffee', 'Snacks', 'Beverages'].slice(0, 1 + (cafe.id % 3)),
    });

    const enriched = cafes.map(enrich);
    const filtered = enriched
        .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.city || '').toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : a.name.localeCompare(b.name));

    return (
        <CustomerLayout>
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Hero Banner */}
            <div style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 20, padding: '40px 40px', marginBottom: 28, minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: 20, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.3) 100%)' }} />
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
                    <p style={{ margin: '0 0 8px', color: '#fbbf24', fontSize: '.85rem', fontWeight: 800, letterSpacing: '1px' }}>PREMIUM DINING</p>
                    <h1 style={{ margin: '0 0 10px', color: 'white', fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2 }}>🗺️ Explore Partner Cafés</h1>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,.9)', fontSize: '.95rem', lineHeight: 1.5 }}>
                        <strong style={{ color: 'white' }}>{filtered.length} cafés</strong> serving incredible food right now.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 1, marginTop: 10 }}>
                    <div style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '14px 24px', textAlign: 'center' }}>
                        <p style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '1.3rem' }}>{cafes.length || 10}+</p>
                        <p style={{ color: 'rgba(255,255,255,.7)', margin: 0, fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cafés</p>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, padding: '14px 24px', textAlign: 'center' }}>
                        <p style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '1.3rem' }}>4.8★</p>
                        <p style={{ color: 'rgba(255,255,255,.7)', margin: 0, fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Rating</p>
                    </div>
                </div>
            </div>

            {/* Search + Sort + View toggle */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 12, padding: '10px 16px', border: '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
                    <span style={{ fontSize: '1rem' }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search café name or city…"
                        style={{ border: 'none', outline: 'none', flex: 1, fontSize: '.86rem', background: 'transparent', color: 'var(--text)' }} />
                    {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>}
                </div>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: '.84rem', fontWeight: 600, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                    <option value="name">Sort: A–Z</option>
                    <option value="rating">Sort: Top Rated</option>
                </select>
                <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                    {[['grid', '⊞'], ['list', '≡']].map(([mode, icon]) => (
                        <button key={mode} onClick={() => setViewMode(mode)}
                            style={{ padding: '10px 14px', border: 'none', cursor: 'pointer', fontSize: '1rem', background: viewMode === mode ? '#3b82f6' : 'var(--surface)', color: viewMode === mode ? 'white' : 'var(--text-3)', transition: 'all .2s' }}>
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Tags */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {TAGS.map(tag => (
                    <div key={tag} onClick={() => setActiveTag(tag)}
                        style={{ height: '36px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 99, cursor: 'pointer', fontSize: '.85rem', fontWeight: 700, transition: 'all .2s', background: activeTag === tag ? '#3b82f6' : 'var(--surface)', color: activeTag === tag ? '#ffffff' : 'var(--text)', boxShadow: activeTag === tag ? '0 4px 12px rgba(59,130,246,0.3)' : '0 2px 8px rgba(0,0,0,.05)', border: activeTag === tag ? '1px solid #3b82f6' : '1px solid var(--border)', userSelect: 'none' }}>
                        {tag}
                    </div>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 80 }}>
                    <div className="adn-spinner" />
                    <p style={{ marginTop: 14, color: 'var(--text-3)', fontWeight: 600 }}>Discovering cafés for you…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="adn-chart-card" style={{ textAlign: 'center', padding: 70 }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 14 }}>🏪</div>
                    <h3 style={{ margin: '0 0 8px' }}>No cafés found</h3>
                    <p style={{ color: 'var(--text-3)', margin: '0 0 16px' }}>Try a different search or filter</p>
                    <button onClick={() => setSearch('')} className="adn-btn-download">Clear Search</button>
                </div>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(270px,1fr))', gap: 20 }}>
                    {filtered.map((cafe) => (
                        <div key={cafe.id}
                            style={{ background: 'var(--surface)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: hovCard === cafe.id ? '0 16px 48px rgba(0,0,0,.14)' : '0 2px 12px rgba(0,0,0,.07)', transform: hovCard === cafe.id ? 'translateY(-6px)' : 'none' }}
                            onMouseEnter={() => setHovCard(cafe.id)} onMouseLeave={() => setHovCard(null)}
                            onClick={() => navigate(`/customer/menu/${cafe.id}`)}>
                            {/* Banner */}
                            <div style={{ height: 170, backgroundImage: `url(${cafe.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                                <div style={{ position: 'absolute', top: 12, right: 12, background: 'white', borderRadius: 20, padding: '4px 10px', fontSize: '.75rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                                    ⭐ {cafe.rating} <span style={{ color: '#64748b', fontWeight: 600 }}>({cafe.reviews}+)</span>
                                </div>
                                <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {cafe.tags.map((t, i) => (
                                        <span key={i} style={{ background: 'rgba(255,255,255,.95)', borderRadius: 20, padding: '4px 10px', fontSize: '.68rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px', backdropFilter: 'blur(4px)', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{t}</span>
                                    ))}
                                </div>
                            </div>
                            {/* Body */}
                            <div style={{ padding: '16px 18px' }}>
                                <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>{cafe.name}</h3>
                                <p style={{ margin: '0 0 14px', fontSize: '.78rem', color: 'var(--text-3)' }}>{cafe.tags.join(' • ')} • {cafe.city || 'N/A'}</p>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', borderRadius: 8, padding: '6px 10px' }}>
                                        <span style={{ fontSize: '.85rem' }}>🛵</span>
                                        <span style={{ fontWeight: 700, fontSize: '.76rem', color: 'var(--text)' }}>{cafe.deliveryTime}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg)', borderRadius: 8, padding: '6px 10px' }}>
                                        <span style={{ fontSize: '.85rem' }}>💰</span>
                                        <span style={{ fontWeight: 700, fontSize: '.76rem', color: 'var(--text)' }}>{cafe.minOrder} for one</span>
                                    </div>
                                </div>
                                <button style={{ width: '100%', padding: '12px', border: '1.5px solid var(--border)', borderRadius: 12, background: hovCard === cafe.id ? 'var(--orange-soft)' : 'transparent', color: hovCard === cafe.id ? '#f97316' : 'var(--text)', fontWeight: 800, fontSize: '.86rem', cursor: 'pointer', transition: 'all .2s' }}>
                                    View Menu & Order
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List View */
                <div className="adn-chart-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {filtered.map((cafe, i) => (
                        <div key={cafe.id}
                            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none', cursor: 'pointer', transition: 'background .15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            onClick={() => navigate(`/customer/menu/${cafe.id}`)}>
                            <img src={cafe.imageUrl} alt={cafe.name} style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: '1.5px solid var(--border)' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                                    <h3 style={{ margin: 0, fontSize: '.9rem', fontWeight: 800 }}>{cafe.name}</h3>
                                    <span style={{ background: '#fef3c7', color: '#b45309', borderRadius: 20, padding: '2px 8px', fontSize: '.68rem', fontWeight: 700 }}>⭐ {cafe.rating}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '.76rem', color: 'var(--text-3)' }}>📍 {cafe.city}, {cafe.state} • {cafe.deliveryTime} • Min {cafe.minOrder}</p>
                            </div>
                            <button style={{ padding: '8px 18px', border: 'none', borderRadius: 10, background: '#3b82f610', color: '#3b82f6', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer' }}>
                                View Menu →
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </CustomerLayout>
    );
};

export default CafeExplorer;
