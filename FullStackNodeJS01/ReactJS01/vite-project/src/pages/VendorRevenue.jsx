import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getVendorRevenueApi } from '../util/api';
import { formatCurrency } from '../util/format';

const VendorRevenue = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
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

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Doanh thu shop</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Thống kê đơn hàng đã giao thành công</p>
                    </div>
                    <Link to="/vendor/orders" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>
                        Xem đơn hàng
                    </Link>
                </div>

                {loading || !data ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Tổng doanh thu</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#f97316' }}>{formatCurrency(data.revenue || 0)}</div>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px' }}>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>Đơn đã giao</div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: '#16a34a' }}>{data.totalOrders ?? 0}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorRevenue;
