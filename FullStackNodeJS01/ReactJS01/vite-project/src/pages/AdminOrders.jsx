import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getAdminOrdersApi, updateOrderStatusApi } from '../util/api';
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

const AdminOrders = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [noteDrafts, setNoteDrafts] = useState({});

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getAdminOrdersApi();
        setLoading(false);
        if (res && !res.message) {
            setOrders(res.items || []);
            return;
        }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) {
                navigate('/login');
            } else if (auth.user?.role !== 'admin') {
                navigate('/user/profile');
            }
        }
    }, [auth, appLoading, navigate]);

    useEffect(() => {
        if (!appLoading && auth.isAuthenticated && auth.user?.role === 'admin') {
            fetchOrders();
        }
    }, [appLoading, auth.isAuthenticated, auth.user?.role]);

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
        const res = await updateOrderStatusApi(orderId, status, noteDrafts[orderId] || '');
        if (res && !res.message) {
            notification.success({ message: 'Cập nhật trạng thái thành công.' });
            setOrders((prev) => prev.map((item) => (item._id === res._id ? res : item)));
            setStatusDrafts((prev) => ({ ...prev, [orderId]: '' }));
            setNoteDrafts((prev) => ({ ...prev, [orderId]: '' }));
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    const statusOptions = useMemo(() => statusLabels, []);

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Quản lý đơn hàng</h1>
                        <p className="text-slate-500">Cập nhật trạng thái xử lý đơn hàng của khách.</p>
                    </div>
                    <Link to="/admin/profile" className="btn-ghost">Quay lại Admin</Link>
                </div>

                {loading ? (
                    <div className="surface rounded-3xl p-10 text-center">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div className="surface rounded-3xl p-10 text-center">Chưa có đơn hàng nào.</div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const nextStatuses = nextStatusMap[order.status] || [];
                            return (
                                <div key={order._id} className="surface rounded-3xl p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div>
                                            <div className="text-sm text-slate-500">Mã đơn</div>
                                            <div className="font-semibold text-slate-900">{order.orderNumber}</div>
                                            <div className="text-sm text-slate-500 mt-1">{formatDate(order.createdAt)}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">Khách hàng</div>
                                            <div className="font-semibold text-slate-900">{order.userName || order.userEmail}</div>
                                            <div className="text-xs text-slate-500">{order.userEmail}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">Trạng thái</div>
                                            <div className="font-semibold text-slate-900">{order.statusLabel || statusLabels[order.status]}</div>
                                            {order.cancelRequested && (
                                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-1 mt-1 inline-flex">
                                                    Yêu cầu hủy
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm text-slate-500">Tổng</div>
                                            <div className="font-semibold text-slate-900">{formatCurrency(order.summary.total)}</div>
                                        </div>
                                        <div>
                                            <Link to={`/orders/${order._id}`} className="btn-ghost">Xem chi tiết</Link>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid lg:grid-cols-[240px_1fr_auto] gap-4 items-end">
                                        <div>
                                            <label className="text-sm font-medium text-slate-600">Chuyển trạng thái</label>
                                            <select
                                                value={statusDrafts[order._id] || ''}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="form-select mt-2"
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
                                            <label className="text-sm font-medium text-slate-600">Ghi chú</label>
                                            <input
                                                type="text"
                                                value={noteDrafts[order._id] || ''}
                                                onChange={(e) => handleNoteChange(order._id, e.target.value)}
                                                className="form-input mt-2"
                                                placeholder="Ví dụ: Đã gọi xác nhận đơn..."
                                                disabled={nextStatuses.length === 0}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleUpdateStatus(order._id)}
                                            className="btn-primary justify-center"
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

export default AdminOrders;

