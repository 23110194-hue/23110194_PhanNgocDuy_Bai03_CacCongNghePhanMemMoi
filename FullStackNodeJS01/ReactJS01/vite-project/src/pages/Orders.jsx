import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, Truck, XCircle, ChevronRight } from 'lucide-react';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { cancelOrderApi, getOrdersApi } from '../util/api';
import { formatCurrency, formatDate } from '../util/format';

const STATUS_STYLE = {
    NEW:       { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
    CONFIRMED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    PREPARING: { bg: '#fff7ed', color: '#f97316', border: '#fed7aa' },
    SHIPPING:  { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
    DELIVERED: { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
    CANCELED:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const OrdersPage = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getOrdersApi();
        setLoading(false);
        if (res && !res.message) { setOrders(res.items || []); return; }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };

    useEffect(() => {
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        fetchOrders();
    }, [auth.isAuthenticated, navigate]);

    const handleCancel = async (orderId) => {
        const res = await cancelOrderApi(orderId);
        if (res && !res.message) {
            notification.success({ message: 'Đã cập nhật trạng thái đơn hàng' });
            setOrders(prev => prev.map(item => item._id === res._id ? res : item));
            return;
        }
        notification.error({ message: 'Không thể hủy đơn', description: res?.message });
    };

    if (!auth.isAuthenticated) return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PackageSearch style={{ width: 20, height: 20, color: '#f97316' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Đơn hàng của tôi</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Theo dõi tiến trình giao hàng</p>
                    </div>
                </div>

                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</div>
                ) : orders.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '56px 24px', textAlign: 'center' }}>
                        <PackageSearch style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px' }} />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>Chưa có đơn hàng nào</h2>
                        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Bắt đầu mua sắm để tạo đơn hàng mới.</p>
                        <Link to="/products" style={{ background: '#f97316', color: '#fff', borderRadius: 8, padding: '9px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {orders.map(order => {
                            const ss = STATUS_STYLE[order.status] || STATUS_STYLE.NEW;
                            return (
                                <div key={order._id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '16px 18px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9ca3af' }}>Mã đơn</div>
                                            <div style={{ fontWeight: 700, color: '#111', fontSize: 14 }}>{order.orderNumber}</div>
                                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{formatDate(order.createdAt)}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: ss.bg, color: ss.color, border: `1px solid ${ss.border}` }}>
                                                {order.statusLabel}
                                            </span>
                                            {order.cancelRequested && (
                                                <span style={{ fontSize: 11, background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: 20, border: '1px solid #fde68a' }}>Gửi yêu cầu hủy</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f97316' }}>
                                            {formatCurrency(order.summary?.total)}
                                        </div>
                                    </div>

                                    {/* Items preview */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b7280', marginBottom: 12, flexWrap: 'wrap' }}>
                                        <Truck style={{ width: 13, height: 13, flexShrink: 0 }} />
                                        {order.items?.slice(0, 2).map(item => (
                                            <span key={item.productId} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 8px' }}>{item.title}</span>
                                        ))}
                                        {order.items?.length > 2 && <span style={{ color: '#9ca3af' }}>+{order.items.length - 2} sản phẩm</span>}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        <Link to={`/orders/${order._id}`} style={{ fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            Xem chi tiết <ChevronRight style={{ width: 13, height: 13 }} />
                                        </Link>
                                        {order.actions?.canCancel && (
                                            <button type="button" onClick={() => handleCancel(order._id)}
                                                style={{ fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 7, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>
                                                Hủy đơn ({order.actions.minutesLeftToCancel} phút)
                                            </button>
                                        )}
                                        {order.actions?.canRequestCancel && (
                                            <button type="button" onClick={() => handleCancel(order._id)}
                                                style={{ fontSize: 13, fontWeight: 600, padding: '6px 16px', borderRadius: 7, border: '1px solid #fde68a', background: '#fef3c7', color: '#d97706', cursor: 'pointer' }}>
                                                Gửi yêu cầu hủy
                                            </button>
                                        )}
                                        {order.status === 'CANCELED' && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#dc2626' }}>
                                                <XCircle style={{ width: 14, height: 14 }} /> Đã hủy
                                            </span>
                                        )}
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

export default OrdersPage;
