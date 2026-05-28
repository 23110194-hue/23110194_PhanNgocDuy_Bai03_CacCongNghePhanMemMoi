import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { notification } from 'antd';
import { getAdminOrdersApi } from '../../util/api';
import { formatCurrency, formatDate } from '../../util/format';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 8;

const STATUS_LABELS = {
    NEW: 'Đơn hàng mới', CONFIRMED: 'Đã xác nhận', PREPARING: 'Chuẩn bị hàng',
    SHIPPING: 'Đang giao hàng', DELIVERED: 'Đã giao', CANCELED: 'Hủy đơn',
};
const STATUS_STYLE = {
    NEW:       { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
    CONFIRMED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    PREPARING: { bg: '#fff7ed', color: '#f97316', border: '#fed7aa' },
    SHIPPING:  { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    DELIVERED: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    CANCELED:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const PanelOrders = () => {
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(true);
    const [page, setPage]           = useState(1);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getAdminOrdersApi();
        setLoading(false);
        if (res && !res.message) { setOrders(res.items || []); return; }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };
    useEffect(() => { fetchOrders(); }, []);

    const totalPages = Math.ceil(orders.length / PAGE_SIZE);
    const paged = useMemo(() => orders.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [orders, page]);

    if (loading) return <div style={{ color: '#9ca3af', padding: 20 }}>Đang tải...</div>;
    if (orders.length === 0) return <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>Chưa có đơn hàng nào.</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{orders.length} đơn hàng</span>
                <button onClick={fetchOrders} style={{ fontSize: 13, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>↻ Làm mới</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paged.map(order => {
                    const ss = STATUS_STYLE[order.status] || STATUS_STYLE.NEW;
                    return (
                        <div key={order._id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Mã đơn</div>
                                    <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{order.orderNumber}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{formatDate(order.createdAt)}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Khách hàng</div>
                                    <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{order.userName || order.userEmail}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Tổng tiền</div>
                                    <div style={{ fontWeight: 700, color: '#f97316', fontSize: 14 }}>{formatCurrency(order.summary?.total)}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                                        {STATUS_LABELS[order.status]}
                                    </span>
                                    <Link to={`/orders/${order._id}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none' }}>
                                        Xem
                                    </Link>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo(0, 0); }} />
        </div>
    );
};

export default PanelOrders;
