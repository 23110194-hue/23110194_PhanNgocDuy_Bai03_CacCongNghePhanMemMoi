import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi } from '../util/api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, SearchX, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const LIMIT = 8;

const categories = ['all', 'Kỹ năng', 'Tiểu thuyết', 'Kinh doanh', 'Giáo dục', 'Thiếu nhi'];

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [q, setQ] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'all');
    const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true');
    const [promo, setPromo] = useState(searchParams.get('promo') === 'true');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

    // Page from query params
    const page = Number(searchParams.get('page')) || 1;

    useEffect(() => {
        setQ(searchParams.get('q') || '');
        setCategory(searchParams.get('category') || 'all');
        setMinPrice(searchParams.get('minPrice') || '');
        setMaxPrice(searchParams.get('maxPrice') || '');
        setInStock(searchParams.get('inStock') === 'true');
        setPromo(searchParams.get('promo') === 'true');
        setSort(searchParams.get('sort') || 'newest');
    }, [searchParams]);

    useEffect(() => {
        let isSubscribed = true;
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = { ...Object.fromEntries([...searchParams]), page, limit: LIMIT };
                const res = await getProductsApi(params);
                if (isSubscribed && res) {
                    setProducts(res.items || []);
                    setTotal(res.total || 0);
                    setTotalPages(res.totalPages || 0);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
        return () => { isSubscribed = false; };
    }, [searchParams, page]);

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
        params.set('page', '1'); // Reset to page 1
        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderPagination = () => {
        if (totalPages === 0) return null;

        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(i);
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* Prev Button */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        style={{
                            height: 38,
                            padding: '0 14px',
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: page === 1 ? '#cbd5e1' : '#475569',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={e => { if (page > 1) { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = page === 1 ? '#cbd5e1' : '#475569'; }}
                    >
                        <ChevronLeft style={{ width: 14, height: 14 }} /> Trước
                    </button>

                    {/* Page Numbers */}
                    {pages.map((p) => {
                        const isCurrent = p === page;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handlePageChange(p)}
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    border: isCurrent ? '1px solid #f97316' : '1px solid #e2e8f0',
                                    background: isCurrent ? '#f97316' : '#fff',
                                    color: isCurrent ? '#fff' : '#475569',
                                    fontWeight: 700,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                }}
                                onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; } }}
                                onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; } }}
                            >
                                {p}
                            </button>
                        );
                    })}

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                        style={{
                            height: 38,
                            padding: '0 14px',
                            borderRadius: 10,
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                            color: page === totalPages ? '#cbd5e1' : '#475569',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: page === totalPages ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.15s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                        }}
                        onMouseEnter={e => { if (page < totalPages) { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; } }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = page === totalPages ? '#cbd5e1' : '#475569'; }}
                    >
                        Sau <ChevronRight style={{ width: 14, height: 14 }} />
                    </button>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    Hiển thị {Math.min((page - 1) * LIMIT + 1, total)} - {Math.min(page * LIMIT, total)} trong số {total} sản phẩm
                </div>
            </div>
        );
    };

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
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
                                        Kết quả tìm kiếm cho <span className="font-bold text-slate-900">"{q}"</span>{' '}
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
                                        params.set('page', '1');
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
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                    <div key={i} className="animate-pulse bg-white/60 rounded-2xl h-80 border border-slate-200"></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Render Pagination Controls */}
                                {renderPagination()}
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
