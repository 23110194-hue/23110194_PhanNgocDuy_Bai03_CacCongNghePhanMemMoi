import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { addFavoriteApi, createProductReviewApi, getProductDetailApi, getProductReviewsApi, getProductsApi } from '../util/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ShoppingCart, Minus, Plus, Heart, CheckCircle, Package, AlertTriangle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { formatCurrency } from '../util/format';
import { notification } from 'antd';

const Star = ({ filled }) => (
    <span style={{ color: filled ? '#f59e0b' : '#d1d5db', fontSize: 16 }}>★</span>
);

const ProductDetail = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const { auth } = useContext(AuthContext);
    const { addToCart, cartLoading } = useContext(CartContext);

    const fetchReviews = async (productId) => {
        const res = await getProductReviewsApi(productId);
        if (res && !res.message) { setReviews(res.items || []); return; }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await getProductDetailApi(slug);
                if (res?.id) {
                    setProduct(res);
                    const sim = await getProductsApi({ category: res.category, sort: 'best' });
                    if (sim?.items) setSimilarProducts(sim.items.filter(i => i.id !== res.id).slice(0, 4));
                    fetchReviews(res.id);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchData();
        setQuantity(1);
        setReviewForm({ rating: 5, comment: '' });
        setReviews([]);
        window.scrollTo(0, 0);
    }, [slug]);

    const handleQty = (type) => {
        if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
        else if (type === 'inc' && quantity < (product?.stock || 1)) setQuantity(q => q + 1);
    };

    const handleAddToCart = async () => {
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        await addToCart(product.id, quantity);
    };

    const handleFavorite = async () => {
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        setFavoriteLoading(true);
        const res = await addFavoriteApi(product.id);
        setFavoriteLoading(false);
        if (res && !res.message) { notification.success({ message: '❤️ Đã thêm vào yêu thích' }); return; }
        notification.error({ message: 'Không thể thêm yêu thích', description: res?.message });
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        const res = await createProductReviewApi(product.id, Number(reviewForm.rating), reviewForm.comment);
        if (res && !res.message) {
            notification.success({ message: 'Đã gửi đánh giá' });
            setReviewForm({ rating: 5, comment: '' });
            fetchReviews(product.id);
            return;
        }
        notification.error({ message: 'Không thể gửi đánh giá', description: res?.message });
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 320, color: '#9ca3af' }}>
            Đang tải...
        </div>
    );

    if (!product) return (
        <div style={{ textAlign: 'center', padding: '64px 16px' }}>
            <Package style={{ width: 56, height: 56, color: '#d1d5db', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8 }}>Không tìm thấy sản phẩm</h2>
            <p style={{ color: '#9ca3af', marginBottom: 20 }}>Sản phẩm không tồn tại hoặc đã bị xóa.</p>
            <Link to="/products" className="btn-primary">Tiếp tục mua sắm</Link>
        </div>
    );

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh' }}>
            <div className="container" style={{ padding: '16px 16px 32px' }}>

                {/* Breadcrumb */}
                <nav style={{ fontSize: 12, color: '#9ca3af', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Link to="/" style={{ color: '#9ca3af' }}>Trang chủ</Link>
                    <span>/</span>
                    <Link to={`/products?category=${product.category}`} style={{ color: '#9ca3af' }}>{product.category}</Link>
                    <span>/</span>
                    <span style={{ color: '#374151', fontWeight: 500, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</span>
                </nav>

                {/* ── Main product block ── */}
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden', marginBottom: 16 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>

                        {/* LEFT — images */}
                        <div style={{ width: 300, flexShrink: 0, padding: 20, borderRight: '1px solid #f3f4f6', background: '#fafafa' }}>
                            {/* Main image */}
                            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb', marginBottom: 10, aspectRatio: '3/4', background: '#f3f4f6' }}>
                                <Swiper
                                    spaceBetween={0}
                                    navigation
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    modules={[Navigation, Thumbs]}
                                    style={{ width: '100%', height: '100%' }}
                                >
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={idx}>
                                            <img src={img} alt={`${product.title} - ${idx}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>

                            {/* Thumbnails */}
                            {product.images.length > 1 && (
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={8}
                                    slidesPerView={4}
                                    modules={[Navigation, Thumbs]}
                                    style={{ height: 60 }}
                                >
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={idx} style={{ cursor: 'pointer', borderRadius: 6, overflow: 'hidden', border: '1px solid #e5e7eb', opacity: 0.65 }}>
                                            <img src={img} alt={`Thumb ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}

                            {/* Badges */}
                            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                                {product.isNew && <span style={{ background: '#10b981', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>MỚI</span>}
                                {product.hasDiscount && <span style={{ background: '#f97316', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>-{product.discountPercent}%</span>}
                            </div>
                        </div>

                        {/* RIGHT — info */}
                        <div style={{ flex: 1, minWidth: 0, padding: '20px 24px' }}>
                            {/* Category tag */}
                            <div style={{ marginBottom: 10 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    📌 {product.category}
                                </span>
                            </div>

                            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.35, marginBottom: 6 }}>{product.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#6b7280', marginBottom: 20, flexWrap: 'wrap' }}>
                                <div>Tác giả: <strong style={{ color: '#374151' }}>{product.author}</strong></div>
                                {product.shopName && (
                                    <>
                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#d1d5db' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Cung cấp bởi: 
                                            <span style={{ color: '#f97316', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Package style={{ width: 14, height: 14 }} /> {product.shopName}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Price block */}
                            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', marginBottom: 18, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>Giá sản phẩm</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                        <span style={{ fontSize: 28, fontWeight: 900, color: '#f97316' }}>{formatCurrency(product.finalPrice)}</span>
                                        {product.hasDiscount && <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(product.price)}</span>}
                                    </div>
                                </div>
                                <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                                        <CheckCircle style={{ width: 14, height: 14, color: '#16a34a' }} />
                                        Đã bán: <strong>{product.sold}</strong>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                        {product.stock > 0
                                            ? <><Package style={{ width: 14, height: 14, color: '#6b7280' }} /><span style={{ color: '#374151' }}>Tồn kho: <strong>{product.stock}</strong></span></>
                                            : <><AlertTriangle style={{ width: 14, height: 14, color: '#dc2626' }} /><span style={{ color: '#dc2626', fontWeight: 700 }}>Hết hàng</span></>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: 18 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Mô tả sản phẩm</div>
                                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>{product.description}</p>
                            </div>

                            {/* Tags */}
                            {product.tags?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                                    {product.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: 12, color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}>#{tag}</span>
                                    ))}
                                </div>
                            )}

                            {/* Divider */}
                            <div style={{ borderTop: '1px solid #f3f4f6', marginBottom: 16 }} />

                            {/* Qty + Cart */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                {/* Qty control */}
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                                    <button onClick={() => handleQty('dec')} disabled={quantity <= 1}
                                        style={{ width: 36, height: 40, border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 18, disabled: quantity <= 1 }}>
                                        <Minus style={{ width: 14, height: 14 }} />
                                    </button>
                                    <input readOnly value={quantity} style={{ width: 44, height: 40, textAlign: 'center', border: 'none', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', fontWeight: 700, fontSize: 15, color: '#111', background: '#fff' }} />
                                    <button onClick={() => handleQty('inc')} disabled={quantity >= product.stock}
                                        style={{ width: 36, height: 40, border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                        <Plus style={{ width: 14, height: 14 }} />
                                    </button>
                                </div>

                                {/* Add to cart */}
                                <button onClick={handleAddToCart} disabled={product.stock <= 0 || cartLoading}
                                    style={{ flex: 1, minWidth: 180, height: 44, background: product.stock > 0 ? '#f97316' : '#9ca3af', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: product.stock > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                    <ShoppingCart style={{ width: 18, height: 18 }} />
                                    {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Tạm hết hàng'}
                                </button>

                                {/* Favorite */}
                                <button onClick={handleFavorite} disabled={favoriteLoading}
                                    style={{ height: 44, padding: '0 16px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', fontWeight: 500 }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                                    <Heart style={{ width: 16, height: 16 }} /> Yêu thích
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Reviews ── */}
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Đánh giá sản phẩm</h2>
                        <span style={{ fontSize: 12, color: '#9ca3af' }}>{reviews.length} đánh giá</span>
                    </div>

                    {/* Review form */}
                    <form onSubmit={handleReview} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                        <select value={reviewForm.rating} onChange={e => setReviewForm(p => ({ ...p, rating: e.target.value }))}
                            style={{ border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 10px', fontSize: 13, outline: 'none', width: 120 }}>
                            {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} sao {'★'.repeat(v)}</option>)}
                        </select>
                        <input value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                            placeholder="Chia sẻ cảm nhận của bạn..."
                            style={{ flex: 1, minWidth: 200, border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none' }}
                            onFocus={e => e.target.style.borderColor = '#f97316'}
                            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                        <button type="submit" style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 7, padding: '0 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                            Gửi
                        </button>
                    </form>

                    {/* Review list */}
                    {reviewLoading ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Đang tải...</div>
                        : reviews.length === 0 ? <div style={{ color: '#9ca3af', fontSize: 13 }}>Chưa có đánh giá nào.</div>
                        : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {reviews.map(r => (
                                    <div key={r._id} style={{ border: '1px solid #f3f4f6', borderRadius: 8, padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{r.userEmail}</span>
                                            <div>{[1,2,3,4,5].map(i => <Star key={i} filled={i <= r.rating} />)}</div>
                                        </div>
                                        <div style={{ fontSize: 13, color: '#374151' }}>{r.comment || 'Không có nội dung'}</div>
                                    </div>
                                ))}
                            </div>
                        )
                    }
                </div>

                {/* ── Similar products ── */}
                {similarProducts.length > 0 && (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 16 }}>Sản phẩm cùng thể loại</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                            {similarProducts.map(item => <ProductCard key={item.id} product={item} />)}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProductDetail;