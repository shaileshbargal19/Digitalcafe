import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Toast, useToast } from '../components/Toast';
import '../styles/CafeOwnerDashboard.css';
import API_BASE_URL from '../apiConfig';

const MenuManager = () => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('cafeTheme') || 'dark');
    useEffect(() => {
        if (theme === 'light') document.body.classList.add('light-theme');
        else document.body.classList.remove('light-theme');
        localStorage.setItem('cafeTheme', theme);
    }, [theme]);

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { toasts, addToast, removeToast } = useToast();
    const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'Normal', available: true, imageUrl: '', isFeatured: false });

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        fetchMenuForOwner(stored.id);
    }, [navigate]);

    const fetchMenuForOwner = async (ownerId) => {
        setLoading(true);
        try {
            const r = await fetch(`${API_BASE_URL}/menu/cafe/${ownerId}`);
            if (r.ok) setMenuItems(await r.json());
        } catch { }
        finally { setLoading(false); }
    };

    const fetchMenu = () => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (stored) fetchMenuForOwner(stored.id);
    };

    const handleInputChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const url = editingItem
            ? `${API_BASE_URL}/menu/admin/${editingItem.id}`
            : `${API_BASE_URL}/menu/admin?ownerId=${currentUser.id}`;
        const method = editingItem ? 'PUT' : 'POST';
        const payload = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category: formData.category,
            available: formData.available,
            imageUrl: formData.imageUrl || null,
            isFeatured: formData.isFeatured,
        };
        try {
            const r = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (r.ok) {
                addToast(`Item ${editingItem ? 'updated' : 'added'} successfully! ✓`, 'success');
                setShowModal(false); setEditingItem(null);
                setFormData({ name: '', description: '', price: '', category: 'Normal', available: true, imageUrl: '', isFeatured: false });
                fetchMenu();
            } else {
                const errText = await r.text();
                addToast(`Failed: ${errText || r.status}`, 'error');
            }
        } catch (err) { addToast(`Network error: ${err.message}`, 'error'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this item from the menu?')) return;
        try {
            const r = await fetch(`${API_BASE_URL}/menu/admin/${id}`, { method: 'DELETE' });
            if (r.ok) { addToast('Item removed from menu ✓', 'success'); fetchMenu(); }
            else { const t = await r.text(); addToast(`Delete failed: ${t || r.status}`, 'error'); }
        } catch (err) { addToast(`Network error: ${err.message}`, 'error'); }
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price,
            category: item.category || 'Normal',
            available: item.available !== false,
            imageUrl: item.imageUrl || '',
            isFeatured: item.isFeatured || false
        });
        setShowModal(true);
    };

    if (!user) return <div className="cafe-loading"><div className="cafe-spinner" /></div>;

    const filtered = menuItems.filter(i => !searchTerm || i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.category?.toLowerCase().includes(searchTerm.toLowerCase()));

    /* ── Input style reuse ─────────────────────────────────────────────────── */
    const inputStyle = { border: '1.5px solid var(--cafe-border)', borderRadius: 10, padding: '10px 14px', fontSize: '.85rem', fontFamily: 'Outfit,sans-serif', outline: 'none', width: '100%', background: 'var(--cafe-hover)', color: 'var(--cafe-text-1)' };

    return (
        <div className="cafe-root">
            <Toast toasts={toasts} removeToast={removeToast} />

            {/* Sidebar */}
            <aside className="cafe-sidebar open">
                <div className="cafe-sidebar-brand">
                    <div className="cafe-logo-icon">☕</div>
                    <span className="cafe-logo-text">Digital<span className="cafe-logo-accent"> Café</span></span>
                </div>
                <nav className="cafe-nav">
                    {(user?.role === 'CAFE_OWNER' ? [
                        { label: 'Dashboard', icon: '⊞', path: '/cafe/dashboard' },
                        { label: 'Live Orders', icon: '📦', path: '/cafe/orders' },
                        { label: 'Order History', icon: '📜', path: '/cafe/history' },
                        { label: 'Menu Manager', icon: '🍽️', path: '/cafe/menu', active: true },
                        { label: 'Bookings', icon: '📅', path: '/cafe/bookings' },
                        { label: 'Staff', icon: '👨‍🍳', path: '/cafe/staff' },
                        { label: 'My Profile', icon: '👤', path: '/profile' },
                    ] : [
                        { label: 'Dashboard', icon: '⊞', path: user.role === 'CAFE_OWNER' ? '/cafe/dashboard' : '/admin' },
                        { label: 'Live Orders', icon: '📦', path: '/admin/orders' },
                        { label: 'Menu Manager', icon: '🍽️', path: '/admin/menu', active: true },
                        { label: 'Staff', icon: '👨‍🍳', path: '/admin/staff' },
                    ]).map((item, i) => (
                        <button key={i} className={`cafe-nav-item ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}>
                            <span className="cafe-nav-icon">{item.icon}</span>
                            <span className="cafe-nav-label">{item.label}</span>
                            {item.active && <span className="cafe-nav-pill" />}
                        </button>
                    ))}
                </nav>
                <div className="cafe-sidebar-footer">
                    <button className="cafe-btn-secondary" style={{ width: '100%', marginBottom: 12, padding: '8px', fontSize: '.9rem' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
                    
                    <div className="cafe-user-mini">
                        <div className="cafe-avatar-sm">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                        <div><p className="cafe-um-name">{user.firstName} {user.lastName}</p><p className="cafe-um-role">{user.role}</p></div>
                    </div>
                </div>
            </aside>

            <div className="cafe-main-wrap">
                <header className="cafe-topnav">
                    <div className="cafe-topnav-left">
                        <div className="cafe-search-box">
                            <span>🔍</span>
                            <input placeholder="Search items or category…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div className="cafe-topnav-right">
                        <button className="cafe-btn-download" onClick={() => { setEditingItem(null); setFormData({ name: '', description: '', price: '', category: 'Normal', available: true, imageUrl: '', isFeatured: false }); setShowModal(true); }}>
                            + Add Item
                        </button>
                        <button className="cafe-btn-download" style={{ fontSize: '.75rem', padding: '7px 14px', background: 'linear-gradient(135deg,#ef4444,#b91c1c)' }}
                            onClick={() => { localStorage.clear(); navigate('/login'); }}>🚪 Sign Out</button>
                    </div>
                </header>

                <main className="cafe-content">
                    <div className="cafe-hero-banner" style={{ background: `linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6)), url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2070&auto=format&fit=crop') center/cover`, borderRadius: 24, padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, border: '1px solid var(--border)', boxShadow: '0 12px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, #f97316 0%, transparent 40%)', opacity: 0.15, pointerEvents: 'none' }} />
                        <div style={{ zIndex: 1 }}>
                            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.4rem', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>Menu Manager</h1>
                            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', margin: 0, maxWidth: 450, lineHeight: 1.5 }}>Curate your digital menu, manage pricing, and highlight signature culinary dishes.</p>
                            <div style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', padding: '6px 14px', borderRadius: 12, fontSize: '.85rem', fontWeight: 700, backdropFilter: 'blur(8px)', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
                                🍽️ {filtered.length} items curated
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, zIndex: 1 }}>
                            {['All', 'Available', 'Sold Out', 'Featured'].map(f => (
                                <button key={f} className="cafe-btn-secondary" style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>{f}</button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="cafe-loading" style={{ height: 300 }}><div className="cafe-spinner" /></div>
                    ) : (
                        <div className="cafe-table-card" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
                            <table className="cafe-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: '38%', textAlign: 'left' }}>Item</th>
                                        <th style={{ width: '14%', textAlign: 'center' }}>Category</th>
                                        <th style={{ width: '12%', textAlign: 'center' }}>Price</th>
                                        <th style={{ width: '14%', textAlign: 'center' }}>Status</th>
                                        <th style={{ width: '22%', textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(item => (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--cafe-border)', flexShrink: 0 }}
                                                            onError={e => { e.target.style.display = 'none'; }} />
                                                    ) : (
                                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0, border: '1px solid var(--cafe-border)' }}>🍽️</div>
                                                    )}
                                                    <div style={{ overflow: 'hidden' }}>
                                                        <p className="cafe-cell-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name} {item.isFeatured && <span className="cafe-badge orange" style={{ fontSize: '.62rem', padding: '2px 6px', marginLeft: 6 }}>★ Featured</span>}</p>
                                                        <p className="cafe-cell-email" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}><span className="cafe-role-chip">{item.category}</span></td>
                                            <td className="cafe-td-amount" style={{ fontSize: '1rem', fontWeight: 800, textAlign: 'center' }}>₹{item.price}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span className={item.available !== false ? 'cafe-badge green' : 'cafe-badge red'}>
                                                    {item.available !== false ? 'Available' : 'Sold Out'}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                    <button className="cafe-btn-sm" onClick={() => openEditModal(item)}>✏️ Edit</button>
                                                    <button className="cafe-btn-sm" style={{ color: 'var(--cafe-accent)' }} onClick={() => handleDelete(item.id)}>🗑️</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--cafe-text-3)', fontStyle: 'italic', fontSize: '1rem' }}>No items in the menu. Add your first item!</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {showModal && createPortal(
                        <div className="cafe-modal-overlay" onClick={() => setShowModal(false)}>
                            <div className="cafe-modal-card cafe-modal-card-form" onClick={e => e.stopPropagation()}>
                                <div className="cafe-modal-form-header">
                                    <h2>🍽️ {editingItem ? 'Edit' : 'Add'} Menu Item</h2>
                                    <button className="cafe-modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
                                </div>
                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label className="cafe-modal-label">Item Name *</label>
                                            <input className="cafe-modal-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Velvet Latte" required />
                                        </div>
                                        <div>
                                            <label className="cafe-modal-label">Category</label>
                                            <select className="cafe-modal-input" name="category" value={formData.category} onChange={handleInputChange}>
                                                {['Normal', 'Beverages', 'Coffee', 'Tea', 'Snacks', 'Meals', 'Desserts', 'Special Reserved'].map(o => <option key={o}>{o}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="cafe-modal-label">Description *</label>
                                        <textarea className="cafe-modal-input" style={{ resize: 'none' }} name="description" value={formData.description} onChange={handleInputChange} rows={2} placeholder="Brief description of the item…" required />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label className="cafe-modal-label">Price (₹) *</label>
                                            <input className="cafe-modal-input" type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} required />
                                        </div>
                                        <div>
                                            <label className="cafe-modal-label">Image URL</label>
                                            <input className="cafe-modal-input" type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://…" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 20 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.83rem', fontWeight: 500, cursor: 'pointer', color: '#cbd5e1' }}>
                                            <input type="checkbox" name="available" checked={formData.available} onChange={handleInputChange} /> Available
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.83rem', fontWeight: 500, cursor: 'pointer', color: '#cbd5e1' }}>
                                            <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} /> Featured
                                        </label>
                                    </div>
                                    <div className="cafe-modal-footer end" style={{ marginTop: 4 }}>
                                        <button type="button" className="cafe-modal-btn secondary sm" onClick={() => setShowModal(false)}>Cancel</button>
                                        <button type="submit" className="cafe-modal-btn primary sm">{editingItem ? 'Update' : 'Add'} Item</button>
                                    </div>
                                </form>
                            </div>
                        </div>,
                        document.body
                    )}
                </main>
            </div>
        </div>
    );
};

export default MenuManager;
