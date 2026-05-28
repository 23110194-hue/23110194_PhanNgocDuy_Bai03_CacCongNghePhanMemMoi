import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import DashboardLayout from '../components/layout/DashboardLayout';
import { ShoppingBag, Heart, User, Edit2, Save, X } from 'lucide-react';
import { notification } from 'antd';
import { updateProfileApi } from '../util/api';

const FULL_MENU = [
    { key: 'profile',   label: 'Hồ sơ của tôi',  sub: 'Thông tin tài khoản',    icon: User        },
    { key: 'orders',    label: 'Đơn hàng',         sub: 'Xem lịch sử mua hàng',  icon: ShoppingBag },
    { key: 'favorites', label: 'Yêu thích',         sub: 'Sách đã lưu',            icon: Heart       },
];

const UserProfile = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!appLoading && !auth.isAuthenticated) {
            navigate('/login');
        } else if (auth.isAuthenticated) {
            setEditName(auth.user?.name || '');
        }
    }, [auth, appLoading, navigate]);

    const isUserRole = auth.user?.role === 'user';
    const menuItems = isUserRole ? FULL_MENU : FULL_MENU.filter(m => m.key === 'profile');

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) {
            notification.warning({ message: 'Tên không được để trống' });
            return;
        }
        setLoading(true);
        const res = await updateProfileApi({ name: editName });
        setLoading(false);
        if (res && !res.message) {
            setAuth(prev => ({ ...prev, user: { ...prev.user, name: editName } }));
            setIsEditing(false);
            notification.success({ message: 'Cập nhật hồ sơ thành công' });
        } else {
            notification.error({ message: 'Cập nhật thất bại', description: res?.message });
        }
    };

    if (appLoading || !auth.isAuthenticated) return null;

    const handleMenuClick = (key) => {
        if (key === 'orders')    { navigate('/orders');    return; }
        if (key === 'favorites') { navigate('/favorites'); return; }
    };

    return (
        <DashboardLayout
            menuItems={menuItems}
            activeKey="profile"
            setActiveKey={handleMenuClick}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle="Hồ sơ cá nhân"
            topbarSub="Quản lý thông tin tài khoản của bạn"
        >
            <div style={{ maxWidth: 520 }}>
                {/* Profile card */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
                    {/* Header gradient */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative'
                    }}>
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} style={{
                                position: 'absolute', top: 16, right: 16,
                                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                                padding: '6px 12px', color: '#fff', fontSize: 12, fontWeight: 600,
                                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', transition: 'background 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                               onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
                                <Edit2 style={{ width: 14, height: 14 }} /> Sửa
                            </button>
                        ) : (
                            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 8 }}>
                                <button onClick={() => { setIsEditing(false); setEditName(auth.user?.name || ''); }} style={{
                                    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                                    padding: '6px 12px', color: '#fff', fontSize: 12, fontWeight: 600,
                                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                                }}>
                                    <X style={{ width: 14, height: 14 }} /> Hủy
                                </button>
                                <button onClick={handleSaveProfile} disabled={loading} style={{
                                    background: '#fff', border: 'none', borderRadius: 8,
                                    padding: '6px 12px', color: '#ea580c', fontSize: 12, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: 6, cursor: loading ? 'not-allowed' : 'pointer'
                                }}>
                                    <Save style={{ width: 14, height: 14 }} /> {loading ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        )}

                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.5)',
                            color: '#fff', fontWeight: 700, fontSize: 22,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                            {(auth.user?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={e => setEditName(e.target.value)}
                                    style={{
                                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.4)',
                                        color: '#fff', fontSize: 16, fontWeight: 700, padding: '4px 12px',
                                        borderRadius: 6, outline: 'none', width: '100%', maxWidth: 250, marginBottom: 4
                                    }}
                                    autoFocus
                                />
                            ) : (
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{auth.user?.name || 'Người dùng'}</div>
                            )}
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
                {isUserRole && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Link to="/orders" style={{
                            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                            transition: 'border-color 0.15s',
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShoppingBag style={{ width: 18, height: 18, color: '#3b82f6' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Đơn hàng</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Lịch sử mua hàng</div>
                            </div>
                        </Link>
                        <Link to="/favorites" style={{
                            background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px',
                            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
                            transition: 'border-color 0.15s',
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Heart style={{ width: 18, height: 18, color: '#ef4444' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Yêu thích</div>
                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Sách đã lưu</div>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserProfile;
