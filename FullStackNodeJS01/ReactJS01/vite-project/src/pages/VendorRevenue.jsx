import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { formatCurrency } from '../util/format';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Store, Package, ShoppingBag, Star, DollarSign, Heart, TrendingUp, Award } from 'lucide-react';
import { getVendorRevenueApi } from '../util/api';

const MENU = [
    { key: 'shop',     label: 'Shop của tôi',   sub: 'Cập nhật thông tin shop',  icon: Store       },
    { key: 'products', label: 'Sản phẩm',        sub: 'Quản lý sách bán',          icon: Package     },
    { key: 'orders',   label: 'Đơn hàng',        sub: 'Xem & xử lý đơn',           icon: ShoppingBag },
    { key: 'reviews',  label: 'Đánh giá',        sub: 'Phản hồi khách hàng',       icon: Star        },
    { key: 'revenue',  label: 'Doanh thu',       sub: 'Thống kê doanh thu shop',   icon: DollarSign  },
    { key: 'favorites',label: 'Yêu thích',       sub: 'Sản phẩm được lưu',         icon: Heart       },
];

// Helper: Custom SVG Area Chart Component
const SvgAreaChart = ({ data = [] }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                Không có dữ liệu biểu đồ doanh thu.
            </div>
        );
    }

    const width = 600;
    const height = 220;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.revenue), 10000);
    // Round max value to nice ticks
    const step = maxVal > 1000000 ? 500000 : (maxVal > 200000 ? 100000 : 50000);
    const maxValRounded = Math.ceil(maxVal / step) * step || step;

    const points = data.map((d, index) => {
        const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - (d.revenue / maxValRounded) * chartHeight;
        return { x, y, date: d.date, revenue: d.revenue };
    });

    let pathD = '';
    let areaD = '';
    if (points.length > 0) {
        pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    const yTicks = [0, maxValRounded * 0.25, maxValRounded * 0.5, maxValRounded * 0.75, maxValRounded];

    const formatShortDate = (dateStr) => {
        try {
            const parts = dateStr.split('-');
            return `${parts[2]}/${parts[1]}`;
        } catch (e) {
            return dateStr;
        }
    };

    return (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: 0 }}>Xu hướng doanh thu (7 ngày qua)</h3>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Biểu đồ thống kê doanh thu hàng ngày của shop</p>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: height }}>
                <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    {/* Gridlines */}
                    {yTicks.map((tick, i) => {
                        const y = paddingTop + chartHeight - (tick / maxValRounded) * chartHeight;
                        return (
                            <g key={i}>
                                <line 
                                    x1={paddingLeft} 
                                    y1={y} 
                                    x2={width - paddingRight} 
                                    y2={y} 
                                    stroke="#f3f4f6" 
                                    strokeWidth="1" 
                                />
                                <text 
                                    x={paddingLeft - 8} 
                                    y={y + 4} 
                                    textAnchor="end" 
                                    fill="#9ca3af" 
                                    style={{ fontSize: 10, fontFamily: 'sans-serif' }}
                                >
                                    {tick >= 1000000 ? `${(tick / 1000000).toFixed(1)}M` : tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area under curve */}
                    {areaD && <path d={areaD} fill="url(#chartGradient)" />}

                    {/* Curve line */}
                    {pathD && (
                        <path 
                            d={pathD} 
                            fill="none" 
                            stroke="#f97316" 
                            strokeWidth="3" 
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    )}

                    {/* X axis labels */}
                    {points.map((p, i) => (
                        <text 
                            key={i} 
                            x={p.x} 
                            y={paddingTop + chartHeight + 18} 
                            textAnchor="middle" 
                            fill="#9ca3af" 
                            style={{ fontSize: 10, fontFamily: 'sans-serif' }}
                        >
                            {formatShortDate(p.date)}
                        </text>
                    ))}

                    {/* Horizontal/Vertical tracker lines on hover */}
                    {hoveredPoint && (
                        <line
                            x1={hoveredPoint.x}
                            y1={paddingTop}
                            x2={hoveredPoint.x}
                            y2={paddingTop + chartHeight}
                            stroke="#f97316"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            strokeOpacity="0.5"
                        />
                    )}

                    {/* Interactive dots and hover trigger zones */}
                    {points.map((p, i) => {
                        const isHovered = hoveredPoint && hoveredPoint.date === p.date;
                        return (
                            <g key={i}>
                                {isHovered && (
                                    <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r="8" 
                                        fill="#f97316" 
                                        fillOpacity="0.25" 
                                    />
                                )}
                                <circle 
                                    cx={p.x} 
                                    cy={p.y} 
                                    r={isHovered ? "5" : "4"} 
                                    fill={isHovered ? "#ea580c" : "#fff"} 
                                    stroke="#f97316" 
                                    strokeWidth="2.5" 
                                />
                                <rect
                                    x={p.x - chartWidth / (data.length * 2)}
                                    y={paddingTop}
                                    width={chartWidth / data.length}
                                    height={chartHeight}
                                    fill="transparent"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPoint(p)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip Overlay */}
                {hoveredPoint && (
                    <div style={{
                        position: 'absolute',
                        left: `${((hoveredPoint.x - paddingLeft) / chartWidth) * 80 + 10}%`,
                        top: `${hoveredPoint.y - 60}px`,
                        background: 'rgba(17, 24, 39, 0.95)',
                        color: '#fff',
                        padding: '6px 12px',
                        borderRadius: 6,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 50,
                        fontSize: 11,
                        pointerEvents: 'none',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <span style={{ fontSize: 9, color: '#d1d5db', marginBottom: 2 }}>{formatShortDate(hoveredPoint.date)}</span>
                        <span style={{ fontWeight: 700, color: '#f97316' }}>{formatCurrency(hoveredPoint.revenue)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper: Top Products Selling Component
const TopProductsList = ({ products = [] }) => {
    if (!products || products.length === 0) {
        return (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                Chưa có dữ liệu sản phẩm bán chạy.
            </div>
        );
    }

    const maxQty = Math.max(...products.map(p => p.quantity), 1);

    return (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Award style={{ width: 18, height: 18, color: '#f97316' }} />
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1f2937', margin: 0 }}>Sản phẩm bán chạy nhất</h3>
            </div>
            
            <div style={{ display: 'grid', gap: 14 }}>
                {products.map((product, i) => {
                    const pct = (product.quantity / maxQty) * 100;
                    return (
                        <div key={product.id || i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 55, borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {product.image ? (
                                    <img src={product.image} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Package style={{ width: 14, height: 14, color: '#9ca3af' }} />
                                )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#111', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={product.title}>
                                    {product.title}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>Đã bán: <strong style={{ color: '#111' }}>{product.quantity}</strong></div>
                                    <div style={{ fontSize: 11, color: '#6b7280' }}>Doanh thu: <strong style={{ color: '#f97316' }}>{formatCurrency(product.revenue)}</strong></div>
                                </div>
                                <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#f3f4f6', marginTop: 6, overflow: 'hidden' }}>
                                    <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #fdba74)', borderRadius: 2 }} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const VendorRevenue = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRevenue = async () => {
        setLoading(true);
        const res = await getVendorRevenueApi();
        setLoading(false);
        if (res && !res.message) {
            setData(res);
            return;
        }
        if (res?.message && res.message.includes('Shop')) {
            notification.warning({ message: 'Vui lòng đăng ký shop trước.' });
            navigate('/vendor/shop');
            return;
        }
        notification.error({ message: 'Không thể tải doanh thu', description: res?.message });
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
            fetchRevenue();
        }
    }, [auth, appLoading, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    const handleMenuClick = (key) => {
        if (key === 'shop') { navigate('/vendor/shop'); }
        else if (key === 'products') { navigate('/vendor/products'); }
        else if (key === 'orders') { navigate('/vendor/orders'); }
        else if (key === 'reviews') { navigate('/vendor/reviews'); }
        else if (key === 'revenue') { navigate('/vendor/revenue'); }
        else if (key === 'favorites') { navigate('/vendor/favorites'); }
    };

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    const activeItem = MENU.find(m => m.key === 'revenue');

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey="revenue"
            setActiveKey={handleMenuClick}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle={activeItem?.label}
            topbarSub={activeItem?.sub}
        >
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Doanh thu shop</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Thống kê doanh thu shop và hiệu suất bán hàng</p>
                    </div>
                    <Link to="/vendor/orders" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>
                        Xem đơn hàng
                    </Link>
                </div>

                {loading || !data ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Summary Metrics Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                            {/* Card 1: Total Revenue */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Tổng doanh thu</div>
                                    <div style={{ fontSize: 24, fontWeight: 850, color: '#f97316' }}>{formatCurrency(data.revenue || 0)}</div>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <DollarSign style={{ width: 22, height: 22, color: '#f97316' }} />
                                </div>
                            </div>

                            {/* Card 2: Delivered Orders */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Đơn đã giao</div>
                                    <div style={{ fontSize: 24, fontWeight: 850, color: '#16a34a' }}>{data.totalOrders ?? 0}</div>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShoppingBag style={{ width: 22, height: 22, color: '#16a34a' }} />
                                </div>
                            </div>

                            {/* Card 3: Average Order Value */}
                            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.01)' }}>
                                <div>
                                    <div style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Giá trị TB đơn hàng</div>
                                    <div style={{ fontSize: 24, fontWeight: 850, color: '#3b82f6' }}>{formatCurrency(data.averageOrderValue || 0)}</div>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <TrendingUp style={{ width: 22, height: 22, color: '#3b82f6' }} />
                                </div>
                            </div>
                        </div>

                        {/* Grid: Chart & Top Selling Products */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1.1fr)', gap: 20 }}>
                            <div>
                                <SvgAreaChart data={data.dailyRevenue} />
                            </div>
                            <div>
                                <TopProductsList products={data.topProducts} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VendorRevenue;
