import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardNew.css';
import CustomerLayout from '../components/CustomerLayout';

const CATEGORY_ICONS = { Normal: '🍽️', NORMAL: '🍽️', Special: '⭐', SPECIAL: '⭐', Beverage: '☕', BEVERAGE: '☕', Snack: '🍕', SNACK: '🍕', Dessert: '🍰', DESSERT: '🍰' };

const CAFE_IMAGES = [
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
];

const FOOD_IMAGES = {
    'Normal': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    'NORMAL': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    'Special': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
    'SPECIAL': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80',
    'Beverage': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
    'BEVERAGE': 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80',
    'Snack': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    'SNACK': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    'Dessert': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80',
    'DESSERT': 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=400&q=80',
    'DEFAULT': 'https://images.unsplash.com/photo-1490818387583-1b0ba689a074?auto=format&fit=crop&w=400&q=80'
};

const CustomerMenu = () => {
    const { cafeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [cafeName, setCafeName] = useState('Café');

    const [user, setUser] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('ALL');
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [hovItem, setHovItem] = useState(null);
    const [serviceType, setServiceType] = useState('DINE_IN');
    const [placing, setPlacing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null); // { orderId, total }
    const [orderError, setOrderError] = useState('');

    const fetchMenu = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch(`/api/menu/cafe/${cafeId}`);
            if (r.ok) setMenuItems(await r.json());
        } catch { }
        finally { setLoading(false); }
    }, [cafeId]);

    const fetchCafeName = useCallback(async () => {
        try {
            const r = await fetch(`/api/auth/user/${cafeId}`);
            if (r.ok) {
                const data = await r.json();
                const name = !data.roleMetadata ? `${data.firstName}'s Café` : data.roleMetadata.split(';')[0].trim();
                setCafeName(name);
            }
        } catch { }
    }, [cafeId]);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        fetchMenu();
        fetchCafeName();
    }, [fetchMenu, fetchCafeName, navigate]);

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    const cats = ['ALL', ...new Set(menuItems.map(i => i.category).filter(Boolean))];
    const filtered = menuItems
        .filter(i => category === 'ALL' || i.category === category)
        .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || (i.description || '').toLowerCase().includes(search.toLowerCase()))
        .filter(i => i.available !== false);

    const addToCart = (item) => {
        setCart(prev => {
            const ex = prev.find(c => c.id === item.id);
            return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }];
        });
        setShowCart(true);
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c).filter(c => c.qty > 0));
    };

    const cartTotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
    const cartCount = cart.reduce((s, c) => s + c.qty, 0);

    const placeOrder = async () => {
        if (cart.length === 0 || placing) return;
        setPlacing(true);
        setOrderError('');
        try {
            const payload = {
                customerId: user.id,
                cafeId: parseInt(cafeId),
                serviceType,
                items: cart.map(c => ({
                    menuItemId: c.id,
                    quantity: c.qty,
                    price: c.price
                }))
            };
            const orderRes = await fetch('/api/orders/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!orderRes.ok) {
                const errText = await orderRes.text();
                setOrderError(errText || 'Order creation failed.');
                setPlacing(false);
                return;
            }
            const dbOrder = await orderRes.json();
            const amountPaise = Math.round(cartTotal * 100);

            const rzpRes = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amountPaise,
                    currency: 'INR',
                    receipt: `order_${dbOrder.id}`,
                    orderId: dbOrder.id
                })
            });
            if (!rzpRes.ok) {
                setOrderError('Payment initialization failed. Please try again.');
                setPlacing(false);
                return;
            }
            const rzpData = await rzpRes.json();

            const options = {
                key: rzpData.keyId,
                amount: rzpData.amount,
                currency: rzpData.currency,
                name: 'Digital Café',
                description: `Order #${dbOrder.id} — ${cafeName}`,
                image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                order_id: rzpData.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                dbOrderId: dbOrder.id
                            })
                        });
                        if (verifyRes.ok) {
                            setOrderSuccess({ orderId: dbOrder.id, total: cartTotal });
                            setCart([]);
                        } else {
                            const err = await verifyRes.text();
                            setOrderError(`Verification failed: ${err}`);
                        }
                    } catch (e) {
                        setOrderError('Connection error during verification.');
                    }
                    setPlacing(false);
                },
                modal: {
                    ondismiss: function () {
                        setOrderError('Payment cancelled. You can retry from the cart.');
                        setPlacing(false);
                    },
                    confirm_close: true
                },
                prefill: {
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    email: user.email || '',
                    contact: user.phone || '',
                    method: 'upi',
                    vpa: 'success@razorpay'
                },
                notes: {
                    db_order_id: dbOrder.id,
                    customer_id: user.id
                },
                theme: {
                    color: '#f97316'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (resp) {
                setOrderError(`Payment failed: ${resp.error.description || 'Unknown error'}`);
                setPlacing(false);
            });
            rzp.open();

        } catch (err) {
            setOrderError('Network error. Please check your connection.');
            setPlacing(false);
        }
    };

    const GRAD_MAP = ['linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#3b82f6,#8b5cf6)', 'linear-gradient(135deg,#10b981,#3b82f6)', 'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#8b5cf6,#ec4899)', 'linear-gradient(135deg,#06b6d4,#3b82f6)'];

    return (
        <CustomerLayout>
            <main className="adn-content" style={{ padding: 0 }}>
                {/* Back Link Overlayed or as a row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <button onClick={() => navigate('/customer/explore')}
                        style={{ border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontSize: '.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                        ← Back to Cafés
                    </button>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => setShowCart(true)}
                            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white', fontWeight: 700, fontSize: '.84rem', cursor: 'pointer' }}>
                            🛒 Cart {cartCount > 0 && `(${cartCount})`}
                        </button>
                    </div>
                </div>

                {/* Café Hero */}
                <div style={{ height: 260, borderRadius: 24, backgroundImage: `url(${CAFE_IMAGES[parseInt(cafeId) % CAFE_IMAGES.length] || CAFE_IMAGES[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: 24, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: '24px 32px', boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.1) 80%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                            <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 900, color: 'white', boxShadow: '0 8px 24px rgba(0,0,0,.2)' }}>
                                {cafeName.charAt(0)}
                            </div>
                            <div>
                                <h1 style={{ margin: '0 0 8px', color: 'white', fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>{cafeName}</h1>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <span style={{ background: 'rgba(255,255,255,.9)', color: '#0f172a', borderRadius: 8, padding: '4px 12px', fontSize: '.75rem', fontWeight: 800 }}>⭐ 4.8 Rating</span>
                                    <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', borderRadius: 8, padding: '4px 12px', fontSize: '.75rem', fontWeight: 800 }}>✅ Free Delivery</span>
                                    <span style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, padding: '4px 12px', fontSize: '.75rem', fontWeight: 700 }}>
                                        {menuItems.filter(i => i.available !== false).length} items
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => navigate('/customer/bookings')}
                            style={{ padding: '12px 24px', borderRadius: 14, border: 'none', background: 'white', color: '#0f172a', fontWeight: 800, fontSize: '.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.15)', transition: 'transform 0.2s' }}>
                            📅 Reserve a Table
                        </button>
                    </div>
                </div>

                {/* Search + Filter */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 12, padding: '10px 16px', border: '1.5px solid var(--border)' }}>
                        <span>🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…"
                            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '.86rem', background: 'transparent', color: 'var(--text)' }} />
                    </div>
                    {/* Category Tabs */}
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                        {cats.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                style={{ padding: '8px 18px', borderRadius: 99, whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '.8rem', fontWeight: 700, transition: 'all .18s', background: category === cat ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'var(--surface)', color: category === cat ? 'white' : 'var(--text-3)', border: `1.5px solid ${category === cat ? 'transparent' : 'var(--border)'}` }}>
                                {CATEGORY_ICONS[cat] || '🍴'} {cat === 'ALL' ? 'All' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <div className="adn-spinner" />
                        <p style={{ marginTop: 14, color: 'var(--text-3)', fontWeight: 600 }}>Loading menu…</p>
                    </div>
                ) : (
                    <div style={{ maxHeight: 'calc(100vh - 380px)', overflowY: 'auto', paddingRight: 4 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
                        {filtered.map(item => {
                            const inCart = cart.find(c => c.id === item.id);
                            const isHov = hovItem === item.id;
                            const grad = GRAD_MAP[item.id % GRAD_MAP.length];
                            return (
                                <div key={item.id}
                                    style={{ background: 'var(--surface)', borderRadius: 16, overflow: 'hidden', transition: 'all .22s', boxShadow: isHov ? '0 12px 40px rgba(0,0,0,.13)' : '0 2px 10px rgba(0,0,0,.07)', transform: isHov ? 'translateY(-4px)' : 'none', border: '1.5px solid var(--border)' }}
                                    onMouseEnter={() => setHovItem(item.id)} onMouseLeave={() => setHovItem(null)}>
                                    <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
                                        <img src={item.imageUrl || FOOD_IMAGES[item.category] || FOOD_IMAGES['DEFAULT']} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} 
                                             className={isHov ? 'adn-zoom' : ''} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', pointerEvents: 'none' }} />
                                    </div>
                                    <div style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <h3 style={{ margin: 0, fontSize: '.9rem', fontWeight: 800 }}>{item.name}</h3>
                                            <span style={{ fontWeight: 800, color: '#f97316', fontSize: '.9rem' }}>₹{item.price}</span>
                                        </div>
                                        <p style={{ margin: '0 0 12px', fontSize: '.75rem', color: 'var(--text-3)', minHeight: 40 }}>{item.description || 'Freshly prepared for you.'}</p>
                                        {!inCart ? (
                                            <button onClick={() => addToCart(item)}
                                                style={{ width: '100%', padding: '9px', border: 'none', borderRadius: 10, background: isHov ? 'linear-gradient(135deg,#f97316,#ef4444)' : '#f8fafc', color: isHov ? 'white' : '#f97316', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', transition: 'all .2s' }}>
                                                + Add to Order
                                            </button>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                                                <button onClick={() => updateQty(item.id, -1)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fed7aa', background: 'white', cursor: 'pointer', color: '#f97316' }}>−</button>
                                                <span style={{ fontWeight: 800 }}>{inCart.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)}
                                                    style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#f97316,#ef4444)', cursor: 'pointer', color: 'white' }}>+</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    </div>
                )}
            </main>

            {/* Cart Slide Panel */}
            {showCart && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 340, background: 'var(--surface)', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', zIndex: 99999, display: 'flex', flexDirection: 'column', animation: 'slideIn .25s ease' }}>
                    <div style={{ padding: '18px 20px', borderBottom: '1.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800 }}>🛒 Your Order</h3>
                            <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-3)' }}>{cafeName}</p>
                        </div>
                        <button onClick={() => { setShowCart(false); setOrderSuccess(null); }} style={{ border: 'none', background: 'var(--bg)', color: 'var(--text)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>✕</button>
                    </div>

                    {/* Success Modal Overlay */}
                    {orderSuccess && createPortal(
                        <div className="cafe-modal-overlay" onClick={() => { setOrderSuccess(null); setShowCart(false); }}>
                            <div className="cafe-modal-card" onClick={e => e.stopPropagation()}>
                                <div className="cafe-modal-icon green">
                                    🍕
                                </div>
                                <h2 className="cafe-modal-title">Order Received!</h2>
                                <p className="cafe-modal-body" style={{ margin: '0 0 10px' }}>
                                    Order <strong>#{orderSuccess.orderId}</strong>
                                </p>
                                <p className="cafe-modal-body">
                                    Your delicious food is being prepared. You can track its status in the "My Orders" section.
                                </p>
                                <div className="cafe-modal-footer">
                                    <button onClick={() => { setOrderSuccess(null); setShowCart(false); navigate('/customer/orders'); }} className="cafe-modal-btn primary">
                                        View My Orders
                                    </button>
                                    <button onClick={() => { setOrderSuccess(null); setShowCart(false); }} className="cafe-modal-btn secondary">
                                        Done
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                    {!orderSuccess && (
                        <>
                            {/* Service type toggle */}
                            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                                {[['DINE_IN', '🍽️ Dine In'], ['TAKEAWAY', '🥡 Takeaway']].map(([val, label]) => (
                                    <button key={val} onClick={() => setServiceType(val)}
                                        style={{ flex: 1, padding: '8px', borderRadius: 10, border: `1.5px solid ${serviceType === val ? '#f97316' : 'var(--border)'}`, background: serviceType === val ? 'var(--orange-soft)' : 'var(--surface)', color: serviceType === val ? '#f97316' : 'var(--text-3)', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', transition: 'all .15s' }}>
                                        {label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                                {cart.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'var(--text-3)', marginTop: 40 }}>Your cart is empty.</p>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: '.84rem' }}>{item.name}</p>
                                                <p style={{ margin: 0, fontSize: '.74rem', color: 'var(--text-3)' }}>₹{item.price} × {item.qty}</p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <button onClick={() => updateQty(item.id, -1)} style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>−</button>
                                                <span style={{ fontWeight: 800, fontSize: '.8rem' }}>{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, 1)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#f97316', color: 'white' }}>+</button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {cart.length > 0 && (
                                <div style={{ padding: '20px', borderTop: '1.5px solid var(--border)' }}>
                                    {orderError && (
                                        <div style={{ background: '#fee2e2', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: '.76rem', color: '#b91c1c', fontWeight: 600 }}>
                                            ⚠️ {orderError}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontWeight: 800 }}>
                                        <span>Total</span>
                                        <span style={{ color: '#f97316' }}>₹{cartTotal.toFixed(0)}</span>
                                    </div>
                                    <button onClick={placeOrder} disabled={placing}
                                        style={{ width: '100%', padding: '14px', border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#f97316,#ef4444)', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: placing ? 0.7 : 1 }}>
                                        {placing ? '⏳ Processing Payment…' : '💳 Pay & Place Order →'}
                                    </button>
                                    
                                    {/* EMERGENCY DEMO BYPASS */}
                                    <div style={{ textAlign: 'center', marginTop: 12 }}>
                                        <button onClick={async () => {
                                            if (placing) return;
                                            setPlacing(true);
                                            try {
                                                // 1. Create the DB Order first
                                                const payload = {
                                                    customerId: user.id,
                                                    cafeId: parseInt(cafeId),
                                                    serviceType,
                                                    items: cart.map(c => ({ menuItemId: c.id, quantity: c.qty, price: c.price }))
                                                };
                                                const orderRes = await fetch('/api/orders/place', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(payload)
                                                });
                                                const dbOrder = await orderRes.json();
                                                
                                                // 2. Directly call our success state (Demo Only)
                                                setOrderSuccess({ orderId: dbOrder.id, total: cartTotal });
                                                setCart([]);
                                                
                                                // 3. Removed automatic completion to allow manual Cafe Owner confirmation
                                            } catch (e) {
                                                setOrderError("Demo bypass failed. Please check network.");
                                            }
                                            setPlacing(false);
                                        }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '.7rem', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6 }}>
                                            Demo Success (Skip Razorpay)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </CustomerLayout>
    );
};

export default CustomerMenu;
