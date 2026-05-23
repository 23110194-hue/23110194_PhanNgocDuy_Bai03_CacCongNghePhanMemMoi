import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, PackageCheck, ShieldAlert, Truck } from 'lucide-react';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { cancelOrderApi, createOrderReviewApi, createShopReviewApi, getOrderDetailApi, getOrderReviewApi } from '../util/api';
import { formatCurrency, formatDate } from '../util/format';

const steps = [
    { key: 'NEW', label: 'Đơn hàng mới' },
    { key: 'CONFIRMED', label: 'Đã xác nhận' },
    { key: 'PREPARING', label: 'Chuẩn bị hàng' },
    { key: 'SHIPPING', label: 'Đang giao' },
    { key: 'DELIVERED', label: 'Đã giao' },
];

const OrderDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { auth } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderReview, setOrderReview] = useState(null);
    const [orderReviewDraft, setOrderReviewDraft] = useState({ rating: 5, comment: '' });
    const [shopReviewDrafts, setShopReviewDrafts] = useState({});

    const fetchOrder = async () => {
        setLoading(true);
        const res = await getOrderDetailApi(id);
        setLoading(false);
        if (res && !res.message) {
            setOrder(res);
            return;
        }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };

    const fetchOrderReview = async (orderId) => {
        setOrderReview(null);
        const res = await getOrderReviewApi(orderId);
        if (res && !res.message) {
            setOrderReview(res || null);
            return;
        }
    };

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrder();
    }, [auth.isAuthenticated, navigate, id]);

    useEffect(() => {
        if (order?._id) {
            fetchOrderReview(order._id);
        }
    }, [order?._id]);

    const currentStepIndex = useMemo(() => {
        if (!order) return -1;
        return steps.findIndex((step) => step.key === order.status);
    }, [order]);

    const handleCancel = async () => {
        const res = await cancelOrderApi(order._id);
        if (res && !res.message) {
            notification.success({ message: 'Đã cập nhật trạng thái đơn hàng' });
            setOrder(res);
            return;
        }
        notification.error({ message: 'Không thể hủy đơn', description: res?.message });
    };

    const isCustomer = auth.user?.role === 'user';

    const handleSubmitOrderReview = async () => {
        const res = await createOrderReviewApi(order._id, Number(orderReviewDraft.rating), orderReviewDraft.comment);
        if (res && !res.message) {
            notification.success({ message: 'Đã gửi đánh giá đơn hàng' });
            setOrderReview(res);
            return;
        }
        notification.error({ message: 'Không thể gửi đánh giá', description: res?.message });
    };

    const handleShopReviewChange = (shopId, field, value) => {
        setShopReviewDrafts((prev) => ({
            ...prev,
            [shopId]: { ...prev[shopId], [field]: value },
        }));
    };

    const handleSubmitShopReview = async (shopId) => {
        const draft = shopReviewDrafts[shopId] || { rating: 5, comment: '' };
        const res = await createShopReviewApi(shopId, Number(draft.rating || 5), draft.comment || '');
        if (res && !res.message) {
            notification.success({ message: 'Đã gửi đánh giá shop' });
            return;
        }
        notification.error({ message: 'Không thể gửi đánh giá', description: res?.message });
    };

    if (!auth.isAuthenticated) return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Chi tiết đơn hàng</h1>
                        <p className="text-slate-500">Theo dõi trạng thái và thông tin giao hàng.</p>
                    </div>
                </div>

                {loading || !order ? (
                    <div className="surface rounded-3xl p-10 text-center">Đang tải...</div>
                ) : (
                    <div className="space-y-6">
                        <div className="surface rounded-3xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <div className="text-sm text-slate-500">Mã đơn</div>
                                    <div className="font-semibold text-slate-900">{order.orderNumber}</div>
                                    <div className="text-sm text-slate-500 mt-1">{formatDate(order.createdAt)}</div>
                                </div>
                                <div className="text-sm font-semibold text-slate-900">{order.statusLabel}</div>
                            </div>

                            {order.status === 'CANCELED' ? (
                                <div className="mt-6 flex items-center gap-3 text-rose-600">
                                    <ShieldAlert className="w-5 h-5" />
                                    Đơn hàng đã bị hủy.
                                </div>
                            ) : (
                                <div className="mt-6 grid gap-4">
                                    <div className="grid sm:grid-cols-5 gap-3">
                                        {steps.map((step, index) => {
                                            const isActive = index <= currentStepIndex;
                                            return (
                                                <div key={step.key} className={`rounded-2xl border px-3 py-3 text-xs text-center ${isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}`}>
                                                    {step.label}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {order.cancelRequested && (
                                        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                                            Đã gửi yêu cầu hủy đơn. Shop sẽ phản hồi sớm.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap gap-3">
                                <Link to="/orders" className="btn-ghost">Quay lại danh sách</Link>
                                {isCustomer && order.actions?.canCancel && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn-ghost text-rose-600 border-rose-200"
                                    >
                                        Hủy đơn ({order.actions.minutesLeftToCancel} phút)
                                    </button>
                                )}
                                {isCustomer && order.actions?.canRequestCancel && (
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="btn-ghost text-amber-700 border-amber-200"
                                    >
                                        Gửi yêu cầu hủy
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                            <div className="surface rounded-3xl p-6">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5" /> Sản phẩm
                                </h3>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.productId} className="flex items-center gap-4">
                                            <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-100">
                                                <img
                                                    src={item.image || 'https://placehold.co/200x280?text=No+Image'}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-900">{item.title}</div>
                                                <div className="text-sm text-slate-500">Số lượng: {item.quantity}</div>
                                            </div>
                                            <div className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="surface rounded-3xl p-6">
                                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                                        <MapPin className="w-5 h-5" /> Địa chỉ nhận hàng
                                    </h3>
                                    <div className="text-sm text-slate-600 space-y-1">
                                        <div>{order.shippingAddress.fullName}</div>
                                        <div>{order.shippingAddress.phone}</div>
                                        <div>{order.shippingAddress.addressLine}</div>
                                        {order.shippingAddress.note && (
                                            <div className="text-slate-500">Ghi chú: {order.shippingAddress.note}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="surface rounded-3xl p-6">
                                    <h3 className="font-semibold text-slate-900 mb-3">Tóm tắt thanh toán</h3>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        <div className="flex justify-between">
                                            <span>Tạm tính</span>
                                            <span className="font-semibold text-slate-900">{formatCurrency(order.summary.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Phí vận chuyển</span>
                                            <span className="font-semibold text-slate-900">{formatCurrency(order.summary.shippingFee)}</span>
                                        </div>
                                        <div className="flex justify-between text-base border-t border-slate-200 pt-3">
                                            <span className="font-semibold">Tổng cộng</span>
                                            <span className="font-bold text-slate-900">{formatCurrency(order.summary.total)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="surface rounded-3xl p-6">
                                    <h3 className="font-semibold text-slate-900 mb-3">Lịch sử trạng thái</h3>
                                    <div className="space-y-2 text-sm text-slate-600">
                                        {order.timeline.map((entry, index) => (
                                            <div key={`${entry.status}-${index}`} className="flex justify-between">
                                                <span>{entry.label}</span>
                                                <span>{formatDate(entry.at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {isCustomer && (
                                    <div className="surface rounded-3xl p-6">
                                    <h3 className="font-semibold text-slate-900 mb-3">Đánh giá đơn hàng</h3>
                                    {orderReview ? (
                                        <div className="text-sm text-slate-600">
                                            <div>Điểm: <strong>{orderReview.rating}</strong></div>
                                            <div>{orderReview.comment || 'Không có nội dung'}</div>
                                        </div>
                                    ) : order.status !== 'DELIVERED' ? (
                                        <div className="text-sm text-slate-500">Bạn có thể đánh giá sau khi đơn hàng giao thành công.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            <select
                                                className="form-select"
                                                value={orderReviewDraft.rating}
                                                onChange={(e) => setOrderReviewDraft((prev) => ({ ...prev, rating: e.target.value }))}
                                            >
                                                {[5, 4, 3, 2, 1].map((value) => (
                                                    <option key={value} value={value}>{value} sao</option>
                                                ))}
                                            </select>
                                            <input
                                                className="form-input"
                                                value={orderReviewDraft.comment}
                                                onChange={(e) => setOrderReviewDraft((prev) => ({ ...prev, comment: e.target.value }))}
                                                placeholder="Chia sẻ cảm nhận về đơn hàng"
                                            />
                                            <button type="button" className="btn-primary justify-center" onClick={handleSubmitOrderReview}>
                                                Gửi đánh giá
                                            </button>
                                        </div>
                                    )}
                                </div>
                                )}

                                {isCustomer && order.status === 'DELIVERED' && Array.from(new Set(order.items.map((item) => item.shopId).filter(Boolean))).map((shopId) => (
                                    <div key={shopId} className="surface rounded-3xl p-6">
                                        <h3 className="font-semibold text-slate-900 mb-3">Đánh giá shop</h3>
                                        <div className="space-y-3">
                                            <div className="text-xs text-slate-500">Đánh giá cho shop của đơn hàng này</div>
                                            <select
                                                className="form-select"
                                                value={shopReviewDrafts[shopId]?.rating || 5}
                                                onChange={(e) => handleShopReviewChange(shopId, 'rating', e.target.value)}
                                            >
                                                {[5, 4, 3, 2, 1].map((value) => (
                                                    <option key={value} value={value}>{value} sao</option>
                                                ))}
                                            </select>
                                            <input
                                                className="form-input"
                                                value={shopReviewDrafts[shopId]?.comment || ''}
                                                onChange={(e) => handleShopReviewChange(shopId, 'comment', e.target.value)}
                                                placeholder="Chia sẻ cảm nhận về shop"
                                            />
                                            <button type="button" className="btn-primary justify-center" onClick={() => handleSubmitShopReview(shopId)}>
                                                Gửi đánh giá shop
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;

