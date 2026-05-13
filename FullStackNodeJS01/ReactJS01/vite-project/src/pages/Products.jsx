import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsApi } from '../util/api';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, SearchX } from 'lucide-react';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

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

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = Object.fromEntries([...searchParams]);
                const res = await getProductsApi(params);
                if (res && res.items) {
                    setProducts(res.items);
                    setTotal(res.total);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams]);

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

    const categories = ['all', 'Ky nang', 'Tieu thuyet', 'Kinh doanh', 'Giao duc', 'Thieu nhi'];

    return (
        <div className="min-h-screen py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-72 flex-shrink-0">
                        <div className="surface rounded-3xl p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Filter className="w-5 h-5" /> Bo loc
                            </h2>

                            <form onSubmit={handleApplyFilters}>
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Danh muc</h3>
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
                                                    {cat === 'all' ? 'Tat ca danh muc' : cat}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold text-slate-900 mb-3">Khoang gia (VND)</h3>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="TU"
                                            value={minPrice}
                                            onChange={(e) => setMinPrice(e.target.value)}
                                            className="form-input text-sm"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input
                                            type="number"
                                            placeholder="DEN"
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
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">Chi hang con trong kho</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={promo}
                                            onChange={(e) => setPromo(e.target.checked)}
                                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-slate-300"
                                        />
                                        <span className="text-sm text-slate-600 group-hover:text-slate-900">Dang co khuyen mai</span>
                                    </label>
                                </div>

                                <button type="submit" className="btn-primary w-full justify-center">
                                    Ap dung bo loc
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="surface rounded-3xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-slate-600">
                                {q && (
                                    <span>
                                        Ket qua tim kiem cho <span className="font-bold text-slate-900">"{q}"</span> -{' '}
                                    </span>
                                )}
                                Hien thi <span className="font-bold text-slate-900">{total}</span> san pham
                            </div>

                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">Sap xep:</span>
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
                                    <option value="newest">Moi nhat</option>
                                    <option value="best">Ban chay nhat</option>
                                    <option value="price-asc">Gia: Thap den Cao</option>
                                    <option value="price-desc">Gia: Cao den Thap</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="animate-pulse bg-white/60 rounded-2xl h-80 border border-slate-200"></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="surface rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                                <SearchX className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Khong tim thay san pham nao</h3>
                                <p className="text-slate-500 max-w-md">
                                    Thu dieu chinh lai bo loc hoac thay doi tu khoa tim kiem de tim thay san pham ban mong muon.
                                </p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="mt-6 text-slate-700 font-medium hover:text-slate-900"
                                >
                                    Xoa tat ca bo loc
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