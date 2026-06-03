import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorFavoritesApi } from '../util/api';
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


const VendorFavorites = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [products, setProducts] = useState([]);

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((item) => map.set(item.id, item));
        return map;
    }, [products]);

    const fetchFavorites = async () => {
        setLoading(true);
        const res = await getVendorFavoritesApi();
        setLoading(false);
        if (res && !res.message) {
            setFavorites(res.favorites || []);
            setProducts(res.products || []);
            return;
        }
        if (res?.message && res.message.includes('Shop')) {
            notification.warning({ message: 'Vui lòng đăng ký shop trước.' });
            navigate('/vendor/shop');
            return;
        }
        notification.error({ message: 'Không thể tải thống kê', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) {
                navigate('/login');
                return;
            }
            if (auth.user?.role !== 'vendor') {
                navigate('/user/profile');
                return;
            }
            fetchFavorites();
        }
    }, [auth, appLoading, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    const handleMenuClick = (key) => {
        if (key === 'shop') { navigate('/vendor/shop'); }
        else if (key === 'products') { navigate('/vendor/products'); }
        else if (key === 'orders') { navigate('/vendor/orders'); }
        else if (key === 'reviews') { navigate('/vendor/reviews'); }
        else if (key === 'revenue') { navigate('/vendor/revenue'); }
        else if (key === 'favorites') { navigate('/vendor/favorites'); }
    };

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    const activeItem = MENU.find(m => m.key === 'favorites');

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey="favorites"
            setActiveKey={handleMenuClick}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle={activeItem?.label}
            topbarSub={activeItem?.sub}
        >
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Sản phẩm được yêu thích</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Thống kê lượt yêu thích cho từng sản phẩm</p>
                    </div>
                    <Link to="/vendor/products" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>Sản phẩm</Link>
                </div>

                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</div>
                ) : favorites.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>Chưa có lượt yêu thích.</div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        {['Sản phẩm', 'Lượt yêu thích'].map(h => (
                                            <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {favorites.map((item, i) => {
                                        const prod = productMap.get(item._id);
                                        const prodTitle = prod?.title || item._id;
                                        const prodImg = prod?.images?.[0];
                                        return (
                                            <tr key={item._id} style={{ borderBottom: i < favorites.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 36, height: 48, borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {prodImg ? (
                                                                <img src={prodImg} alt={prodTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <Package style={{ width: 14, height: 14, color: '#9ca3af' }} />
                                                            )}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontWeight: 700, color: '#111', fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 220 }} title={prodTitle}>
                                                                {prodTitle}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                        ❤️ {item.count}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VendorFavorites;
