import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorOrdersApi, updateVendorOrderStatusApi } from '../util/api';
import { formatCurrency, formatDate } from '../util/format';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Store, Package, ShoppingBag, Star, DollarSign, Heart, Eye, ChevronLeft, ChevronRight, RefreshCw, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';

const MENU = [
    { key: 'shop',      label: 'Shop của tôi',  sub: 'Cập nhật thông tin shop',  icon: Store       },
    { key: 'products',  label: 'Sản phẩm',       sub: 'Quản lý sách bán',          icon: Package     },
    { key: 'orders',    label: 'Đơn hàng',       sub: 'Xem & xử lý đơn',           icon: ShoppingBag },
    { key: 'reviews',   label: 'Đánh giá',       sub: 'Phản hồi khách hàng',       icon: Star        },
    { key: 'revenue',   label: 'Doanh thu',      sub: 'Thống kê doanh thu shop',   icon: DollarSign  },
    { key: 'favorites', label: 'Yêu thích',      sub: 'Sản phẩm được lưu',         icon: Heart       },
];

const statusLabels = {
    NEW:       'Đơn hàng mới',
    CONFIRMED: 'Đã xác nhận',
    PREPARING: 'Chuẩn bị hàng',
    SHIPPING:  'Đang giao hàng',
    DELIVERED: 'Đã giao thành công',
    CANCELED:  'Hủy đơn hàng',
};

