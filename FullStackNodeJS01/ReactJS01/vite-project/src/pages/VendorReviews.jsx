import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorReviewsApi, updateVendorReviewVisibilityApi } from '../util/api';

const VendorReviews = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [products, setProducts] = useState([]);

    const productMap = useMemo(() => {
        const map = new Map();
        products.forEach((item) => map.set(item.id, item.title));
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

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
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
                                    {reviews.map((review, i) => (
                                        <tr key={review._id} style={{ borderBottom: i < reviews.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <td style={{ padding: '11px 16px', fontWeight: 600, color: '#111', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {productMap.get(review.productId) || review.productId}
                                            </td>
                                            <td style={{ padding: '11px 16px', color: '#6b7280' }}>{review.userEmail}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: review.rating >= 4 ? '#f0fdf4' : '#fef2f2', color: review.rating >= 4 ? '#16a34a' : '#dc2626', border: `1px solid ${review.rating >= 4 ? '#bbf7d0' : '#fecaca'}` }}>
                                                    {review.rating}/5
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 16px', color: '#374151', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.comment || '-'}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <button type="button" onClick={() => handleToggle(review._id, !review.isVisible)}
                                                    style={{ fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', border: '1px solid', background: review.isVisible ? '#fef2f2' : '#f0fdf4', color: review.isVisible ? '#dc2626' : '#16a34a', borderColor: review.isVisible ? '#fecaca' : '#bbf7d0' }}>
                                                    {review.isVisible ? 'Ẩn' : 'Hiện'}
                                                </button>
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

export default VendorReviews;
