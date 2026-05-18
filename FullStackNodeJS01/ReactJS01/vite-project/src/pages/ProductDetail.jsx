import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductDetailApi, getProductsApi } from '../util/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { ShoppingCart, Minus, Plus, Tag, Package, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                const res = await getProductDetailApi(slug);
                if (res && res.id) {
                    setProduct(res);
                    const similarRes = await getProductsApi({ category: res.category, sort: 'best' });
                    if (similarRes && similarRes.items) {
                        setSimilarProducts(similarRes.items.filter(item => item.id !== res.id).slice(0, 4));
                    }
                }
            } catch (error) {
                console.error("Error fetching product details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductData();
        setQuantity(1);
        window.scrollTo(0, 0);
    }, [slug]);

    const handleQuantityChange = (type) => {
        if (type === 'dec' && quantity > 1) {
            setQuantity(prev => prev - 1);
        } else if (type === 'inc' && quantity < (product?.stock || 1)) {
            setQuantity(prev => prev + 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <Package className="w-24 h-24 text-slate-300 mb-6" />
                <h2 className="font-display text-2xl font-semibold text-slate-900 mb-2">Không tìm thấy sản phẩm</h2>
                <p className="text-slate-500 mb-6 text-center max-w-md">Sản phẩm này không tồn tại hoặc đã bị xóa khỏi hệ thống.</p>
                <Link to="/products" className="btn-primary">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
                    <ol className="inline-flex items-center space-x-1 md:space-x-3">
                        <li className="inline-flex items-center">
                            <Link to="/" className="hover:text-slate-900">Trang chủ</Link>
                        </li>
                        <li>
                            <div className="flex items-center">
                                <span className="mx-2">/</span>
                                <Link to={`/products?category=${product.category}`} className="hover:text-slate-900">{product.category}</Link>
                            </div>
                        </li>
                        <li aria-current="page">
                            <div className="flex items-center">
                                <span className="mx-2">/</span>
                                <span className="text-slate-900 font-medium truncate max-w-xs">{product.title}</span>
                            </div>
                        </li>
                    </ol>
                </nav>

                <div className="surface rounded-[32px] overflow-hidden mb-12">
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-2/5 p-6 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white">
                            <div className="relative rounded-2xl overflow-hidden mb-6 bg-slate-100" style={{ aspectRatio: '3/4' }}>
                                <Swiper
                                    spaceBetween={0}
                                    navigation={true}
                                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                    modules={[Navigation, Thumbs]}
                                    className="w-full h-full"
                                >
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={idx} className="flex items-center justify-center">
                                            <img src={img} alt={`${product.title} - ${idx}`} className="w-full h-full object-cover" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                    {product.isNew && (
                                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Mới</span>
                                    )}
                                    {product.hasDiscount && (
                                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">-{product.discountPercent}%</span>
                                    )}
                                </div>
                            </div>

                            {product.images.length > 1 && (
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={12}
                                    slidesPerView={4}
                                    freeMode={true}
                                    watchSlidesProgress={true}
                                    modules={[Navigation, Thumbs]}
                                    className="thumbs-swiper h-24"
                                >
                                    {product.images.map((img, idx) => (
                                        <SwiperSlide key={idx} className="cursor-pointer rounded-xl overflow-hidden border-2 border-transparent opacity-60 hover:opacity-100 transition-all bg-slate-100">
                                            <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>

                        <div className="w-full lg:w-3/5 p-6 lg:p-12 bg-white">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
                                    <Tag className="w-3.5 h-3.5" />
                                    {product.category}
                                </span>
                            </div>

                            <h1 className="font-display text-3xl lg:text-5xl font-semibold text-slate-900 mb-4 leading-tight">
                                {product.title}
                            </h1>
                            <div className="text-lg text-slate-500 mb-8 flex items-center gap-2">
                                <span>Tác giả:</span>
                                <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-md">{product.author}</span>
                            </div>

                            <div className="bg-slate-50 rounded-2xl p-6 lg:p-8 mb-8 border border-slate-100">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12">
                                    <div>
                                        <div className="text-sm text-slate-500 font-medium mb-1">Giá sản phẩm</div>
                                        <div className="flex items-baseline gap-3">
                                            <div className="text-4xl font-black text-slate-900 tracking-tight">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.finalPrice)}
                                            </div>
                                            {product.hasDiscount && (
                                                <div className="text-xl text-slate-400 line-through font-medium">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="hidden sm:block h-16 w-px bg-slate-200"></div>

                                    <div className="flex flex-row sm:flex-col gap-4 sm:gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100">
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            <span>Đã bán: <strong className="text-slate-900">{product.sold}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white px-3 py-2 rounded-lg shadow-sm border border-slate-100">
                                            {product.stock > 0 ? (
                                                <><Package className="w-4 h-4 text-slate-600" /> <span>Tồn kho: <strong className="text-slate-900">{product.stock}</strong></span></>
                                            ) : (
                                                <><AlertTriangle className="w-4 h-4 text-rose-500" /> <span className="text-rose-600 font-bold">Hết hàng</span></>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-10">
                                <h3 className="font-display text-xl font-semibold text-slate-900 mb-4">Mô tả sản phẩm</h3>
                                <p className="text-slate-600 leading-relaxed text-lg">
                                    {product.description}
                                </p>
                            </div>

                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-10">
                                    {product.tags.map(tag => (
                                        <span key={tag} className="px-4 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 transition-colors cursor-pointer text-sm rounded-full font-medium border border-transparent hover:border-amber-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between sm:justify-start border-2 border-slate-200 rounded-full bg-white p-1">
                                    <button
                                        onClick={() => handleQuantityChange('dec')}
                                        disabled={quantity <= 1}
                                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full disabled:opacity-50 transition-all"
                                    >
                                        <Minus className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="number"
                                        readOnly
                                        value={quantity}
                                        className="w-16 text-center font-bold text-xl text-slate-900 outline-none bg-transparent"
                                    />
                                    <button
                                        onClick={() => handleQuantityChange('inc')}
                                        disabled={quantity >= product.stock}
                                        className="w-12 h-12 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full disabled:opacity-50 transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    disabled={product.stock <= 0}
                                    className="flex-1 btn-primary justify-center h-14 text-lg font-semibold disabled:bg-slate-300 disabled:shadow-none"
                                >
                                    <ShoppingCart className="w-6 h-6" />
                                    {product.stock > 0 ? "Thêm vào giỏ hàng" : "Tạm hết hàng"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {similarProducts.length > 0 && (
                    <div>
                        <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-amber-600" />
                            Sản phẩm cùng thể loại
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {similarProducts.map(item => (
                                <ProductCard key={item.id} product={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;