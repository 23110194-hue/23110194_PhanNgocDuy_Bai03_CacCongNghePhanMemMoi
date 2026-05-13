import React, { useEffect, useState } from 'react';
import { getProductsApi } from '../util/api';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, Tag } from 'lucide-react';

const HomePage = () => {
    const [promoProducts, setPromoProducts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [bestProducts, setBestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const resPromo = await getProductsApi({ promo: 'true', sort: 'newest' });
                const resNew = await getProductsApi({ sort: 'newest' });
                const resBest = await getProductsApi({ sort: 'best' });

                if (resPromo && resPromo.items) {
                    setPromoProducts(resPromo.items.slice(0, 4));
                }
                if (resNew && resNew.items) {
                    setNewProducts(resNew.items.slice(0, 4));
                }
                if (resBest && resBest.items) {
                    setBestProducts(resBest.items.slice(0, 4));
                }
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
                        Xem tat ca <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse bg-white/60 rounded-2xl h-80 border border-slate-200"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );

    return (
        <div className="min-h-screen">
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">
                <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-stretch">
                    <div className="surface rounded-[32px] p-8">
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Bo suu tap sach</div>
                        <h1 className="font-display text-3xl md:text-5xl font-semibold mt-3">
                            Doc sach thong minh, tu duy sau hon
                        </h1>
                        <p className="text-slate-600 mt-4">
                            Hang ngan dau sach chat luong cao duoc chon loc ky luong, cap nhat xu huong va uu dai moi tuan.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/products" className="btn-primary">Mua sam ngay</Link>
                            <Link to="/products?promo=true" className="btn-ghost">Xem khuyen mai</Link>
                        </div>
                        <div className="mt-8 grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500">Danh muc</div>
                                <div className="text-lg font-semibold">6+</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500">Giam gia</div>
                                <div className="text-lg font-semibold">30%</div>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <div className="text-xs text-slate-500">Doc gia</div>
                                <div className="text-lg font-semibold">1.2K</div>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4">
                        <div className="surface rounded-[28px] p-6 flex flex-col justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Thanh vien</div>
                                <h2 className="font-display text-2xl font-semibold mt-2">Nhan uu dai doc gia</h2>
                                <p className="text-sm text-slate-600 mt-3">
                                    Dang nhap de xem thong tin thanh vien, luu sach yeu thich va nhan thong bao giam gia.
                                </p>
                            </div>
                            <Link to="/login" className="btn-primary mt-6 w-fit">Dang nhap</Link>
                        </div>
                        <div className="rounded-[28px] p-6 bg-slate-900 text-white">
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-300">Goi y</div>
                            <h3 className="font-display text-2xl font-semibold mt-2">Doc 15 phut moi ngay</h3>
                            <p className="text-sm text-slate-300 mt-3">Tao thoi quen doc sach de nang cap tu duy va tu tin.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Section
                title="Sach Khuyen Mai"
                icon={Tag}
                products={promoProducts}
                viewAllLink="/products?promo=true"
            />

            <Section
                title="Sach Moi Phat Hanh"
                icon={Sparkles}
                products={newProducts}
                viewAllLink="/products?sort=newest"
            />

            <Section
                title="Ban Chay Nhat"
                icon={Flame}
                products={bestProducts}
                viewAllLink="/products?sort=best"
            />
        </div>
    );
};

export default HomePage;