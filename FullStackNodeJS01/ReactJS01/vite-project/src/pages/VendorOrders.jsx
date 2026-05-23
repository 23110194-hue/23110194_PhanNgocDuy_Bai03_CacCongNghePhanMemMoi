import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorOrdersApi, updateVendorOrderStatusApi } from '../util/api';
import { formatCurrency, formatDate } from '../util/format';

const statusLabels = {
    NEW: 'Đơn hàng mới',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Shop đang chuẩn bị hàng',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao thành công',
    CANCELED: 'Hủy đơn hàng',
};

const nextStatusMap = {
    NEW: ['CONFIRMED', 'CANCELED'],
    CONFIRMED: ['PREPARING', 'CANCELED'],
    PREPARING: ['SHIPPING', 'CANCELED'],
    SHIPPING: ['DELIVERED'],
    DELIVERED: [],
    CANCELED: [],
};

const VendorOrders = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [noteDrafts, setNoteDrafts] = useState({});

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getVendorOrdersApi();
        setLoading(false);
        if (res && !res.message) {
            setOrders(res.orders || []);
            return;
        }
        if (res?.message && res.message.includes('Shop')) {
            notification.warning({ message: 'Vui lòng đăng ký shop trước.' });
            navigate('/vendor/shop');
            return;
        }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) {
                navigate('/login');
                return;
            }
            if (auth.user?.role !== 'vendor') {
                navigate('/user/profile');
                return;
            }
            fetchOrders();
        }
    }, [auth, appLoading, navigate]);

    const handleStatusChange = (orderId, status) => {
        setStatusDrafts((prev) => ({ ...prev, [orderId]: status }));
    };

    const handleNoteChange = (orderId, note) => {
        setNoteDrafts((prev) => ({ ...prev, [orderId]: note }));
    };

    const handleUpdateStatus = async (orderId) => {
        const status = statusDrafts[orderId];
        if (!status) {
            notification.warning({ message: 'Vui lòng chọn trạng thái mới.' });
            return;
        }
        const res = await updateVendorOrderStatusApi(orderId, status, noteDrafts[orderId] || '');
        if (res && !res.message) {
            notification.success({ message: 'Cập nhật trạng thái thành công.' });
            fetchOrders();
            setStatusDrafts((prev) => ({ ...prev, [orderId]: '' }));
            setNoteDrafts((prev) => ({ ...prev, [orderId]: '' }));
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    const statusOptions = useMemo(() => statusLabels, []);

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Đơn hàng của shop</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Xử lý đơn hàng thuộc shop của bạn</p>
                    </div>
                    <Link to="/vendor/products" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>Quản lý sản phẩm</Link>
                </div>

                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>Chưa có đơn hàng nào.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {orders.map((order) => {
                            const nextStatuses = nextStatusMap[order.status] || [];
                            return (
                                <div key={order._id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Mã đơn</div>
                                            <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{order.orderNumber}</div>
                                            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Khách hàng</div>
                                            <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{order.userName || order.userEmail}</div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>{order.userEmail}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Trạng thái</div>
                                            <div style={{ fontWeight: 600, color: '#111', fontSize: 13 }}>{order.statusLabel || statusLabels[order.status]}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Tổng</div>
                                            <div style={{ fontWeight: 700, color: '#f97316', fontSize: 14 }}>{formatCurrency(order.shopSummary?.subtotal || 0)}</div>
                                        </div>
                                        <div>
                                            <Link to={`/orders/${order._id}`} style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', textDecoration: 'none' }}>Xem chi tiết</Link>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '220px 1fr auto', gap: 12, alignItems: 'flex-end', paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                                        <div>
                                            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Chuyển trạng thái</label>
                                            <select
                                                value={statusDrafts[order._id] || ''}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none' }}
                                                disabled={nextStatuses.length === 0}
                                            >
                                                <option value="">Chọn trạng thái</option>
                                                {nextStatuses.map((status) => (
                                                    <option key={status} value={status}>
                                                        {statusOptions[status]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: 12, color: '#9ca3af', display: 'block', marginBottom: 4 }}>Ghi chú</label>
                                            <input
                                                type="text"
                                                value={noteDrafts[order._id] || ''}
                                                onChange={(e) => handleNoteChange(order._id, e.target.value)}
                                                style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '7px 10px', fontSize: 13, outline: 'none' }}
                                                placeholder="Ví dụ: Đã gọi xác nhận đơn..."
                                                disabled={nextStatuses.length === 0}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleUpdateStatus(order._id)}
                                            style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                                            disabled={nextStatuses.length === 0}
                                        >
                                            Cập nhật
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrders;
