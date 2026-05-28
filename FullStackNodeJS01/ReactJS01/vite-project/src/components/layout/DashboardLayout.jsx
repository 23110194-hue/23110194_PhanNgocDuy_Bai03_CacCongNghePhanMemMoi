/**
 * DashboardLayout — sidebar trái + content phải
 * Dùng chung cho Admin, Manager, Vendor, User
 *
 * Props:
 *  - menuItems: [{ key, label, sub, icon, path? }]
 *  - activeKey / setActiveKey: controlled active menu
 *  - user: { name, email, role }
 *  - onLogout: fn
 *  - roleBadge: string hiển thị dưới tên (vd "Administrator")
 *  - badgeColor: object style cho badge
 *  - children: content bên phải
 *  - topbarTitle / topbarSub: title + sub của header phải
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LogOut, ChevronRight } from 'lucide-react';

const ROLE_BADGE = {
    admin:   { label: '👑 Administrator', bg: '#fff7ed', border: '#fed7aa', color: '#f97316' },
    manager: { label: '🛡️ Manager',       bg: '#eff6ff', border: '#bfdbfe', color: '#3b82f6' },
    vendor:  { label: '🏪 Vendor',         bg: '#f0fdf4', border: '#bbf7d0', color: '#16a34a' },
    user:    { label: '👤 Thành viên',     bg: '#faf5ff', border: '#e9d5ff', color: '#7c3aed' },
};

const DashboardLayout = ({
    menuItems = [],
    activeKey,
    setActiveKey,
    user,
    onLogout,
    children,
    topbarTitle,
    topbarSub,
}) => {
    const badge = ROLE_BADGE[user?.role] || ROLE_BADGE.user;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>

            {/* ── SIDEBAR ── */}
            <aside style={{
                width: 220, flexShrink: 0,
                background: '#fff',
                borderRight: '1px solid #e5e7eb',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* User info */}
                <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {(user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.name || 'Người dùng'}
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {user?.email}
                            </div>
                        </div>
                    </div>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: badge.bg, border: `1px solid ${badge.border}`,
                        borderRadius: 20, padding: '3px 10px',
                        fontSize: 11, fontWeight: 600, color: badge.color,
                    }}>
                        {badge.label}
                    </span>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                    <div style={{
                        fontSize: 10, fontWeight: 700, color: '#9ca3af',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                        padding: '0 6px 8px',
                    }}>Menu</div>

                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const active = activeKey === item.key;
                        return (
                            <button
                                key={item.key}
                                onClick={() => setActiveKey && setActiveKey(item.key)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                                    padding: '9px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                    background: active ? '#fff7ed' : 'transparent',
                                    textAlign: 'left', marginBottom: 2,
                                    transition: 'background 0.15s',
                                    borderLeft: active ? '3px solid #f97316' : '3px solid transparent',
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#f9fafb'; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div style={{
                                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                                    background: active ? '#f97316' : '#f3f4f6',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {Icon && <Icon style={{ width: 14, height: 14, color: active ? '#fff' : '#6b7280' }} />}
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#f97316' : '#374151', lineHeight: 1.3 }}>
                                        {item.label}
                                    </div>
                                    {item.sub && (
                                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.sub}
                                        </div>
                                    )}
                                </div>
                                {active && <ChevronRight style={{ width: 12, height: 12, color: '#f97316', flexShrink: 0 }} />}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div style={{ padding: '8px', borderTop: '1px solid #f3f4f6' }}>
                    <Link to="/" style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 8px', borderRadius: 8, fontSize: 13, color: '#6b7280',
                        textDecoration: 'none', marginBottom: 2,
                        transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <Home style={{ width: 14, height: 14 }} /> Xem màn hình khách
                    </Link>
                    <button onClick={onLogout} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 8px', borderRadius: 8, fontSize: 13, color: '#ef4444',
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <LogOut style={{ width: 14, height: 14 }} /> Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Topbar */}
                {(topbarTitle || topbarSub) && (
                    <div style={{
                        background: '#fff', borderBottom: '1px solid #e5e7eb',
                        padding: '13px 24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: '#111' }}>{topbarTitle}</div>
                            {topbarSub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{topbarSub}</div>}
                        </div>
                        <span style={{ fontSize: 11, color: '#9ca3af', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '3px 10px' }}>
                            {badge.label}
                        </span>
                    </div>
                )}

                {/* Content */}
                <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
