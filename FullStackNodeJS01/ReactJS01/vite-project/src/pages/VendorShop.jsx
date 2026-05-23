import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getMyShopApi, registerShopApi, updateMyShopApi } from '../util/api';
import axios from '../util/axios.customize';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Store, Package, ShoppingBag, Star, DollarSign, Heart } from 'lucide-react';

const MENU = [
    { key: 'shop',     label: 'Shop của tôi',   sub: 'Cập nhật thông tin shop',  icon: Store       },
    { key: 'products', label: 'Sản phẩm',        sub: 'Quản lý sách bán',          icon: Package     },
    { key: 'orders',   label: 'Đơn hàng',        sub: 'Xem & xử lý đơn',           icon: ShoppingBag },
    { key: 'reviews',  label: 'Đánh giá',        sub: 'Phản hồi khách hàng',       icon: Star        },
    { key: 'revenue',  label: 'Doanh thu',       sub: 'Thống kê doanh thu shop',   icon: DollarSign  },
    { key: 'favorites',label: 'Yêu thích',       sub: 'Sản phẩm được lưu',         icon: Heart       },
];

const VendorShop = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [activeKey, setActiveKey] = useState('shop');
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ name: '', description: '', phone: '', address: '' });

    const fetchShop = async () => {
        setLoading(true);
        const res = await getMyShopApi();
        setLoading(false);
        if (res && !res.message) {
            setShop(res);
            setForm({ name: res.name || '', description: res.description || '', phone: res.phone || '', address: res.address || '' });
            return;
        }
        if (res?.message?.includes('Shop')) { setShop(null); return; }
        notification.error({ message: 'Không thể tải shop', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) { navigate('/login'); return; }
            if (auth.user?.role !== 'vendor' && auth.user?.role !== 'user') { navigate('/user/profile'); return; }
            fetchShop();
        }
    }, [auth, appLoading, navigate]);

    const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        const res = shop ? await updateMyShopApi(form) : await registerShopApi(form);
        if (res && !res.message) {
            notification.success({ message: shop ? 'Đã cập nhật shop' : 'Đăng ký shop thành công!' });
            setShop(res);
            if (!shop) {
                const accountRes = await axios.get('/v1/api/account');
                if (accountRes && !accountRes.message) {
                    setAuth({ isAuthenticated: true, user: { id: accountRes.id ?? '', email: accountRes.email ?? '', name: accountRes.name ?? '', role: accountRes.role ?? 'user' } });
                    notification.info({ message: 'Vai trò Vendor đã được cập nhật!' });
                }
            }
            return;
        }
        notification.error({ message: 'Không thể lưu shop', description: res?.message });
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    if (appLoading || !auth.isAuthenticated) return null;

    const activeItem = MENU.find(m => m.key === activeKey);

    /* Redirect các key khác về page tương ứng */
    const renderContent = () => {
        if (activeKey === 'products') { navigate('/vendor/products'); return null; }
        if (activeKey === 'orders')   { navigate('/vendor/orders');   return null; }
        if (activeKey === 'reviews')  { navigate('/vendor/reviews');  return null; }
        if (activeKey === 'revenue')  { navigate('/vendor/revenue');  return null; }
        if (activeKey === 'favorites'){ navigate('/vendor/favorites'); return null; }

        /* Panel shop */
        if (loading) return <div style={{ color: '#9ca3af', padding: 20 }}>Đang tải...</div>;
        return (
            <div style={{ maxWidth: 640 }}>
                {shop && (
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>🏪</span>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{shop.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>
                                Trạng thái:
                                <span style={{ marginLeft: 6, fontWeight: 600, color: shop.isActive ? '#16a34a' : '#dc2626' }}>
                                    {shop.isActive ? '● Đang hoạt động' : '● Tạm khóa'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 24 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 20 }}>
                        {shop ? 'Cập nhật thông tin shop' : 'Đăng ký mở shop'}
                    </h2>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
                        {[
                            { name: 'name', label: 'Tên shop', placeholder: 'Nhập tên shop', required: true },
                            { name: 'phone', label: 'Điện thoại', placeholder: 'Số điện thoại' },
                            { name: 'address', label: 'Địa chỉ', placeholder: 'Địa chỉ shop' },
                        ].map(f => (
                            <div key={f.name}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>{f.label}</label>
                                <input name={f.name} value={form[f.name]} onChange={handleChange}
                                    placeholder={f.placeholder} required={f.required}
                                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', fontSize: 14, outline: 'none' }}
                                    onFocus={e => e.target.style.borderColor = '#f97316'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                            </div>
                        ))}
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Mô tả</label>
                            <textarea name="description" value={form.description} onChange={handleChange}
                                placeholder="Mô tả shop" rows={3}
                                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 12px', fontSize: 14, outline: 'none', resize: 'vertical' }}
                                onFocus={e => e.target.style.borderColor = '#f97316'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                        <button type="submit" style={{
                            background: '#f97316', color: '#fff', border: 'none',
                            borderRadius: 8, padding: '11px 24px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        }}>
                            {shop ? '💾 Cập nhật shop' : '🚀 Đăng ký shop'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey={activeKey}
            setActiveKey={key => { setActiveKey(key); }}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle={activeItem?.label}
            topbarSub={activeItem?.sub}
        >
            {renderContent()}
        </DashboardLayout>
    );
};

export default VendorShop;
