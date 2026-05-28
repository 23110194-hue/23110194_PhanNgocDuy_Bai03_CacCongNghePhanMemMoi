import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PackageSearch, Truck, XCircle, ChevronRight, ChevronLeft, Eye, ShoppingBag, Heart, User, Clock, CheckCircle, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { cancelOrderApi, getOrdersApi } from '../util/api';
import { formatCurrency, formatDate } from '../util/format';
import DashboardLayout from '../components/layout/DashboardLayout';

const MENU = [
    { key: 'profile',   label: 'Hồ sơ của tôi',  sub: 'Thông tin tài khoản',   icon: User        },
    { key: 'orders',    label: 'Đơn hàng',         sub: 'Xem lịch sử mua hàng', icon: ShoppingBag },
    { key: 'favorites', label: 'Yêu thích',         sub: 'Sách đã lưu',           icon: Heart       },
];

const STATUS_STYLE = {
    NEW:       { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe', label: 'Đơn hàng mới' },
    CONFIRMED: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Đã xác nhận' },
    PREPARING: { bg: '#fefce8', color: '#ca8a04', border: '#fde68a', label: 'Chuẩn bị hàng' },
    SHIPPING:  { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', label: 'Đang giao hàng' },
    DELIVERED: { bg: '#f0fdf4', color: '#15803d', border: '#86efac', label: 'Đã giao thành công' },
    CANCELED:  { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Đã hủy' },
};

const StatusBadge = ({ status, label }) => {
    const s = STATUS_STYLE[status] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
    return (
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
            {label || s.label || status}
        </span>
    );
};

const PAGE_SIZE = 5;

const OrdersPage = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [page, setPage] = useState(1);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getOrdersApi();
        setLoading(false);
        if (res && !res.message) { setOrders(res.items || []); return; }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };

    useEffect(() => {
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        if (auth.user?.role !== 'user') { navigate('/'); return; }
        fetchOrders();
    }, [auth.isAuthenticated, auth.user, navigate]);

    const handleCancel = async (orderId) => {
        const res = await cancelOrderApi(orderId);
        if (res && !res.message) {
            notification.success({ message: '✅ Đã cập nhật trạng thái đơn hàng' });
            setOrders(prev => prev.map(item => item._id === res._id ? res : item));
            return;
        }
        notification.error({ message: 'Không thể hủy đơn', description: res?.message });
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    const handleMenuClick = (key) => {
        if (key === 'profile') navigate('/user/profile');
        else if (key === 'orders') navigate('/orders');
        else if (key === 'favorites') navigate('/favorites');
    };

    // Stats
    const stats = useMemo(() => ({
        total: orders.length,
        pending: orders.filter(o => ['NEW', 'CONFIRMED', 'PREPARING'].includes(o.status)).length,
        shipping: orders.filter(o => o.status === 'SHIPPING').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
    }), [orders]);

    // Filter + Paginate
    const filtered = useMemo(() =>
        filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus),
        [orders, filterStatus]
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    if (!auth.isAuthenticated) return null;
    const activeItem = MENU.find(m => m.key === 'orders');

    return (
        <DashboardLayout
            menuItems={MENU} activeKey="orders" setActiveKey={handleMenuClick}
            user={auth.user} onLogout={handleLogout}
            topbarTitle={activeItem?.label} topbarSub={activeItem?.sub}
        >
            <div>
                {/* ── Stats ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Tổng đơn',    value: stats.total,     color: '#6366f1', bg: '#eef2ff', icon: ShoppingBag },
                        { label: 'Chờ xử lý',   value: stats.pending,   color: '#f97316', bg: '#fff7ed', icon: Clock },
                        { label: 'Đang giao',   value: stats.shipping,  color: '#2563eb', bg: '#eff6ff', icon: Truck },
                        { label: 'Đã nhận',     value: stats.delivered, color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
                    ].map(({ label, value, color, bg, icon: Icon }) => (
                        <div key={label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon style={{ width: 20, height: 20, color }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>{value}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Filter tabs ── */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['ALL', ...Object.keys(STATUS_STYLE)].map(s => {
                            const count = s === 'ALL' ? orders.length : orders.filter(o => o.status === s).length;
                            return (
                                <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                                    style={{
                                        padding: '5px 14px', borderRadius: 20, border: '1.5px solid',
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        borderColor: filterStatus === s ? '#f97316' : '#e5e7eb',
                                        background: filterStatus === s ? '#fff7ed' : '#fafafa',
                                        color: filterStatus === s ? '#f97316' : '#6b7280',
                                    }}>
                                    {s === 'ALL' ? `Tất cả (${count})` : `${STATUS_STYLE[s].label} (${count})`}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={fetchOrders} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fafafa', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 600 }}>
                        <RefreshCw style={{ width: 13, height: 13 }} /> Làm mới
                    </button>
                </div>

                {/* ── Orders list ── */}
                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                        <RefreshCw style={{ width: 28, height: 28, margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                        Đang tải đơn hàng...
                    </div>
                ) : paginated.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '56px 24px', textAlign: 'center' }}>
                        <PackageSearch style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px', display: 'block' }} />
                        <div style={{ fontWeight: 700, fontSize: 16, color: '#111', marginBottom: 8 }}>Chưa có đơn hàng nào</div>
                        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Bắt đầu mua sắm để tạo đơn hàng mới.</p>
                        <Link to="/products" style={{ background: '#f97316', color: '#fff', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 14, textDecoration: 'none', display: 'inline-block' }}>
                            Mua sắm ngay
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {paginated.map(order => {
                            return (
                                <div key={order._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {/* Header row */}
                                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mã đơn hàng</div>
                                                <div style={{ fontWeight: 800, color: '#111', fontSize: 13 }}>{order.orderNumber}</div>
                                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{formatDate(order.createdAt)}</div>
                                            </div>
                                            <div style={{ width: 1, height: 36, background: '#e5e7eb' }} />
                                            <div>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Shop</div>
                                                <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{order.shopName || '—'}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <StatusBadge status={order.status} label={order.statusLabel} />
                                            <div style={{ fontWeight: 800, color: '#f97316', fontSize: 16 }}>
                                                {formatCurrency(order.summary?.total)}
                                            </div>
                                            <Link to={`/orders/${order._id}`} style={{
                                                display: 'flex', alignItems: 'center', gap: 5,
                                                fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
                                                border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', textDecoration: 'none'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                                                <Eye style={{ width: 13, height: 13 }} /> Xem chi tiết
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Items preview */}
                                    <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                                            {order.items?.slice(0, 3).map(item => (
                                                <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#374151' }}>
                                                    {item.image && <img src={item.image} alt={item.title} style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e7eb' }} />}
                                                    <span style={{ fontWeight: 500 }}>{item.title}</span>
                                                    <span style={{ color: '#9ca3af' }}>x{item.quantity}</span>
                                                </div>
                                            ))}
                                            {order.items?.length > 3 && (
                                                <div style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 8, padding: '5px 10px', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center' }}>
                                                    +{order.items.length - 3} sản phẩm
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {order.actions?.canCancel && (
                                                <button onClick={() => handleCancel(order._id)} style={{
                                                    fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
                                                    border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer'
                                                }}>
                                                    Hủy đơn ({order.actions.minutesLeftToCancel} phút)
                                                </button>
                                            )}
                                            {order.actions?.canRequestCancel && (
                                                <button onClick={() => handleCancel(order._id)} style={{
                                                    fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8,
                                                    border: '1.5px solid #fde68a', background: '#fefce8', color: '#ca8a04', cursor: 'pointer'
                                                }}>
                                                    Gửi yêu cầu hủy
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e5e7eb', background: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronLeft style={{ width: 16, height: 16 }} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button key={n} onClick={() => setPage(n)}
                                style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                    borderColor: page === n ? '#f97316' : '#e5e7eb',
                                    background: page === n ? '#f97316' : '#fff',
                                    color: page === n ? '#fff' : '#374151',
                                }}>
                                {n}
                            </button>
                        ))}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e5e7eb', background: page === totalPages ? '#f9fafb' : '#fff', color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronRight style={{ width: 16, height: 16 }} />
                        </button>
                        <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>
                            Hiển thị {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length} đơn
                        </span>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrdersPage;
