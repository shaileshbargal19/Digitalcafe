import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { Toast, useToast } from '../components/Toast';
import '../styles/AdminDashboardNew.css';
import API_BASE_URL from '../apiConfig';

const AdminComplaints = () => {
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
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
        fetchComplaints();
    }, [navigate]);

    const fetchComplaints = async () => {
        try {
            const r = await fetch(`${API_BASE_URL}/complaints`);
            if (r.ok) setComplaints(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleResolve = async (id) => {
        const response = window.prompt("Enter resolution message:");
        if (!response) return;
        try {
            const r = await fetch(`${API_BASE_URL}/complaints/${id}/resolve`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: response
            });
            if (r.ok) { addToast('Complaint resolved', 'success'); fetchComplaints(); }
        } catch { addToast('Action failed', 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this complaint record?")) return;
        try {
            const r = await fetch(`${API_BASE_URL}/complaints/${id}`, { method: 'DELETE' });
            if (r.ok) { addToast('Complaint removed', 'success'); fetchComplaints(); }
        } catch { addToast('Delete failed', 'error'); }
    };

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    return (
        <div className="adn-root">
            <Toast toasts={toasts} removeToast={removeToast} />
            <AdminSidebar user={user} />

            <div className="adn-main-wrap">
                <header className="adn-topnav">
                    <div className="adn-topnav-left">
                        <h2 className="adn-page-title" style={{ fontSize: '1.2rem' }}>Resolutions Center</h2>
                    </div>
                    <div className="adn-topnav-right">
                        <button className="adn-btn-download" onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="adn-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.65)), url('https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #ef4444 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>User Complaints</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Track, moderate, and resolve customer concerns across the platform.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                ⚠️ {complaints.filter(c => c.status === 'PENDING').length} pending resolutions
                            </div>
                        </div>
                    </div>

                    <div className="adn-table-card">
                        {loading ? (
                            <div className="adn-loading" style={{ height: 200 }}><div className="adn-spinner" /></div>
                        ) : (
                            <table className="adn-table">
                                <thead>
                                    <tr><th>ID</th><th>User</th><th>Category</th><th>Issue</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {complaints.map(c => (
                                        <tr key={c.id}>
                                            <td className="adn-td-id">#{c.id}</td>
                                            <td style={{ fontWeight: 600 }}>{c.userName || 'Anonymous'}</td>
                                            <td><span className="adn-role-chip" style={{ background: '#f1f5f9', color: '#64748b' }}>{c.subject}</span></td>
                                            <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.description}>
                                                {c.description}
                                            </td>
                                            <td className="adn-td-time">{new Date(c.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={c.status === 'RESOLVED' ? 'adn-badge green' : c.status === 'PENDING' ? 'adn-badge red' : 'adn-badge orange'}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {c.status === 'PENDING' && (
                                                        <button className="adn-btn-sm" onClick={() => handleResolve(c.id)}>Resolve</button>
                                                    )}
                                                    <button className="adn-btn-sm danger" onClick={() => handleDelete(c.id)}>🗑</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminComplaints;
