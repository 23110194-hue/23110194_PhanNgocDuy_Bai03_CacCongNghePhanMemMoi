import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { notification } from 'antd';
import { getAdminProductsApi, updateAdminProductStatusApi } from '../../util/api';
import { formatCurrency } from '../../util/format';
import { Eye, EyeOff } from 'lucide-react';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

const PanelProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [page, setPage]         = useState(1);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await getAdminProductsApi();
        setLoading(false);
        if (res && !res.message) { setProducts(res.items || []); return; }
        notification.error({ message: 'Không thể tải sản phẩm', description: res?.message });
    };
    useEffect(() => { fetchProducts(); }, []);

    const totalPages = Math.ceil(products.length / PAGE_SIZE);
    const paged = useMemo(() => products.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [products, page]);

    const handleToggle = async (productId, isActive) => {
        const res = await updateAdminProductStatusApi(productId, isActive);
        if (res && !res.message) {
            setProducts(prev => prev.map(p => p.id === res.id ? res : p));
            notification.success({ message: isActive ? '✅ Đã mở bán' : '🚫 Đã ẩn sản phẩm' });
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    if (loading) return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ background: '#f3f4f6', borderRadius: 10, height: 320 }} />)}
        </div>
    );
    if (products.length === 0) return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>
            Chưa có sản phẩm nào.
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{products.length} sản phẩm • Trang {page}/{totalPages}</span>
                <button onClick={fetchProducts} style={{ fontSize: 13, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>↻ Làm mới</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {paged.map(p => (
                    <div key={p.id} style={{
                        background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
                        overflow: 'hidden', display: 'flex', flexDirection: 'column',
                        opacity: p.isActive ? 1 : 0.65, position: 'relative',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                    >
                        {/* Badges */}
                        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2 }}>
                            {p.isNew && <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>MỚI</span>}
                            {p.hasDiscount && <span style={{ background: '#f97316', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>-{p.discountPercent}%</span>}
                            {!p.isActive && <span style={{ background: '#6b7280', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>ĐÃ ẨN</span>}
                        </div>

                        {/* Cover image */}
                        <Link to={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', position: 'relative', paddingTop: '135%', background: '#f3f4f6', overflow: 'hidden', textDecoration: 'none' }}>
                            <img src={p.images?.[0] || 'https://placehold.co/300x420?text=📖'} alt={p.title}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                onError={e => { e.target.src = 'https://placehold.co/300x420?text=📖'; }}
                            />
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.3)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                                <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>👁 Xem chi tiết</span>
                            </div>
                        </Link>

                        {/* Info */}
                        <div style={{ padding: '10px 12px 12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{p.category}</div>
                            <Link to={`/product/${p.slug}`} target="_blank" style={{ textDecoration: 'none' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 2, transition: 'color 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#111'}>
                                    {p.title}
                                </div>
                            </Link>
                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{p.author}</div>

                            <div style={{ marginBottom: 6 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#f97316' }}>{formatCurrency(p.finalPrice ?? p.price)}</div>
                                {p.hasDiscount && <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(p.price)}</div>}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
                                {p.sold > 0 && <span>🔥 Đã bán: {p.sold}</span>}
                                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 10, background: p.stock > 0 ? '#f0fdf4' : '#fef2f2', color: p.stock > 0 ? '#16a34a' : '#dc2626', border: `1px solid ${p.stock > 0 ? '#bbf7d0' : '#fecaca'}` }}>
                                    {p.stock > 0 ? `${p.stock} còn` : 'Hết'}
                                </span>
                            </div>

                            <button onClick={() => handleToggle(p.id, !p.isActive)}
                                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 0', borderRadius: 7, border: '1px solid', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: p.isActive ? '#fef2f2' : '#f0fdf4', color: p.isActive ? '#dc2626' : '#16a34a', borderColor: p.isActive ? '#fecaca' : '#bbf7d0' }}>
                                {p.isActive ? <><EyeOff style={{ width: 13, height: 13 }} /> Ẩn</> : <><Eye style={{ width: 13, height: 13 }} /> Mở bán</>}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo(0,0); }} />
        </div>
    );
};

export default PanelProducts;
