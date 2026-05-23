import React, { useEffect, useState, useMemo } from 'react';
import { notification } from 'antd';
import { getAdminShopsApi, updateAdminShopStatusApi } from '../../util/api';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 9;

const PanelShops = () => {
    const [shops, setShops]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage]       = useState(1);

    const fetchShops = async () => {
        setLoading(true);
        const res = await getAdminShopsApi();
        setLoading(false);
        if (res && !res.message) { setShops(res.items || []); return; }
        notification.error({ message: 'Không thể tải shop', description: res?.message });
    };
    useEffect(() => { fetchShops(); }, []);

    const totalPages = Math.ceil(shops.length / PAGE_SIZE);
    const paged = useMemo(() => shops.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [shops, page]);

    const handleToggle = async (shopId, isActive) => {
        const res = await updateAdminShopStatusApi(shopId, isActive);
        if (res && !res.message) {
            setShops(prev => prev.map(s => s._id === res._id ? res : s));
            notification.success({ message: isActive ? 'Đã mở shop' : 'Đã khóa shop' });
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    if (loading) return <div style={{ color: '#9ca3af', padding: 20 }}>Đang tải...</div>;
    if (shops.length === 0) return <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>Chưa có shop nào.</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{shops.length} shop • Trang {page}/{totalPages}</span>
                <button onClick={fetchShops} style={{ fontSize: 13, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>↻ Làm mới</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {paged.map(shop => (
                    <div key={shop._id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 18, transition: 'box-shadow 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.name}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shop.ownerEmail}</div>
                            </div>
                            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: shop.isActive ? '#f0fdf4' : '#f9fafb', color: shop.isActive ? '#16a34a' : '#9ca3af', border: `1px solid ${shop.isActive ? '#bbf7d0' : '#e5e7eb'}` }}>
                                {shop.isActive ? '● Hoạt động' : '● Khóa'}
                            </span>
                        </div>
                        {shop.address && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>📍 {shop.address}</div>}
                        {shop.phone   && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>📞 {shop.phone}</div>}
                        <button onClick={() => handleToggle(shop._id, !shop.isActive)}
                            style={{ width: '100%', padding: '7px 0', borderRadius: 7, border: '1px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: shop.isActive ? '#fef2f2' : '#f0fdf4', color: shop.isActive ? '#dc2626' : '#16a34a', borderColor: shop.isActive ? '#fecaca' : '#bbf7d0' }}>
                            {shop.isActive ? '🔒 Khóa shop' : '🔓 Mở shop'}
                        </button>
                    </div>
                ))}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo(0,0); }} />
        </div>
    );
};

export default PanelShops;