const statusColors = {
    NEW:       { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    CONFIRMED: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    PREPARING: { bg: '#fefce8', text: '#a16207', border: '#fde68a' },
    SHIPPING:  { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    DELIVERED: { bg: '#f0fdf4', text: '#166534', border: '#86efac' },
    CANCELED:  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

const nextStatusMap = {
    NEW:       ['CONFIRMED', 'CANCELED'],
    CONFIRMED: ['PREPARING', 'CANCELED'],
    PREPARING: ['SHIPPING', 'CANCELED'],
    SHIPPING:  ['DELIVERED'],
    DELIVERED: [],
    CANCELED:  [],
};

const PAGE_SIZE = 5;

const StatusBadge = ({ status }) => {
    const label = statusLabels[status] || status;
    const color = statusColors[status] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
    return (
        <span style={{
            fontSize: 11, fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
            background: color.bg, color: color.text, border: `1px solid ${color.border}`,
        }}>{label}</span>
    );
};

const VendorOrders = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusDrafts, setStatusDrafts] = useState({});
    const [noteDrafts, setNoteDrafts] = useState({});
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [page, setPage] = useState(1);

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getVendorOrdersApi();
        setLoading(false);
        if (res && !res.message) { setOrders(res.orders || []); return; }
        if (res?.message?.includes('Shop')) {
            notification.warning({ message: 'Vui lòng đăng ký shop trước.' });
            navigate('/vendor/shop'); return;
        }
        notification.error({ message: 'Không thể tải đơn hàng', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) { navigate('/login'); return; }
            if (auth.user?.role !== 'vendor') { navigate('/user/profile'); return; }
            fetchOrders();
        }
    }, [auth, appLoading, navigate]);

    const handleStatusChange = (orderId, status) => setStatusDrafts(p => ({ ...p, [orderId]: status }));
    const handleNoteChange = (orderId, note) => setNoteDrafts(p => ({ ...p, [orderId]: note }));

    const handleUpdateStatus = async (orderId) => {
        const status = statusDrafts[orderId];
        if (!status) { notification.warning({ message: 'Vui lòng chọn trạng thái mới.' }); return; }
        const res = await updateVendorOrderStatusApi(orderId, status, noteDrafts[orderId] || '');
        if (res && !res.message) {
            notification.success({ message: '✅ Cập nhật trạng thái thành công.' });
            fetchOrders();
            setStatusDrafts(p => ({ ...p, [orderId]: '' }));
            setNoteDrafts(p => ({ ...p, [orderId]: '' }));
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    const handleMenuClick = (key) => { if (key !== 'orders') navigate(`/vendor/${key}`); };
    const handleLogout = () => {
        setAuth({ isAuthenticated: false, user: null, token: null });
        localStorage.removeItem('token');
        navigate('/login');
    };

    // Filter + Paginate
    const filtered = useMemo(() =>
        filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus),
        [orders, filterStatus]
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    // Stats
    const stats = useMemo(() => ({
        total: orders.length,
        new: orders.filter(o => o.status === 'NEW').length,
        shipping: orders.filter(o => o.status === 'SHIPPING').length,
        delivered: orders.filter(o => o.status === 'DELIVERED').length,
    }), [orders]);

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    const activeItem = MENU.find(m => m.key === 'orders');

    return (
        <DashboardLayout
            menuItems={MENU} activeKey="orders" setActiveKey={handleMenuClick}
            user={auth.user} onLogout={handleLogout}
            topbarTitle={activeItem?.label} topbarSub={activeItem?.sub}
        >
            <div>
                {/* ── Stats row ── */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                        { label: 'Tổng đơn',   value: stats.total,     color: '#6366f1', bg: '#eef2ff', icon: ShoppingBag },
                        { label: 'Đơn mới',    value: stats.new,       color: '#f97316', bg: '#fff7ed', icon: Clock },
                        { label: 'Đang giao',  value: stats.shipping,  color: '#2563eb', bg: '#eff6ff', icon: Truck },
                        { label: 'Đã giao',    value: stats.delivered, color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
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

                {/* ── Filter tabs + Refresh ── */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['ALL', ...Object.keys(statusLabels)].map(s => (
                            <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                                style={{
                                    padding: '5px 14px', borderRadius: 20, border: '1.5px solid',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    borderColor: filterStatus === s ? '#f97316' : '#e5e7eb',
                                    background: filterStatus === s ? '#fff7ed' : '#fafafa',
                                    color: filterStatus === s ? '#f97316' : '#6b7280',
                                }}>
                                {s === 'ALL' ? `Tất cả (${orders.length})` : `${statusLabels[s]} (${orders.filter(o => o.status === s).length})`}
                            </button>
                        ))}
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
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 56, textAlign: 'center', color: '#9ca3af' }}>
                        <ShoppingBag style={{ width: 36, height: 36, margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Không có đơn hàng nào</div>
                        <div style={{ fontSize: 13 }}>Thử chọn bộ lọc khác</div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {paginated.map((order) => {
                            const nextStatuses = nextStatusMap[order.status] || [];
                            return (
                                <div key={order._id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {/* Order header */}
                                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: '#fafafa' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Mã đơn</div>
                                                <div style={{ fontWeight: 800, color: '#111', fontSize: 13 }}>{order.orderNumber}</div>
                                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{formatDate(order.createdAt)}</div>
                                            </div>
                                            <div style={{ width: 1, height: 36, background: '#e5e7eb' }} />
                                            <div>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>Khách hàng</div>
                                                <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{order.userName || order.userEmail}</div>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{order.userEmail}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <StatusBadge status={order.status} />
                                            <div style={{ fontWeight: 800, color: '#f97316', fontSize: 15 }}>{formatCurrency(order.shopSummary?.subtotal || 0)}</div>
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

                                    {/* Status update row */}
                                    {nextStatuses.length > 0 && (
                                        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap' }}>Chuyển sang:</span>
                                                <select
                                                    value={statusDrafts[order._id] || ''}
                                                    onChange={e => handleStatusChange(order._id, e.target.value)}
                                                    style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', fontSize: 13, outline: 'none', minWidth: 180 }}
                                                >
                                                    <option value="">Chọn trạng thái mới</option>
                                                    {nextStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                                                </select>
                                            </div>
                                            <input
                                                type="text"
                                                value={noteDrafts[order._id] || ''}
                                                onChange={e => handleNoteChange(order._id, e.target.value)}
                                                style={{ flex: 1, minWidth: 180, border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '6px 12px', fontSize: 13, outline: 'none' }}
                                                placeholder="Ghi chú (VD: Đã gọi xác nhận đơn...)"
                                            />
                                            <button
                                                onClick={() => handleUpdateStatus(order._id)}
                                                style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#ea6c04'}
                                                onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
                                            >
                                                Cập nhật
                                            </button>
                                        </div>
                                    )}
                                    {nextStatuses.length === 0 && (
                                        <div style={{ padding: '10px 20px' }}>
                                            <span style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                                                {order.status === 'DELIVERED' ? '✅ Đơn đã giao thành công, không thể thay đổi.' : '❌ Đơn đã bị hủy.'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20 }}>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e5e7eb', background: page === 1 ? '#f9fafb' : '#fff', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
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
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px solid #e5e7eb', background: page === totalPages ? '#f9fafb' : '#fff', color: page === totalPages ? '#d1d5db' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
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

export default VendorOrders;
