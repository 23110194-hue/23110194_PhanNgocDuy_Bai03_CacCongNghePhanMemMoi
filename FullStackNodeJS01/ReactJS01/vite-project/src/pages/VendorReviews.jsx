import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorReviewsApi, updateVendorReviewVisibilityApi } from '../util/api';
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


const VendorReviews = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((item) => map.set(item.id, item));
        return map;
    }, [products]);

    const fetchReviews = async () => {
        setLoading(true);
        const res = await getVendorReviewsApi();
        setLoading(false);
        if (res && !res.message) {
            setReviews(res.reviews || []);
            setProducts(res.products || []);
            return;
        }
        if (res?.message && res.message.includes('Shop')) {
            notification.warning({ message: 'Vui lòng đăng ký shop trước.' });
            navigate('/vendor/shop');
            return;
        }
        notification.error({ message: 'Không thể tải đánh giá', description: res?.message });
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
            fetchReviews();
        }
    }, [auth, appLoading, navigate]);

    const handleToggle = async (reviewId, isVisible) => {
        const res = await updateVendorReviewVisibilityApi(reviewId, isVisible);
        if (res && !res.message) {
            notification.success({ message: 'Đã cập nhật đánh giá' });
            setReviews((prev) => prev.map((item) => (item._id === res._id ? res : item)));
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

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

    const activeItem = MENU.find(m => m.key === 'reviews');

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey="reviews"
            setActiveKey={handleMenuClick}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle={activeItem?.label}
            topbarSub={activeItem?.sub}
        >
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Bình luận &amp; đánh giá</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Quản lý đánh giá từ khách hàng</p>
                    </div>
                    <Link to="/vendor/products" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>Sản phẩm</Link>
                </div>

                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</div>
                ) : reviews.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>Chưa có đánh giá nào.</div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        {['Sản phẩm', 'Người dùng', 'Điểm', 'Nội dung', 'Hiển thị'].map(h => (
                                            <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review, i) => {
                                        const prod = productMap.get(review.productId);
                                        const prodTitle = prod?.title || review.productId;
                                        const prodImg = prod?.images?.[0];
                                        return (
                                            <tr key={review._id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                <td style={{ padding: '12px 16px', maxWidth: 280 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 36, height: 48, borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {prodImg ? (
                                                                <img src={prodImg} alt={prodTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <Package style={{ width: 14, height: 14, color: '#9ca3af' }} />
                                                            )}
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{ fontWeight: 750, color: '#111', fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 200 }} title={prodTitle}>
                                                                {prodTitle}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#6b7280', verticalAlign: 'middle' }}>{review.userEmail}</td>
                                                <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star
                                                                key={star}
                                                                style={{
                                                                    width: 13,
                                                                    height: 13,
                                                                    fill: star <= review.rating ? '#eab308' : 'none',
                                                                    stroke: star <= review.rating ? '#eab308' : '#d1d5db',
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 16px', color: '#374151', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle' }} title={review.comment}>
                                                    {review.comment || '-'}
                                                </td>
                                                <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                    <button type="button" onClick={() => handleToggle(review._id, !review.isVisible)}
                                                        style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', border: '1px solid', background: review.isVisible ? '#fef2f2' : '#f0fdf4', color: review.isVisible ? '#dc2626' : '#16a34a', borderColor: review.isVisible ? '#fecaca' : '#bbf7d0' }}>
                                                        {review.isVisible ? 'Ẩn' : 'Hiện'}
                                                    </button>
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

export default VendorReviews;
