import React, { useEffect, useState } from 'react';
import { getProductsApi } from '../util/api';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Tag, Eye } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './swiper-custom.css';

const HomePage = () => {
    const [promoProducts, setPromoProducts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [bestProducts, setBestProducts] = useState([]);
    const [viewedProducts, setViewedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const resPromo = await getProductsApi({ promo: 'true', sort: 'newest', limit: 10 });
                const resNew = await getProductsApi({ sort: 'newest', limit: 10 });
                const resBest = await getProductsApi({ sort: 'best', limit: 10 });
                const resViewed = await getProductsApi({ sort: 'viewed', limit: 10 });

                if (resPromo && resPromo.items) setPromoProducts(resPromo.items);
                if (resNew && resNew.items) setNewProducts(resNew.items);
                if (resBest && resBest.items) setBestProducts(resBest.items);
                if (resViewed && resViewed.items) setViewedProducts(resViewed.items);
                
            } catch (error) {
                console.error("Error fetching homepage products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const Section = ({ title, icon: Icon, products, viewAllLink }) => (
        <section className="py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                        </div>
                        <h2 className="font-display text-2xl font-semibold text-slate-900">{title}</h2>
                    </div>
                    <Link to={viewAllLink} className="text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 group">
                        Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse bg-white/60 rounded-2xl h-80 border border-slate-200"></div>
                        ))}
                    </div>
                ) : (
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={24}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 4 },
                        }}
                        className="pb-12"
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
        <div className="min-h-screen">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
                <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
                    <div className="surface rounded-[32px] p-8">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Bộ sưu tập sách</div>
                        <h1 className="font-display text-3xl md:text-5xl font-semibold mt-3">
                            Đọc sách thông minh, tư duy sâu hơn
                        </h1>
                        <p className="text-slate-600 mt-4">
                            Hàng ngàn đầu sách chất lượng cao được chọn lọc kỹ lưỡng, cập nhật xu hướng và ưu đãi mỗi tuần.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/products" className="btn-primary">Mua sắm ngay</Link>
                            <Link to="/products?promo=true" className="btn-ghost">Xem khuyến mãi</Link>
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500">Danh mục</div>
                                <div className="text-lg font-semibold">6+</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500">Giảm giá</div>
                                <div className="text-lg font-semibold">30%</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500">Độc giả</div>
                                <div className="text-lg font-semibold">1.2K</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div className="surface rounded-[28px] p-6 flex flex-col justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Thành viên</div>
                                <h2 className="font-display text-2xl font-semibold mt-2">Nhận ưu đãi độc giả</h2>
                                <p className="text-sm text-slate-600 mt-3">
                                    Đăng nhập để xem thông tin thành viên, lưu sách yêu thích và nhận thông báo giảm giá.
                                </p>
                            </div>
                            <Link to="/login" className="btn-primary mt-6 w-fit">Đăng nhập</Link>
                        </div>
                        <div className="rounded-[28px] p-6 bg-slate-900 text-white">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Gợi ý</div>
                            <h3 className="font-display text-2xl font-semibold mt-2">Đọc 15 phút mỗi ngày</h3>
                            <p className="text-sm text-slate-300 mt-3">Tạo thói quen đọc sách để nâng cấp tư duy và tự tin.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Section
                title="Sách Khuyến Mãi"
                icon={Tag}
                products={promoProducts}
                viewAllLink="/products?promo=true"
            />

            <Section
                title="Sách Mới Phát Hành"
                icon={Sparkles}
                products={newProducts}
                viewAllLink="/products?sort=newest"
            />

            <Section
                title="Bán Chạy Nhất"
                icon={Flame}
                products={bestProducts}
                viewAllLink="/products?sort=best"
            />
            
            <Section
                title="Xem Nhiều Nhất"
                icon={Eye}
                products={viewedProducts}
                viewAllLink="/products?sort=viewed"
            />
        </div>
    );
};

export default HomePage;