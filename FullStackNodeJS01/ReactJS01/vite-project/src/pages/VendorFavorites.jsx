import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorFavoritesApi } from '../util/api';

const VendorFavorites = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState([]);
    const [products, setProducts] = useState([]);

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((item) => map.set(item.id, item.title));
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

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
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
                                    {favorites.map((item, i) => (
                                        <tr key={item._id} style={{ borderBottom: i < favorites.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <td style={{ padding: '11px 16px', fontWeight: 600, color: '#111' }}>{productMap.get(item._id) || item._id}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}>
                                                    ❤️ {item.count}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorFavorites;
