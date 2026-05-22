import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardNew.css';
import CustomerLayout from '../components/CustomerLayout';

const CustomerBookings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [cafes, setCafes] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeView, setActiveView] = useState('new'); // 'new' | 'history'
    const [bookingType, setBookingType] = useState('TABLE');
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [form, setForm] = useState({
        cafeId: '', cafeName: '', bookingDate: '', bookingTime: '',
        guestCount: 2, specialRequests: '',
        // Birthday
        celebrantName: '', birthdayTheme: '',
        // Function
        eventName: '', eventType: ''
    });

    const BOOKING_TYPES = [
        { id: 'TABLE', icon: '🍽️', label: 'Table Booking', desc: 'Reserve a table for dining', color: '#3b82f6', grad: 'linear-gradient(135deg,#3b82f6,#8b5cf6)' },
        { id: 'BIRTHDAY', icon: '🎂', label: 'Birthday Hall', desc: 'Celebrate a birthday in style', color: '#f97316', grad: 'linear-gradient(135deg,#f97316,#ef4444)' },
        { id: 'FUNCTION', icon: '🎊', label: 'Function Hall', desc: 'Corporate events & gatherings', color: '#10b981', grad: 'linear-gradient(135deg,#10b981,#06b6d4)' },
    ];

    const eventTypes = ['Corporate Meeting', 'Team Outing', 'Anniversary', 'Reception', 'Wedding Reception', 'Graduation Party', 'Alumni Meet', 'Product Launch', 'Workshop', 'Other'];
    const themes = ['Floral', 'Rustic', 'Tropical', 'Galaxy', 'Royal', 'Pastel', 'Vintage', 'Modern', 'Fairy-tale', 'Custom'];
    const timeSlots = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('user'));
        if (!stored) { navigate('/login'); return; }
        setUser(stored);
        fetch('/api/auth/cafes').then(r => r.ok ? r.json() : []).then(setCafes).catch(() => { });
        fetchBookings(stored.id);
    }, [navigate]);

    const fetchBookings = async (uid) => {
        try {
            const r = await fetch(`/api/bookings/user/${uid}`);
            if (r.ok) setBookings(await r.json());
        } catch { }
    };

    if (!user) return <div className="adn-loading"><div className="adn-spinner" /></div>;

    const getCafeName = (meta, first) => !meta ? `${first}'s Café` : meta.split(';')[0].trim();

    const handleForm = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleCafeSelect = (id) => {
        const cafe = cafes.find(c => c.id === parseInt(id));
        setForm(p => ({ ...p, cafeId: id, cafeName: cafe ? getCafeName(cafe.roleMetadata, cafe.firstName) : '' }));
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                userId: user.id,
                cafeId: parseInt(form.cafeId),
                cafeName: form.cafeName,
                bookingType,
                bookingDate: form.bookingDate,
                bookingTime: form.bookingTime + ':00',
                guestCount: parseInt(form.guestCount),
                specialRequests: form.specialRequests,
                celebrantName: form.celebrantName,
                birthdayTheme: form.birthdayTheme,
                eventName: form.eventName,
                eventType: form.eventType,
            };
            const r = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (r.ok) {
                setSuccessMsg(`✅ ${bookingType === 'TABLE' ? 'Table' : bookingType === 'BIRTHDAY' ? 'Birthday Hall' : 'Function Hall'} booked successfully! You'll be notified once it's confirmed.`);
                setStep(1);
                setForm({ cafeId: '', cafeName: '', bookingDate: '', bookingTime: '', guestCount: 2, specialRequests: '', celebrantName: '', birthdayTheme: '', eventName: '', eventType: '' });
                fetchBookings(user.id);
                setTimeout(() => setSuccessMsg(''), 5000);
            }
        } catch { }
        finally { setSubmitting(false); }
    };

    const today = new Date().toISOString().split('T')[0];
    const cfg = BOOKING_TYPES.find(b => b.id === bookingType);

    const STATUS_STYLE = {
        PENDING: { bg: '#fef3c7', color: '#b45309', label: 'Pending' },
        CONFIRMED: { bg: '#dcfce7', color: '#15803d', label: '✓ Confirmed' },
        CANCELLED: { bg: '#fee2e2', color: '#b91c1c', label: 'Cancelled' },
    };

    return (
        <CustomerLayout>
            <main className="adn-content" style={{ padding: 0 }}>
                {/* Hero */}
                <div style={{ 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    borderRadius: 20, padding: '40px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' 
                }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.6) 100%)' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h1 style={{ margin: '0 0 8px', color: 'white', fontSize: '2.2rem', fontWeight: 900, textShadow: '0 2px 4px rgba(0,0,0,0.3)', letterSpacing: '-0.5px' }}>📅 Reserve a Table</h1>
                        <p style={{ margin: '0 auto 24px', color: 'rgba(255,255,255,.9)', fontSize: '.95rem', maxWidth: 600, lineHeight: 1.5, fontWeight: 500 }}>Book a table, birthday hall, or function hall at your favourite café with just a few clicks.</p>
                    </div>
                    {/* View toggle */}
                    <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                        {[['new', '+ New Booking'], ['history', '📋 My Bookings']].map(([v, label]) => (
                            <button key={v} onClick={() => setActiveView(v)}
                                style={{ padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: '.86rem', cursor: 'pointer', border: 'none', transition: 'all .3s cubic-bezier(0.4, 0, 0.2, 1)', background: activeView === v ? 'white' : 'rgba(255,255,255,.2)', color: activeView === v ? '#3b82f6' : 'white', boxShadow: activeView === v ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {successMsg && createPortal(
                    <div className="cafe-modal-overlay" onClick={() => setSuccessMsg('')}>
                        <div className="cafe-modal-card" onClick={e => e.stopPropagation()}>
                            <div className="cafe-modal-icon green">
                                🎉
                            </div>
                            <h2 className="cafe-modal-title">Booking Confirmed!</h2>
                            <p className="cafe-modal-body">
                                {successMsg}
                            </p>
                            <div className="cafe-modal-footer">
                                <button onClick={() => { setSuccessMsg(''); setActiveView('history'); }} className="cafe-modal-btn primary-blue">
                                    View My Bookings
                                </button>
                                <button onClick={() => setSuccessMsg('')} className="cafe-modal-btn secondary">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* ── NEW BOOKING FLOW ── */}
                {activeView === 'new' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'start' }}>

                        {/* Left: Booking Type Selector */}
                        <div>
                            <h3 style={{ margin: '0 0 14px', fontWeight: 800, color: 'var(--text)' }}>Choose Booking Type</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                {BOOKING_TYPES.map(bt => (
                                    <div key={bt.id} onClick={() => { setBookingType(bt.id); setStep(1); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 16, border: `2px solid ${bookingType === bt.id ? bt.color : 'transparent'}`, background: bookingType === bt.id ? bt.color + '15' : 'var(--surface)', cursor: 'pointer', transition: 'all .22s', boxShadow: bookingType === bt.id ? `0 6px 20px ${bt.color}22` : '0 2px 10px rgba(0,0,0,.05)' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: bt.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                                            {bt.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 2px', fontWeight: 800, fontSize: '.9rem', color: bookingType === bt.id ? bt.color : 'var(--text)' }}>{bt.label}</p>
                                            <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--text-3)' }}>{bt.desc}</p>
                                        </div>
                                        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${bookingType === bt.id ? bt.color : 'var(--border)'}`, background: bookingType === bt.id ? bt.color : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {bookingType === bt.id && <span style={{ color: 'white', fontSize: '.6rem' }}>✓</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Step indicators */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {[1, 2, 3].map(s => (
                                    <React.Fragment key={s}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= s ? cfg.color : 'var(--border)', color: step >= s ? 'white' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800, transition: 'all .2s' }}>{s}</div>
                                        {s < 3 && <div style={{ flex: 1, height: 2, background: step > s ? cfg.color : 'var(--border)', borderRadius: 99, transition: 'background .3s' }} />}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '.69rem', color: 'var(--text-3)', fontWeight: 600 }}>
                                <span>Select Café</span><span>Date & Time</span><span>Details</span>
                            </div>
                        </div>

                        {/* Right: Form Steps */}
                        <div className="adn-chart-card" style={{ padding: '28px 32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: cfg.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{cfg.icon}</div>
                                <div><h3 style={{ margin: 0, fontWeight: 800, fontSize: '.95rem' }}>{cfg.label}</h3><p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>Step {step} of 3</p></div>
                            </div>

                            {/* Step 1: Café */}
                            {step === 1 && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '.84rem' }}>Select Café *</label>
                                    <select name="cafeId" value={form.cafeId} onChange={e => handleCafeSelect(e.target.value)}
                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: '.86rem', marginBottom: 16, background: 'var(--surface)', color: 'var(--text)', cursor: 'pointer' }}>
                                        <option value="">-- Choose a café --</option>
                                        {cafes.map(c => <option key={c.id} value={c.id}>{getCafeName(c.roleMetadata, c.firstName)} · {c.city}</option>)}
                                    </select>

                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '.84rem' }}>Number of Guests *</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                                        <button onClick={() => setForm(p => ({ ...p, guestCount: Math.max(1, p.guestCount - 1) }))}
                                            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>−</button>
                                        <span style={{ fontWeight: 800, fontSize: '1.2rem', minWidth: 30, textAlign: 'center' }}>{form.guestCount}</span>
                                        <button onClick={() => setForm(p => ({ ...p, guestCount: Math.min(200, p.guestCount + 1) }))}
                                            style={{ width: 36, height: 36, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}>+</button>
                                        <span style={{ fontSize: '.76rem', color: 'var(--text-3)' }}>guests</span>
                                    </div>

                                    <button onClick={() => form.cafeId ? setStep(2) : null}
                                        style={{ width: '100%', padding: '12px', border: 'none', borderRadius: 12, background: form.cafeId ? cfg.grad : 'var(--border)', color: 'white', fontWeight: 700, cursor: form.cafeId ? 'pointer' : 'not-allowed', fontSize: '.88rem', transition: 'all .2s' }}>
                                        Continue →
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Date & Time */}
                            {step === 2 && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '.84rem' }}>Select Date *</label>
                                    <input type="date" name="bookingDate" value={form.bookingDate} min={today} onChange={handleForm}
                                        style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontSize: '.86rem', marginBottom: 16, boxSizing: 'border-box' }} />

                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '.84rem' }}>Select Time Slot *</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 }}>
                                        {timeSlots.map(t => (
                                            <button key={t} onClick={() => setForm(p => ({ ...p, bookingTime: t }))}
                                                style={{ padding: '9px 6px', borderRadius: 10, border: `1.5px solid ${form.bookingTime === t ? cfg.color : 'var(--border)'}`, background: form.bookingTime === t ? cfg.color + '12' : 'var(--bg)', color: form.bookingTime === t ? cfg.color : 'var(--text)', fontWeight: 700, fontSize: '.75rem', cursor: 'pointer', transition: 'all .15s' }}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={() => setStep(1)} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>← Back</button>
                                        <button onClick={() => form.bookingDate && form.bookingTime ? setStep(3) : null}
                                            style={{ flex: 2, padding: '11px', border: 'none', borderRadius: 12, background: form.bookingDate && form.bookingTime ? cfg.grad : 'var(--border)', color: 'white', fontWeight: 700, cursor: form.bookingDate && form.bookingTime ? 'pointer' : 'not-allowed', fontSize: '.84rem' }}>
                                            Continue →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Type-specific details */}
                            {step === 3 && (
                                <div>
                                    {/* Summary */}
                                    <div style={{ background: cfg.color + '08', border: `1.5px solid ${cfg.color}30`, borderRadius: 12, padding: '12px 14px', marginBottom: 16 }}>
                                        <p style={{ margin: '0 0 4px', fontWeight: 800, fontSize: '.84rem', color: cfg.color }}>{form.cafeName}</p>
                                        <p style={{ margin: 0, fontSize: '.76rem', color: 'var(--text-3)' }}>📅 {form.bookingDate} · 🕐 {form.bookingTime} · 👥 {form.guestCount} guests</p>
                                    </div>

                                    {bookingType === 'BIRTHDAY' && (
                                        <>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.82rem' }}>Celebrant's Name *</label>
                                            <input name="celebrantName" value={form.celebrantName} onChange={handleForm} placeholder="e.g. Priya Sharma"
                                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 10, fontSize: '.84rem', marginBottom: 12, boxSizing: 'border-box' }} />
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.82rem' }}>Birthday Theme</label>
                                            <select name="birthdayTheme" value={form.birthdayTheme} onChange={handleForm}
                                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 10, fontSize: '.84rem', marginBottom: 12 }}>
                                                <option value="">-- Select theme --</option>
                                                {themes.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </>
                                    )}

                                    {bookingType === 'FUNCTION' && (
                                        <>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.82rem' }}>Event Name *</label>
                                            <input name="eventName" value={form.eventName} onChange={handleForm} placeholder="e.g. Annual Team Outing"
                                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 10, fontSize: '.84rem', marginBottom: 12, boxSizing: 'border-box' }} />
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.82rem' }}>Event Type</label>
                                            <select name="eventType" value={form.eventType} onChange={handleForm}
                                                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 10, fontSize: '.84rem', marginBottom: 12 }}>
                                                <option value="">-- Select type --</option>
                                                {eventTypes.map(t => <option key={t}>{t}</option>)}
                                            </select>
                                        </>
                                    )}

                                    <label style={{ display: 'block', marginBottom: 6, fontWeight: 700, fontSize: '.82rem' }}>Special Requests</label>
                                    <textarea name="specialRequests" value={form.specialRequests} onChange={handleForm}
                                        placeholder="Dietary restrictions, decoration preferences, seating arrangement…"
                                        rows={3} style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', borderRadius: 10, fontSize: '.82rem', marginBottom: 14, resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />

                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={() => setStep(2)} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--border)', borderRadius: 12, background: 'var(--surface)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem' }}>← Back</button>
                                        <button onClick={handleSubmit} disabled={submitting}
                                            style={{ flex: 2, padding: '11px', border: 'none', borderRadius: 12, background: cfg.grad, color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '.84rem', opacity: submitting ? 0.7 : 1 }}>
                                            {submitting ? 'Booking…' : `Confirm ${cfg.label} 🎉`}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── BOOKING HISTORY ── */}
                {activeView === 'history' && (
                    <div>
                        <h3 style={{ margin: '0 0 20px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ width: 4, height: 24, background: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)', borderRadius: 4 }} />
                            My Bookings ({bookings.length})
                        </h3>
                        {bookings.length === 0 ? (
                            <div className="adn-chart-card" style={{ textAlign: 'center', padding: 60 }}>
                                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📅</div>
                                <h3 style={{ margin: '0 0 8px', color: 'var(--text)' }}>No bookings yet</h3>
                                <p style={{ color: 'var(--text-3)', margin: '0 0 16px' }}>Reserve your first table or hall</p>
                                <button onClick={() => setActiveView('new')} className="adn-btn-download">Make a Booking</button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {bookings.map(b => {
                                    const btype = BOOKING_TYPES.find(t => t.id === b.bookingType) || BOOKING_TYPES[0];
                                    const ss = STATUS_STYLE[b.status] || STATUS_STYLE.PENDING;
                                    return (
                                        <div key={b.id} className="adn-chart-card" style={{ padding: '18px 20px', display: 'flex', gap: 16, alignItems: 'center', borderLeft: `5px solid ${btype.color}` }}>
                                            <div style={{ width: 52, height: 52, borderRadius: 14, background: btype.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0 }}>{btype.icon}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontWeight: 800, fontSize: '.95rem', color: btype.color }}>{btype.label}</span>
                                                        <span style={{ background: ss.bg, color: ss.color, borderRadius: 99, padding: '2px 12px', fontSize: '.72rem', fontWeight: 700, border: `1px solid ${ss.color}20` }}>{ss.label}</span>
                                                    </div>
                                                    <span style={{ fontSize: '.73rem', color: 'var(--text-3)' }}>#{b.id}</span>
                                                </div>
                                                <p style={{ margin: '0 0 2px', fontWeight: 600, fontSize: '.82rem' }}>{b.cafeName}</p>
                                                <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)' }}>📅 {b.bookingDate} · 🕐 {String(b.bookingTime).substring(0, 5)} · 👥 {b.guestCount} guests
                                                    {b.celebrantName ? ` · 🎂 ${b.celebrantName}` : ''}
                                                    {b.eventName ? ` · 🎊 ${b.eventName}` : ''}
                                                </p>
                                            </div>
                                            {b.status === 'PENDING' && (
                                                <button onClick={async () => {
                                                    await fetch(`/api/bookings/${b.id}/cancel?userId=${user.id}`, { method: 'PUT' });
                                                    fetchBookings(user.id);
                                                }} style={{ padding: '7px 14px', border: '1.5px solid #fee2e2', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontWeight: 700, fontSize: '.74rem', cursor: 'pointer', flexShrink: 0 }}>
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </CustomerLayout>
    );
};

export default CustomerBookings;
