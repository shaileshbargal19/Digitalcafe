import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import AdminSidebar from '../components/AdminSidebar';
import '../styles/AdminDashboardNew.css';
import API_BASE_URL from '../apiConfig';

const AdminUserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('ALL');
    const [isScanning, setIsScanning] = useState(false);
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
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const r = await fetch(`${API_BASE_URL}/auth/users`);
            if (r.ok) setUsers(await r.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleAiScan = async () => {
        setIsScanning(true);
        try {
            const r = await fetch(`${API_BASE_URL}/admin/ai-verify-all`, { method: 'POST' });
            if (r.ok) {
                const res = await r.json();
                addToast(`AI Document Scan Completed! Scanned: ${res.scanned}, Approved: ${res.approved}, Rejected: ${res.rejected}`, 'success', 6000);
                fetchUsers();
            } else {
                addToast('AI Scan failed', 'error');
            }
        } catch {
            addToast('AI Request failed', 'error');
        } finally {
            setIsScanning(false);
        }
    };

    const handleApprove = async (userId) => {
        try {
            const r = await fetch(`${API_BASE_URL}/auth/approve/${userId}?approverId=${user.id}`, { method: 'PUT' });
            if (r.ok) { addToast('User approved successfully!', 'success'); fetchUsers(); }
            else { addToast('Approval failed', 'error'); }
        } catch { addToast('Request failed', 'error'); }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this user?')) return;
        try {
            const r = await fetch(`${API_BASE_URL}/auth/users/${userId}?requesterId=${user.id}`, { method: 'DELETE' });
            if (r.ok) { addToast('User removed successfully', 'success'); fetchUsers(); }
            else { addToast('Delete failed', 'error'); }
        } catch { addToast('Request failed', 'error'); }
    };

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    const filteredUsers = users.filter(u => {
        const roleMatch = user.role === 'ADMIN'
            ? ['CAFE_OWNER', 'CUSTOMER', 'ADMIN'].includes(u.role)
            : ['CHEF', 'WAITER'].includes(u.role);
        const searchMatch = !searchTerm || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const tabMatch = filterRole === 'ALL' || u.role === filterRole;
        return roleMatch && searchMatch && tabMatch;
    });

    const roles = user.role === 'ADMIN' ? ['ALL', 'CAFE_OWNER', 'CUSTOMER', 'ADMIN'] : ['ALL', 'CHEF', 'WAITER'];
    const avatarColors = { ADMIN: '#ef4444', CAFE_OWNER: '#f97316', CUSTOMER: '#3b82f6', CHEF: '#10b981', WAITER: '#8b5cf6' };

    return (
        <div className="adn-root">
            <Toast toasts={toasts} removeToast={removeToast} />
            <AdminSidebar user={user} />

            <div className="adn-main-wrap">
                <header className="adn-topnav">
                    <div className="adn-topnav-left">
                        <div className="adn-search-box">
                            <span>🔍</span>
                            <input placeholder="Search by name or email…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="adn-topnav-right">
                        <button className="adn-btn-sm" onClick={() => navigate('/admin')}>← Dashboard</button>
                        <button className="adn-btn-download" style={{ fontSize: '.75rem', padding: '7px 14px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
                            onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="adn-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.65)), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #3b82f6 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>{user.role === 'ADMIN' ? 'User Directory' : 'Staff Roster'}</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Manage platform accounts, review AI verification scores, and govern access across the ecosystem.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                👥 {filteredUsers.length} accounts found
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end', zIndex: 1 }}>
                            {user.role === 'ADMIN' && (
                                <button 
                                    className="adn-btn-download" 
                                    style={{ 
                                        fontSize: '.8rem', 
                                        padding: '10px 20px', 
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        border: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                                    }} 
                                    onClick={handleAiScan}
                                    disabled={isScanning}
                                >
                                    {isScanning ? (
                                        <>🤖 Scanning Database...</>
                                    ) : (
                                        <>🤖 Run AI Document Scan</>
                                    )}
                                </button>
                            )}
                            <div className="adn-date-filter" style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                                {roles.map(r => (
                                    <button key={r} className={filterRole === r ? 'active' : ''} onClick={() => setFilterRole(r)} style={filterRole === r ? { background: '#3b82f6', color: '#fff' } : { color: '#cbd5e1' }}>{r}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="adn-table-card">
                        {loading ? (
                            <div className="adn-loading" style={{ height: 200 }}><div className="adn-spinner" /><p>Loading users…</p></div>
                        ) : (
                            <table className="adn-table">
                                <thead>
                                    <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Document</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="adn-user-cell">
                                                    <div className="adn-avatar-xs" style={{ background: avatarColors[u.role] || '#64748b' }}>
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="adn-cell-name">{u.firstName} {u.lastName}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontSize: '.78rem', color: 'var(--text-2)' }}>{u.email}</td>
                                            <td><span className="adn-role-chip">{u.role}</span></td>
                                            <td>
                                                <span className={u.status === 'APPROVED' ? 'adn-badge green' : u.status === 'PENDING' ? 'adn-badge orange' : 'adn-badge red'}>
                                                    {u.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="adn-td-time" style={{ lineHeight: 1.3 }}>
                                                <div style={{ fontWeight: 600 }}>{u.documentType || 'N/A'}</div>
                                                {u.verificationScore !== null && u.verificationScore !== undefined ? (
                                                    <div title={u.verificationNotes} style={{ fontSize: '.68rem', color: u.verificationScore >= 70 ? '#10b981' : '#f97316', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2, cursor: 'help' }}>
                                                        <span>🤖 AI:</span>
                                                        <span style={{ fontWeight: 700 }}>{u.verificationScore}%</span>
                                                        {u.approvedBy === 999 && <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1px 5px', borderRadius: 4, fontSize: '.58rem', fontWeight: 800 }}>Auto</span>}
                                                    </div>
                                                ) : (
                                                    <div style={{ fontSize: '.68rem', color: 'var(--text-3)', marginTop: 2 }}>No score</div>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {u.status === 'PENDING' && (
                                                        <button className="adn-btn-download" style={{ padding: '5px 12px', fontSize: '.72rem' }}
                                                            onClick={() => handleApprove(u.id)}>✅ Approve</button>
                                                    )}
                                                    <button className="adn-btn-sm" title="View details">👁</button>
                                                    <button className="adn-btn-sm danger" title="Remove user"
                                                        onClick={() => handleDelete(u.id)}>🗑</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-3)', fontStyle: 'italic' }}>No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminUserList;
