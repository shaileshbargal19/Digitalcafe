import React from 'react';

/* ─── Sparkline ───────────────────────────────────────────────────────────── */
export const Sparkline = ({ data, color = '#3b82f6' }) => {
    if (!data || data.length < 2) return null;
    const w = 80, h = 36;
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    const areaId = `sg${color.replace('#', '')}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', display: 'block' }}>
            <defs>
                <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity=".22" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${areaId})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

/* ─── Bar Chart ───────────────────────────────────────────────────────────── */
export const BarChart = ({ data, height = 200 }) => {
    if (!data || data.length === 0) return null;
    const max = Math.max(...data.map(d => d.value));
    const palette = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
    return (
        <div className="adn-barchart" style={{ height }}>
            {data.map((d, i) => (
                <div className="adn-bar-col" key={i}>
                    <div className="adn-bar-track">
                        <div className="adn-bar-fill" style={{ height: `${(d.value / max) * 100}%`, background: `linear-gradient(180deg, ${palette[i % palette.length]}, ${palette[i % palette.length]}cc)` }}>
                            <span className="adn-bar-tip">{d.value}</span>
                        </div>
                    </div>
                    <span className="adn-bar-label">{d.label}</span>
                </div>
            ))}
        </div>
    );
};

/* ─── Donut Chart ─────────────────────────────────────────────────────────── */
export const DonutChart = ({ segments, title = "Revenue", sub = "by cafe" }) => {
    if (!segments || segments.length === 0) return null;
    const r = 58, cx = 72, cy = 72, sw = 20, circ = 2 * Math.PI * r;
    let offset = 0;
    return (
        <svg width="144" height="144" viewBox="0 0 144 144">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
            {segments.map((s, i) => {
                const dash = (s.pct / 100) * circ;
                const el = (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={s.color} strokeWidth={sw}
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={-offset}
                        transform={`rotate(-90 ${cx} ${cy})`}
                        style={{ transition: 'stroke-dasharray .6s ease' }}
                    />
                );
                offset += dash;
                return el;
            })}
            <text x={cx} y={cy - 5} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">{title}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#94a3b8">{sub}</text>
        </svg>
    );
};

/* ─── Line/Area Chart ─────────────────────────────────────────────────────── */
export const LineChart = ({ data, color = '#3b82f6', height = 110 }) => {
    if (!data || data.length < 2) return null;
    const w = 600, h = height;
    const vals = data.map(d => d.value);
    const max = Math.max(...vals), min = Math.min(...vals);
    const y = v => h - ((v - min) / (max - min || 1)) * (h - 24) - 12;
    const pts = data.map((d, i) => `${(i / (data.length - 1)) * w},${y(d.value)}`).join(' ');
    const gid = `lg${color.replace('#', '')}`;
    return (
        <div style={{ width: '100%' }}>
            <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                <defs>
                    <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity=".2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#${gid})`} />
                <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * w;
                    return (
                        <g key={i} className="adn-chart-point">
                            <circle cx={x} cy={y(d.value)} r="4" fill={color} stroke="white" strokeWidth="2" />
                            <title>{d.label}: {d.value}</title>
                        </g>
                    );
                })}
            </svg>
            <div className="adn-line-labels">
                {data.map((d, i) => <span key={i}>{d.label}</span>)}
            </div>
        </div>
    );
};

/* ─── Grouped Bar Chart (Dual Metric) ─────────────────────────────────────── */
export const GroupedBarChart = ({ data1, data2, color1 = '#3b82f6', color2 = '#f97316', height = 200 }) => {
    if (!data1 || !data2 || data1.length === 0) return null;
    const allVals = [...data1.map(d => d.value), ...data2.map(d => d.value)];
    const max = Math.max(...allVals, 1);

    return (
        <div style={{ width: '100%', height, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 20, padding: '0 10px' }}>
                {data1.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', gap: 4 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 4, position: 'relative' }}>
                            {/* Bar 1 */}
                            <div style={{ flex: 1, background: `linear-gradient(0deg, ${color1}, ${color1}cc)`, height: `${(d.value / max) * 100}%`, borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height .3s cubic-bezier(.4, 0, .2, 1)' }}>
                                <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: '.65rem', fontWeight: 700, color: color1 }}>{d.value}</span>
                            </div>
                            {/* Bar 2 */}
                            <div style={{ flex: 1, background: `linear-gradient(0deg, ${color2}, ${color2}cc)`, height: `${(data2[i].value / max) * 100}%`, borderRadius: '4px 4px 0 0', position: 'relative', transition: 'height .3s cubic-bezier(.4, 0, .2, 1)' }}>
                                <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: '.65rem', fontWeight: 700, color: color2 }}>{data2[i].value}</span>
                            </div>
                        </div>
                        <span style={{ fontSize: '.7rem', color: 'var(--text-3)', textAlign: 'center', marginTop: 8, fontWeight: 500 }}>{d.label}</span>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', fontWeight: 600, color: 'var(--text-2)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: color1 }} /> Users
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', fontWeight: 600, color: 'var(--text-2)' }}>
                    <span style={{ width: 12, height: 12, borderRadius: 3, background: color2 }} /> Cafes
                </div>
            </div>
        </div>
    );
};

/* ─── Progress Circle ─────────────────────────────────────────────────────── */
export const ProgressCircle = ({ pct, color = '#3b82f6', size = 60, stroke = 6, label = "" }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg)" strokeWidth={stroke} />
                    <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        style={{ transition: 'stroke-dasharray .8s ease' }}
                    />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800, color: 'var(--text)' }}>
                    <span style={{ display: 'flex', margin: 'auto' }}>{pct}%</span>
                </div>
            </div>
            {label && <span style={{ fontSize: '.68rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>{label}</span>}
        </div>
    );
};
