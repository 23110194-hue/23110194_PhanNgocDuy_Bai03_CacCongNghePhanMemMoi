import React, { useContext, useEffect, useState } from 'react';
import { getProductsApi } from '../util/api';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Tag, Eye } from 'lucide-react';
import { AuthContext } from '../components/context/auth.context';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import './swiper-custom.css';

const HomePage = () => {
    const { auth } = useContext(AuthContext);
    const [promoProducts, setPromoProducts]   = useState([]);
    const [newProducts, setNewProducts]       = useState([]);
    const [bestProducts, setBestProducts]     = useState([]);
    const [viewedProducts, setViewedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [r1, r2, r3, r4] = await Promise.all([
                    getProductsApi({ promo: 'true', sort: 'newest', limit: 10 }),
                    getProductsApi({ sort: 'newest', limit: 10 }),
                    getProductsApi({ sort: 'best', limit: 10 }),
                    getProductsApi({ sort: 'viewed', limit: 10 }),
                ]);
                if (r1?.items) setPromoProducts(r1.items);
                if (r2?.items) setNewProducts(r2.items);
                if (r3?.items) setBestProducts(r3.items);
                if (r4?.items) setViewedProducts(r4.items);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    /* ── Product section component ── */
    const Section = ({ title, products, viewAllLink }) => (
        <section style={{ background: '#fff', marginBottom: 12, padding: '20px 0' }}>
            <div className="container">
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div className="section-title">{title}</div>
                    <Link to={viewAllLink} style={{ fontSize: 13, color: '#f97316', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                        Xem tất cả <ArrowRight style={{ width: 14, height: 14 }} />
                    </Link>
                </div>

                {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                        {[1,2,3,4,5].map(i => (
                            <div key={i} style={{ height: 280, background: '#f3f4f6', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px 0', fontSize: 14 }}>Chưa có sản phẩm</div>
                ) : (
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={12}
                        slidesPerView={2}
                        navigation
                        breakpoints={{
                            640:  { slidesPerView: 3 },
                            900:  { slidesPerView: 4 },
                            1100: { slidesPerView: 5 },
                        }}
                        style={{ paddingBottom: 4 }}
                    >
                        {products.map(product => (
                            <SwiperSlide key={product.id}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </section>
    );

    return (
        <div>
            {/* ── Hero banner ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', marginBottom: 12 }}>
                <div className="container" style={{ padding: '20px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'stretch' }}>

                        {/* Banner chính */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                            borderRadius: 10, padding: '32px 40px', color: '#fff',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 200
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', opacity: 0.85 }}>
                                BOOKSTORE — THƯ VIỆN TRI THỨC
                            </div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, margin: '10px 0 8px' }}>
                                Sách Mới Xuất Bản<br />Flash Sale Tới 30%
                            </h1>
                            <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>
                                Hàng ngàn đầu sách chất lượng cao, cập nhật mỗi tuần.
                            </p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <Link to="/products" style={{
                                    background: '#fff', color: '#f97316',
                                    borderRadius: 6, padding: '9px 20px',
                                    fontWeight: 700, fontSize: 13
                                }}>
                                    Mua sắm ngay
                                </Link>
                                <Link to="/products?promo=true" style={{
                                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.5)',
                                    borderRadius: 6, padding: '9px 20px',
                                    fontWeight: 600, fontSize: 13
                                }}>
                                    Xem khuyến mãi
                                </Link>
                            </div>
                        </div>

                        {/* User card */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: 20, flex: 1 }}>
                                {auth.isAuthenticated ? (
                                    <>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thành viên</div>
                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginTop: 6 }}>
                                            Xin chào, {auth.user.name || auth.user.email.split('@')[0]}!
                                        </div>
                                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                                            Vai trò: <strong>{auth.user.role}</strong>
                                        </div>
                                        <Link to="/user/profile" className="btn-primary" style={{ marginTop: 14, fontSize: 12, padding: '7px 16px' }}>
                                            Hồ sơ của tôi
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thành viên</div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginTop: 6 }}>Nhận ưu đãi độc giả</div>
                                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Đăng nhập để nhận thông báo giảm giá.</div>
                                        <Link to="/login" className="btn-primary" style={{ marginTop: 14, fontSize: 12, padding: '7px 16px' }}>
                                            Đăng nhập
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 20, color: '#fff', flex: 1 }}>
                                <div style={{ fontSize: 11, fontWeight: 600, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gợi ý</div>
                                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>Đọc 15 phút mỗi ngày</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Tạo thói quen đọc sách nâng cấp tư duy.</div>
                            </div>
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div style={{ display: 'flex', gap: 0, marginTop: 16, background: '#fff7ed', borderRadius: 8, border: '1px solid #fed7aa', overflow: 'hidden' }}>
                        {[
                            { label: 'Danh mục sách', value: '6+' },
                            { label: 'Giảm giá tới', value: '30%' },
                            { label: 'Độc giả', value: '1.2K' },
                            { label: 'Sách mới mỗi tuần', value: '50+' },
                        ].map((s, i) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 0', borderRight: i < 3 ? '1px solid #fed7aa' : 'none' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: '#f97316' }}>{s.value}</div>
                                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Product sections ── */}
            <Section title="SÁCH KHUYẾN MÃI"     products={promoProducts}   viewAllLink="/products?promo=true"   />
            <Section title="SÁCH MỚI PHÁT HÀNH"  products={newProducts}     viewAllLink="/products?sort=newest"  />
            <Section title="BÁN CHẠY NHẤT"        products={bestProducts}    viewAllLink="/products?sort=best"    />
            <Section title="XEM NHIỀU NHẤT"       products={viewedProducts}  viewAllLink="/products?sort=viewed"  />
        </div>
    );
};

export default HomePage;