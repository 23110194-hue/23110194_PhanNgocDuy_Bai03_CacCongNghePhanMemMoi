import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ShoppingBag, Heart, User, Home } from 'lucide-react';

const MENU = [
    { key: 'profile',   label: 'Hồ sơ của tôi',  sub: 'Thông tin tài khoản',    icon: User        },
    { key: 'orders',    label: 'Đơn hàng',         sub: 'Xem lịch sử mua hàng',  icon: ShoppingBag },
    { key: 'favorites', label: 'Yêu thích',         sub: 'Sách đã lưu',            icon: Heart       },
];

const UserProfile = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);

    useEffect(() => {
        if (!appLoading && !auth.isAuthenticated) navigate('/login');
    }, [auth, appLoading, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    if (appLoading || !auth.isAuthenticated) return null;

    const handleMenuClick = (key) => {
        if (key === 'orders')    { navigate('/orders');    return; }
        if (key === 'favorites') { navigate('/favorites'); return; }
    };

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey="profile"
            setActiveKey={handleMenuClick}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle="Hồ sơ của tôi"
            topbarSub="Thông tin tài khoản"
        >
            <div style={{ maxWidth: 520 }}>
                {/* Profile card */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
                    {/* Header gradient */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16
                    }}>
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)',
                            color: '#fff', fontWeight: 700, fontSize: 22,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {(auth.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{auth.user?.name || 'Người dùng'}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>{auth.user?.email}</div>
                        </div>
                    </div>

                    {/* Info rows */}
                    <div style={{ padding: '0 24px' }}>
                        {[
                            { label: 'Email',   value: auth.user?.email },
                            { label: 'Tên',     value: auth.user?.name || '—' },
                            { label: 'Vai trò', value: auth.user?.role || 'user', isTag: true },
                        ].map((row, i) => (
                            <div key={row.label} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '14px 0',
                                borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none',
                            }}>
                                <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>{row.label}</span>
                                {row.isTag ? (
                                    <span style={{
                                        fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20,
                                        background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa',
                                    }}>{row.value}</span>
                                ) : (
                                    <span style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{row.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick links */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Link to="/orders" style={{
                        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'border-color 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag style={{ width: 18, height: 18, color: '#f97316' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Đơn hàng</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Lịch sử mua</div>
                        </div>
                    </Link>
                    <Link to="/favorites" style={{
                        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'border-color 0.15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#f97316'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart style={{ width: 18, height: 18, color: '#f97316' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Yêu thích</div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Sách đã lưu</div>
                        </div>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;
