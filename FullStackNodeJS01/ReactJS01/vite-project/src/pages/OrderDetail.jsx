import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, PackageCheck, ShieldAlert, Truck, ChevronLeft, Calendar, FileText, CheckCircle2, ChevronRight, CreditCard, Clock, User, ClipboardList, Check, Package, FileSignature, CheckSquare, Home, Star } from 'lucide-react';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { cancelOrderApi, createOrderReviewApi, createShopReviewApi, createProductReviewApi, getOrderDetailApi, getOrderReviewApi, getProductReviewsApi, getShopReviewsApi } from '../util/api';
import { formatCurrency, formatDate } from '../util/format';

const steps = [
    { key: 'NEW', label: 'Đơn hàng mới', icon: FileSignature },
    { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckSquare },
    { key: 'PREPARING', label: 'Chuẩn bị hàng', icon: Package },
    { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
    { key: 'DELIVERED', label: 'Đã giao', icon: Home },
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
    const [productReviewDrafts, setProductReviewDrafts] = useState({});
    const [submittedProductReviews, setSubmittedProductReviews] = useState({});
    const [submittedShopReviews, setSubmittedShopReviews] = useState({});
    const [existingProductReviews, setExistingProductReviews] = useState({});
    const [existingShopReviews, setExistingShopReviews] = useState({});

    const uniqueShops = useMemo(() => {
        if (!order || !order.items) return [];
        const shopsMap = {};
        order.items.forEach(item => {
            if (item.shopId) {
                shopsMap[item.shopId] = true;
            }
        });
        return Object.keys(shopsMap);
    }, [order]);

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

    useEffect(() => {
        const fetchReviewsStatus = async () => {
            if (order && order.status === 'DELIVERED') {
                // Fetch product reviews status
                const prodReviewsStatus = {};
                const prodReviewContents = {};
                for (const item of order.items) {
                    try {
                        const res = await getProductReviewsApi(item.productId);
                        if (res && res.items) {
                            const customerReview = res.items.find(r => r.userEmail === order.userEmail);
                            if (customerReview) {
                                prodReviewsStatus[item.productId] = true;
                                prodReviewContents[item.productId] = customerReview;
                            }
                        }
                    } catch (e) {
                        console.error('Error loading product reviews:', e);
                    }
                }
                setSubmittedProductReviews(prodReviewsStatus);
                setExistingProductReviews(prodReviewContents);

                // Fetch shop reviews status
                const shopReviewsStatus = {};
                const shopReviewContents = {};
                for (const shopId of uniqueShops) {
                    try {
                        const res = await getShopReviewsApi(shopId);
                        if (res && res.items) {
                            const customerReview = res.items.find(r => r.userEmail === order.userEmail);
                            if (customerReview) {
                                shopReviewsStatus[shopId] = true;
                                shopReviewContents[shopId] = customerReview;
                            }
                        }
                    } catch (e) {
                        console.error('Error loading shop reviews:', e);
                    }
                }
                setSubmittedShopReviews(shopReviewsStatus);
                setExistingShopReviews(shopReviewContents);
            }
        };
        fetchReviewsStatus();
    }, [order?._id, order?.userEmail, uniqueShops]);

    const handleShopReviewChange = (shopId, field, value) => {
        setShopReviewDrafts((prev) => ({
            ...prev,
            [shopId]: { 
                ...(prev[shopId] || { rating: 5, comment: '' }),
                [field]: value 
            },
        }));
    };

    const handleSubmitShopReview = async (shopId) => {
        const draft = shopReviewDrafts[shopId] || { rating: 5, comment: '' };
        const res = await createShopReviewApi(shopId, Number(draft.rating || 5), draft.comment || '');
        if (res && !res.message) {
            notification.success({ message: 'Đã gửi đánh giá shop thành công!' });
            setSubmittedShopReviews(prev => ({ ...prev, [shopId]: true }));
            setExistingShopReviews(prev => ({ ...prev, [shopId]: res }));
            return;
        }
        notification.error({ message: 'Không thể gửi đánh giá', description: res?.message });
    };

    const handleProductReviewChange = (productId, field, value) => {
        setProductReviewDrafts((prev) => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || { rating: 5, comment: '' }),
                [field]: value,
            },
        }));
    };

    const handleSubmitProductReview = async (productId) => {
        const draft = productReviewDrafts[productId] || { rating: 5, comment: '' };
        const res = await createProductReviewApi(productId, Number(draft.rating || 5), draft.comment || '');
        if (res && !res.message) {
            notification.success({ message: 'Đã gửi đánh giá sản phẩm thành công!' });
            setSubmittedProductReviews(prev => ({ ...prev, [productId]: true }));
            setExistingProductReviews(prev => ({ ...prev, [productId]: res }));
            return;
        }
        notification.error({ message: 'Không thể gửi đánh giá sản phẩm', description: res?.message });
    };

    if (!auth.isAuthenticated) return null;

    if (loading || !order) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                    <div className="w-8 h-8 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin"></div>
                    <span className="font-medium">Đang tải chi tiết đơn hàng...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-display">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to={auth.user?.role === 'vendor' ? '/vendor/orders' : '/orders'} className="flex items-center gap-2 text-slate-600 hover:text-orange-600 font-medium transition-colors">
                        <ChevronLeft className="w-5 h-5" /> Trở về danh sách
                    </Link>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-slate-500 uppercase tracking-wide hidden sm:block">MÃ ĐƠN HÀNG:</span>
                        <span className="font-bold text-slate-900">{order.orderNumber}</span>
                        <div className="w-px h-4 bg-slate-300 mx-1 hidden sm:block"></div>
                        <span className="font-bold text-orange-600 uppercase tracking-wide hidden sm:block">{order.statusLabel}</span>
                    </div>
                </div>
            </div>

            <div className="container max-w-5xl mx-auto px-4 mt-8 mb-12">
                
                {/* BIG ENCLOSED BOX ("Hộp Bao Đồ") */}
                <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                    
                    {/* Top Section: Stepper & Actions */}
                    <div className="p-8 md:p-12 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
                        {order.status === 'CANCELED' ? (
                            <div className="flex flex-col items-center text-center max-w-lg mx-auto py-4">
                                <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6">
                                    <ShieldAlert className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">Đơn hàng đã bị hủy</h2>
                                <p className="text-slate-500">
                                    {order.cancelRequested 
                                        ? 'Yêu cầu hủy đơn hàng của bạn đã được hệ thống ghi nhận và xử lý thành công.'
                                        : 'Đơn hàng này đã bị hủy. Nếu bạn đã thanh toán, tiền sẽ được hoàn lại theo chính sách.'}
                                </p>
                            </div>
                        ) : (
                            <div className="relative max-w-4xl mx-auto py-6 px-4 sm:px-0">
                                <div className="flex items-start justify-between relative z-10">
                                    {steps.map((step, index) => {
                                        const isCompleted = index <= currentStepIndex;
                                        const isCurrent = index === currentStepIndex;
                                        return (
                                            <div key={step.key} className="flex flex-col items-center relative w-24">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 border-[5px] transition-all duration-500 ${isCompleted ? 'bg-emerald-500 border-emerald-50 text-white shadow-lg shadow-emerald-500/40' : 'bg-slate-50 border-white text-slate-300 shadow-sm'}`}>
                                                    <step.icon className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-slate-300'}`} strokeWidth={isCompleted ? 2.5 : 2} />
                                                </div>
                                                <div className={`mt-5 text-sm font-bold text-center leading-tight ${isCurrent ? 'text-emerald-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                                                    {step.label}
                                                </div>
                                                {/* Find timeline time if exists */}
                                                {isCompleted && (
                                                    <div className="text-[11px] text-slate-400 mt-2 text-center px-1 hidden sm:block font-medium">
                                                        {formatDate(order.timeline.find(t => t.status === step.key)?.at)?.split(' ')[1]} <br/>
                                                        {formatDate(order.timeline.find(t => t.status === step.key)?.at)?.split(' ')[0]}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* Line connecting */}
                                <div className="absolute top-[34px] left-14 right-14 h-[6px] bg-slate-100 -z-0 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 transition-all duration-1000 ease-in-out rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                        style={{ width: `${currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {order.cancelRequested && order.status !== 'CANCELED' && (
                            <div className="mt-10 mx-auto max-w-2xl bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-start gap-4 shadow-sm">
                                <Clock className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-bold mb-1 text-base">Đang chờ hủy đơn hàng</h4>
                                    <p className="text-sm">Bạn đã gửi yêu cầu hủy đơn hàng này. Shop đang xem xét và sẽ xác nhận trong thời gian sớm nhất.</p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {(isCustomer && (order.actions?.canCancel || order.actions?.canRequestCancel)) && (
                            <div className="mt-10 flex justify-center border-t border-slate-200 pt-8 border-dashed">
                                {order.actions?.canCancel && (
                                    <button onClick={handleCancel} className="px-8 py-3 bg-white border-2 border-rose-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-colors shadow-sm flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5" />
                                        Hủy Đơn Hàng ({order.actions.minutesLeftToCancel} phút)
                                    </button>
                                )}
                                {order.actions?.canRequestCancel && (
                                    <button onClick={handleCancel} className="px-8 py-3 bg-white border-2 border-amber-200 text-amber-700 font-bold rounded-xl hover:bg-amber-50 transition-colors shadow-sm flex items-center gap-2">
                                        <Clock className="w-5 h-5" />
                                        Gửi Yêu Cầu Hủy Đơn
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Compact Stack Layout */}
                    <div className="flex flex-col bg-slate-50/30">
                        {/* 1. Address & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 border-b border-slate-100 bg-white">
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-emerald-600">
                                    <MapPin className="w-5 h-5" />
                                    <h3 className="font-bold text-lg text-slate-900">Địa chỉ nhận hàng</h3>
                                </div>
                                <div className="text-slate-800 font-semibold mb-1">{order.shippingAddress.fullName}</div>
                                <div className="text-slate-500 text-sm mb-2">{order.shippingAddress.phone}</div>
                                <div className="text-slate-600 text-sm">{order.shippingAddress.addressLine}</div>
                                {order.shippingAddress.note && (
                                    <div className="mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                                        <span className="font-bold">Ghi chú:</span> {order.shippingAddress.note}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-indigo-600">
                                    <CreditCard className="w-5 h-5" />
                                    <h3 className="font-bold text-lg text-slate-900">Thanh toán</h3>
                                </div>
                                <div className="text-slate-800 text-sm mb-1 font-semibold">Thanh toán khi nhận hàng (COD)</div>
                                <div className="text-slate-500 text-sm">Thanh toán bằng tiền mặt khi giao hàng.</div>
                            </div>
                        </div>

                        {/* 2. Products List */}
                        <div className="p-6 md:p-8 bg-white border-b border-slate-100">
                            <div className="flex items-center gap-2 mb-6 text-slate-800">
                                <ClipboardList className="w-5 h-5" />
                                <h3 className="font-bold text-lg">Sản phẩm đã đặt</h3>
                            </div>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={item.productId} className={`flex flex-col gap-3 pb-4 ${idx !== order.items.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                        <div className="flex items-center gap-4">
                                            <img src={item.image || 'https://placehold.co/100x100?text=No+Image'} alt={item.title} className="w-20 h-20 object-contain rounded-md border border-slate-200 bg-white flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-slate-800 text-base truncate mb-1">{item.title}</h4>
                                                <div className="text-sm text-slate-500">Số lượng: x{item.quantity}</div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="font-bold text-orange-600 text-lg">{formatCurrency(item.lineTotal)}</div>
                                                <div className="text-xs text-slate-400 line-through mt-0.5">{formatCurrency(item.price * item.quantity)}</div>
                                            </div>
                                        </div>

                                        {/* Inline Product Review Form */}
                                        {isCustomer && order.status === 'DELIVERED' && (
                                            <div className="mt-2 ml-0 sm:ml-24 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-xl">
                                                <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5 text-orange-600">
                                                    <Star className="w-3.5 h-3.5 fill-currentColor" />
                                                    Đánh giá sản phẩm này
                                                </div>
                                                {submittedProductReviews[item.productId] ? (
                                                    <div className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-1.5 w-fit">
                                                        <Check className="w-3.5 h-3.5" /> Đã gửi đánh giá sản phẩm thành công!
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] text-slate-500">Đánh giá sao:</span>
                                                            <select 
                                                                className="bg-white border border-slate-200 rounded p-1 px-2 text-[11px] outline-none focus:border-orange-500 font-medium"
                                                                value={productReviewDrafts[item.productId]?.rating ?? 5} 
                                                                onChange={e => handleProductReviewChange(item.productId, 'rating', Number(e.target.value))}
                                                            >
                                                                {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Sao</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <input 
                                                                type="text" 
                                                                className="flex-1 bg-white border border-slate-200 rounded p-2 text-xs outline-none focus:border-orange-500" 
                                                                placeholder="Nhận xét về sản phẩm..."
                                                                value={productReviewDrafts[item.productId]?.comment ?? ''} 
                                                                onChange={e => handleProductReviewChange(item.productId, 'comment', e.target.value)}
                                                            />
                                                            <button 
                                                                onClick={() => handleSubmitProductReview(item.productId)}
                                                                className="bg-orange-500 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-orange-600 transition flex-shrink-0"
                                                            >
                                                                Gửi đánh giá
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Order Summary & Timeline */}
                        <div className="grid grid-cols-1 md:grid-cols-2 p-6 md:p-8 bg-white">
                            <div className="mb-6 md:mb-0 pr-0 md:pr-8">
                                <div className="flex items-center gap-2 mb-4 text-sky-500">
                                    <Clock className="w-5 h-5" />
                                    <h3 className="font-bold text-lg text-slate-900">Lịch trình</h3>
                                </div>
                                <div className="space-y-4 border-l-2 border-slate-100 ml-2 pl-4 py-2">
                                    {order.timeline.slice().reverse().map((entry, index) => (
                                        <div key={`${entry.status}-${index}`} className="relative">
                                            <div className={`absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full ${index === 0 ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                            <div className={`font-semibold text-sm ${index === 0 ? 'text-orange-600' : 'text-slate-700'}`}>{entry.label}</div>
                                            <div className="text-xs text-slate-400">{formatDate(entry.at)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-orange-50/30 rounded-xl p-6 border border-orange-100 flex flex-col justify-center">
                                <div className="space-y-3 text-sm text-slate-600">
                                    <div className="flex justify-between"><span>Tổng tiền hàng:</span><span className="font-medium text-slate-800">{formatCurrency(order.summary.subtotal)}</span></div>
                                    <div className="flex justify-between"><span>Phí vận chuyển:</span><span className="font-medium text-slate-800">{formatCurrency(order.summary.shippingFee)}</span></div>
                                </div>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-orange-200">
                                    <span className="font-bold text-slate-900 text-lg">Thành tiền:</span>
                                    <span className="font-black text-orange-600 text-2xl">{formatCurrency(order.summary.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* 4. Review Section (For Customer, Vendor, and Admin) */}
                        {(isCustomer || order.status === 'DELIVERED') && (
                            <div className="p-6 md:p-8 border-t border-slate-100 bg-white">
                                {isCustomer && (
                                    <>
                                        <div className="flex items-center gap-2 mb-6 text-amber-500">
                                            <Star className="w-5 h-5" fill="currentColor" />
                                            <h3 className="font-bold text-lg text-slate-900">Đánh giá của bạn</h3>
                                        </div>
                                        {orderReview ? (
                                            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-sm">
                                                <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Đánh giá đơn hàng:</div>
                                                <div className="flex items-center gap-2 mb-2 font-bold text-amber-500">
                                                    {orderReview.rating} <Star className="w-4 h-4" fill="currentColor" />
                                                </div>
                                                <div className="text-slate-700 italic">"{orderReview.comment || 'Không có nhận xét'}"</div>
                                            </div>
                                        ) : order.status === 'DELIVERED' ? (
                                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                <div className="mb-4">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Đánh giá sao cho đơn hàng</label>
                                                    <select className="w-full bg-white border border-slate-200 rounded p-2.5 text-sm outline-none focus:border-orange-500" value={orderReviewDraft.rating} onChange={e => setOrderReviewDraft(p => ({...p, rating: e.target.value}))}>
                                                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Sao</option>)}
                                                    </select>
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét</label>
                                                    <textarea className="w-full bg-white border border-slate-200 rounded p-3 text-sm outline-none focus:border-orange-500 resize-none h-24" placeholder="Nhận xét của bạn..." value={orderReviewDraft.comment} onChange={e => setOrderReviewDraft(p => ({...p, comment: e.target.value}))}></textarea>
                                                </div>
                                                <button onClick={handleSubmitOrderReview} className="bg-orange-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-orange-600 transition">Gửi đánh giá đơn hàng</button>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-500 bg-slate-50 p-4 rounded-lg text-center border border-dashed border-slate-300">
                                                Tính năng đánh giá sẽ mở sau khi bạn nhận được hàng.
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Shop Reviews Display / Form */}
                                {order.status === 'DELIVERED' && uniqueShops.length > 0 && (
                                    <div className="mt-8 border-t border-slate-100 pt-6">
                                        <div className="flex items-center gap-2 mb-6 text-orange-500">
                                            <Package className="w-5 h-5" />
                                            <h3 className="font-bold text-lg text-slate-900">
                                                {isCustomer ? 'Đánh giá cửa hàng' : 'Đánh giá cửa hàng của khách'}
                                            </h3>
                                        </div>
                                        <div className="space-y-6">
                                            {uniqueShops.map(shopId => (
                                                <div key={shopId} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                                    {submittedShopReviews[shopId] ? (
                                                        <div className="bg-white p-4 rounded-lg border border-slate-200 text-sm">
                                                            <div className="flex items-center gap-1.5 mb-2 font-bold text-amber-500">
                                                                {existingShopReviews[shopId]?.rating} <Star className="w-4 h-4 fill-currentColor" />
                                                            </div>
                                                            <div className="text-slate-700 italic">"{existingShopReviews[shopId]?.comment || 'Không có nhận xét'}"</div>
                                                        </div>
                                                    ) : isCustomer ? (
                                                        <div>
                                                            <div className="mb-4">
                                                                <label className="block text-sm font-bold text-slate-700 mb-2">Đánh giá sao cho cửa hàng</label>
                                                                <select 
                                                                    className="w-full bg-white border border-slate-200 rounded p-2.5 text-sm outline-none focus:border-orange-500 font-medium" 
                                                                    value={shopReviewDrafts[shopId]?.rating ?? 5} 
                                                                    onChange={e => handleShopReviewChange(shopId, 'rating', Number(e.target.value))}
                                                                >
                                                                    {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Sao</option>)}
                                                                </select>
                                                            </div>
                                                            <div className="mb-4">
                                                                <label className="block text-sm font-bold text-slate-700 mb-2">Nhận xét về cửa hàng</label>
                                                                <textarea 
                                                                    className="w-full bg-white border border-slate-200 rounded p-3 text-sm outline-none focus:border-orange-500 resize-none h-24" 
                                                                    placeholder="Nhận xét của bạn..." 
                                                                    value={shopReviewDrafts[shopId]?.comment ?? ''} 
                                                                    onChange={e => handleShopReviewChange(shopId, 'comment', e.target.value)}
                                                                ></textarea>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleSubmitShopReview(shopId)} 
                                                                className="bg-orange-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-orange-600 transition"
                                                            >
                                                                Gửi đánh giá cửa hàng
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-slate-400 italic">Khách hàng chưa đánh giá cửa hàng này.</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
