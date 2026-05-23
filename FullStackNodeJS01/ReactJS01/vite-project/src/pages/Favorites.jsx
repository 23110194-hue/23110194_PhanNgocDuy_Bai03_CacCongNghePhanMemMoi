import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { Heart, ShoppingCart } from 'lucide-react';
import { AuthContext } from '../components/context/auth.context';
import { getFavoritesApi, removeFavoriteApi } from '../util/api';
import { formatCurrency } from '../util/format';

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        setLoading(true);
        const res = await getFavoritesApi();
        setLoading(false);
        if (res && !res.message) { setItems(res.items || []); return; }
        notification.error({ message: 'Không thể tải danh sách yêu thích', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) { navigate('/login'); return; }
            fetchFavorites();
        }
    }, [auth.isAuthenticated, appLoading, navigate]);

    const handleRemove = async (productId) => {
        const res = await removeFavoriteApi(productId);
        if (res && !res.message) {
            setItems(prev => prev.filter(item => item.id !== productId));
            notification.success({ message: 'Đã bỏ yêu thích' });
            return;
        }
        notification.error({ message: 'Không thể bỏ yêu thích', description: res?.message });
    };

    if (appLoading || !auth.isAuthenticated) return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Heart style={{ width: 20, height: 20, color: '#f97316' }} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Sản phẩm yêu thích</h1>
                            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{items.length} sản phẩm đã lưu</p>
                        </div>
                    </div>
                    <Link to="/products" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>
                        Tiếp tục mua sắm
                    </Link>
                </div>

                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</div>
                ) : items.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '56px 24px', textAlign: 'center' }}>
                        <Heart style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px' }} />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>Chưa có sản phẩm yêu thích</h2>
                        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Hãy lưu những cuốn sách bạn quan tâm.</p>
                        <Link to="/products" style={{ background: '#f97316', color: '#fff', borderRadius: 8, padding: '9px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                            Khám phá sách
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                        {items.map(product => (
                            <div key={product.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s, transform 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                                {/* Image */}
                                <Link to={`/product/${product.slug}`} style={{ display: 'block', position: 'relative', paddingTop: '133%', background: '#f3f4f6', overflow: 'hidden' }}>
                                    <img src={product.images?.[0] || 'https://placehold.co/300x400?text=📖'} alt={product.title}
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                        onError={e => { e.target.src = 'https://placehold.co/300x400?text=📖'; }} />
                                </Link>

                                {/* Info */}
                                <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{product.category}</div>
                                    <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 2 }}>
                                            {product.title}
                                        </div>
                                    </Link>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>{product.author}</div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f97316', marginBottom: 10 }}>{formatCurrency(product.finalPrice)}</div>
                                    <button type="button" onClick={() => handleRemove(product.id)}
                                        style={{ width: '100%', padding: '7px 0', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                                        <Heart style={{ width: 12, height: 12 }} /> Bỏ yêu thích
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
