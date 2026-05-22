import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Toast, useToast } from '../components/Toast';
import '../styles/AdminDashboardNew.css';
import '../styles/CafeBoxStyles.css';
import API_BASE_URL from '../apiConfig';

const AdminCafeList = () => {
    const navigate = useNavigate();
    const [cafes, setCafes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const { toasts, addToast, removeToast } = useToast();

    const CAFE_IMAGES = [
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
    ];

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
        fetchCafes();
    }, [navigate]);

    const fetchCafes = async () => {
        try {
            const r = await fetch(`${API_BASE_URL}/auth/cafes`);
            if (r.ok) {
                const data = await r.json();
                setCafes(data);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    return (
        <div className="adn-root">
            <Toast toasts={toasts} removeToast={removeToast} />
            <AdminSidebar user={user} />

            <div className="adn-main-wrap">
                <header className="adn-topnav">
                    <div className="adn-topnav-left">
                        <h2 className="adn-page-title" style={{ fontSize: '1.2rem' }}>Cafe Management</h2>
                    </div>
                    <div className="adn-topnav-right">
                        <button className="adn-btn-download" onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="adn-content">
                    <div className="adn-page-header">
                        <div>
                            <h1 className="adn-page-title">Registered Cafes</h1>
                            <p className="adn-page-sub">Monitor and manage cafe partners</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="adn-loading" style={{ height: 200 }}><div className="adn-spinner" /></div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 24 }}>
                            {cafes.map(c => {
                                const imgUrl = CAFE_IMAGES[c.id % CAFE_IMAGES.length];
                                return (
                                    <div key={c.id} style={{ background: 'var(--surface)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                        <div style={{ height: 160, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: 12, right: 12, background: c.status === 'APPROVED' ? '#10b981' : '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: 12, fontSize: '.7rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                                                {c.status || 'PENDING'}
                                            </div>
                                        </div>
                                        <div style={{ padding: 20 }}>
                                            <h3 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800 }}>{c.roleMetadata || 'Unnamed Cafe'}</h3>
                                            <p style={{ margin: '0 0 16px', fontSize: '.8rem', color: 'var(--text-3)' }}>📍 {c.city || 'No Location specified'}</p>
                                            
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Orders</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>{(c.id * 123) % 1000}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Rating</div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>⭐ 4.5</div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem' }}>
                                                        {c.firstName?.[0]}
                                                    </div>
                                                    <span style={{ fontSize: '.85rem', fontWeight: 600 }}>{c.firstName} {c.lastName}</span>
                                                </div>
                                                {c.status === 'PENDING' && (
                                                    <button style={{ padding: '6px 14px', background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '.75rem', cursor: 'pointer' }} onClick={(e) => {
                                                        e.stopPropagation();
                                                        fetch(`${API_BASE_URL}/auth/approve/${c.id}?approverId=${user.id}`, { method: 'PUT' })
                                                            .then(r => r.ok ? (addToast('Cafe Approved!', 'success'), fetchCafes()) : addToast('Approval failed', 'error'));
                                                    }}>Approve</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminCafeList;
