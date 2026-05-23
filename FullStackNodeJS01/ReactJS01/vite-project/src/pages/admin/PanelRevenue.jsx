import React, { useEffect, useState } from 'react';
import { notification } from 'antd';
import { getAdminRevenueApi } from '../../util/api';
import { formatCurrency } from '../../util/format';
import { TrendingUp, ShoppingBag, DollarSign, BarChart3, RefreshCw } from 'lucide-react';

const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sub, subColor }) => (
    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon style={{ width: 18, height: 18, color: iconColor }} />
            </div>
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>{label}</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: subColor, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>{sub}</div>
    </div>
);

const PanelRevenue = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRevenue = async () => {
        setLoading(true);
        const res = await getAdminRevenueApi();
        setLoading(false);
        if (res && !res.message) { setData(res); return; }
        notification.error({ message: 'Không thể tải doanh thu', description: res?.message });
    };

    useEffect(() => { fetchRevenue(); }, []);

    if (loading) return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>
            Đang tải dữ liệu...
        </div>
    );

    if (!data) return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>
            Không có dữ liệu.
        </div>
    );

    const avgOrder = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Thống kê từ đơn hàng đã giao (DELIVERED)</span>
                <button onClick={fetchRevenue} style={{ fontSize: 13, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <RefreshCw style={{ width: 13, height: 13 }} /> Làm mới
                </button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                <StatCard
                    icon={DollarSign}
                    iconBg="#f0fdf4" iconColor="#16a34a"
                    label="Tổng doanh thu"
                    value={formatCurrency(data.totalRevenue || 0)}
                    sub={<><TrendingUp style={{ width: 11, height: 11 }} /> Từ đơn hàng đã giao</>}
                    subColor="#16a34a"
                />
                <StatCard
                    icon={ShoppingBag}
                    iconBg="#eff6ff" iconColor="#3b82f6"
                    label="Đơn đã giao"
                    value={data.totalOrders ?? 0}
                    sub="Tổng đơn hàng thành công"
                    subColor="#3b82f6"
                />
                <StatCard
                    icon={BarChart3}
                    iconBg="#faf5ff" iconColor="#7c3aed"
                    label="Trung bình / đơn"
                    value={formatCurrency(avgOrder)}
                    sub="Giá trị trung bình mỗi đơn"
                    subColor="#7c3aed"
                />
            </div>

            {/* Summary */}
            <div style={{
                background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb',
                padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24,
                flexWrap: 'wrap',
            }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Tổng kết hệ thống</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#f97316' }}>{formatCurrency(data.totalRevenue || 0)}</div>
                    <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>
                        Tích lũy từ{' '}
                        <strong style={{ color: '#111' }}>{data.totalOrders}</strong>
                        {' '}đơn hàng giao thành công trên toàn hệ thống BookStore
                    </div>
                </div>

                {/* Visual divider + avg */}
                <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 24, minWidth: 160 }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Giá trị trung bình</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(avgOrder)}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>/ mỗi đơn hàng</div>
                </div>

                {/* Progress-like bar */}
                <div style={{ width: '100%', marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>
                        <span>Tỷ lệ hoàn thành</span>
                        <span>{data.totalOrders} đơn</span>
                    </div>
                    <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 99,
                            background: 'linear-gradient(90deg, #f97316, #ea580c)',
                            width: data.totalOrders > 0 ? `${Math.min((data.totalOrders / Math.max(data.totalOrders, 100)) * 100, 100)}%` : '0%',
                            transition: 'width 0.8s ease',
                        }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PanelRevenue;
