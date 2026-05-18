import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi } from '../util/api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, SearchX, Loader2 } from 'lucide-react';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState(0);
    
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();

    const [q, setQ] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [promo, setPromo] = useState(searchParams.get('promo') === 'true');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    useEffect(() => {
        setQ(searchParams.get('q') || '');
        setCategory(searchParams.get('category') || 'all');
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setInStock(searchParams.get('inStock') === 'true');
        setPromo(searchParams.get('promo') === 'true');
        setSort(searchParams.get('sort') || 'newest');
        
        setPage(1);
        setProducts([]);
        setHasMore(true);
    }, [searchParams]);

    useEffect(() => {
        let isSubscribed = true;
        const fetchProducts = async () => {
            if (page === 1) setLoading(true);
            else setLoadingMore(true);
            try {
                const params = Object.fromEntries([...searchParams]);
                params.page = page;
                params.limit = 4; 
                const res = await getProductsApi(params);
                if (isSubscribed && res && res.items) {
                    if (page === 1) {
                        setProducts(res.items);
                    } else {
                        setProducts(prev => [...prev, ...res.items]);
                    }
                    setTotal(res.total);
                    setHasMore(page < res.totalPages);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        };

        fetchProducts();
        
        return () => {
            isSubscribed = false;
        };
    }, [searchParams, page]);

    const lastProductElementRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    const handleApplyFilters = (e) => {
        e?.preventDefault();
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (category && category !== 'all') params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (inStock) params.set('inStock', 'true');
        if (promo) params.set('promo', 'true');
        if (sort && sort !== 'newest') params.set('sort', sort);
        setSearchParams(params);
    };

    const categories = ['all', 'Kỹ năng', 'Tiểu thuyết', 'Kinh doanh', 'Giáo dục', 'Thiếu nhi'];

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="surface rounded-3xl p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Filter className="w-5 h-5" /> Bộ lọc
                            </h2>

                            <form onSubmit={handleApplyFilters}>
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Danh mục</h3>
                                    <div className="space-y-2">
                                        {categories.map(cat => (
                                            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat}
                                                    checked={category === cat}
                                                    onChange={(e) => setCategory(e.target.value)}
                                                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300"
                                                />
                                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                                    {cat === 'all' ? 'Tất cả danh mục' : cat}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Khoảng giá (VNĐ)</h3>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="TỪ"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="form-input text-sm"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="ĐẾN"
                                            value={maxPrice}
                                            onChange={(e) => setMaxPrice(e.target.value)}
                                            className="form-input text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="mb-6 space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={inStock}
                                            onChange={(e) => setInStock(e.target.checked)}
                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">Chỉ hàng còn trong kho</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={promo}
                                            onChange={(e) => setPromo(e.target.checked)}
                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">Đang có khuyến mãi</span>
                                    </label>
                                </div>

                                <button type="submit" className="btn-primary w-full justify-center">
                                    Áp dụng bộ lọc
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="surface rounded-3xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-slate-600">
                                {q && (
                                    <span>
                                        Kết quả tìm kiếm cho <span className="font-bold text-slate-900">"{q}"</span> -{' '}
                                    </span>
                                )}
                                Hiển thị <span className="font-bold text-slate-900">{total}</span> sản phẩm
                            </div>

                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Sắp xếp:</span>
                                <select
                                    value={sort}
                                    onChange={(e) => {
                                        setSort(e.target.value);
                                        const params = new URLSearchParams(searchParams);
                                        params.set('sort', e.target.value);
                                        setSearchParams(params);
                                    }}
                                    className="form-select text-sm"
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="best">Bán chạy nhất</option>
                                    <option value="viewed">Xem nhiều nhất</option>
                                    <option value="price-asc">Giá: Thấp đến Cao</option>
                                    <option value="price-desc">Giá: Cao đến Thấp</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="animate-pulse bg-white/60 rounded-2xl h-80 border border-slate-200"></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((product, index) => {
                                        if (products.length === index + 1) {
                                            return (
                                                <div ref={lastProductElementRef} key={product.id}>
                                                    <ProductCard product={product} />
                                                </div>
                                            );
                                        } else {
                                            return <ProductCard key={product.id} product={product} />;
                                        }
                                    })}
                                </div>
                                {loadingMore && (
                                    <div className="flex justify-center mt-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="surface rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                                <SearchX className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy sản phẩm nào</h3>
                                <p className="text-slate-500 max-w-md">
                                    Thử điều chỉnh lại bộ lọc hoặc thay đổi từ khóa tìm kiếm để tìm thấy sản phẩm bạn mong muốn.
                                </p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="mt-6 text-slate-700 font-medium hover:text-slate-900"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;