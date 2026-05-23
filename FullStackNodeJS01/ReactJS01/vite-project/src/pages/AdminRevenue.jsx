import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getAdminRevenueApi } from '../util/api';
import { formatCurrency } from '../util/format';

const AdminRevenue = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchRevenue = async () => {
        setLoading(true);
        const res = await getAdminRevenueApi();
        setLoading(false);
        if (res && !res.message) {
            setData(res);
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
            if (auth.user?.role !== 'admin') {
                navigate('/user/profile');
                return;
            }
            fetchRevenue();
        }
    }, [auth, appLoading, navigate]);

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Doanh thu hệ thống</h1>
                        <p className="text-slate-500">Tổng doanh thu đơn hàng đã giao.</p>
                    </div>
                    <Link to="/admin/profile" className="btn-ghost">Quay lại Admin</Link>
                </div>

                {loading || !data ? (
                    <div className="surface rounded-3xl p-10 text-center">Đang tải...</div>
                ) : (
                    <div className="surface rounded-3xl p-6 grid gap-4">
                        <div>
                            <div className="text-sm text-slate-500">Tổng doanh thu</div>
                            <div className="text-3xl font-bold text-slate-900">{formatCurrency(data.totalRevenue || 0)}</div>
                        </div>
                        <div className="text-sm text-slate-600">Tổng đơn đã giao: <strong>{data.totalOrders}</strong></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRevenue;

