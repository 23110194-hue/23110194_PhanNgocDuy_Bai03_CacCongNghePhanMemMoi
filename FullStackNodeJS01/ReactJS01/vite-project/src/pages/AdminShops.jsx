import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getAdminShopsApi, updateAdminShopStatusApi } from '../util/api';

const AdminShops = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        setLoading(true);
        const res = await getAdminShopsApi();
        setLoading(false);
        if (res && !res.message) {
            setShops(res.items || []);
            return;
        }
        notification.error({ message: 'Không thể tải shop', description: res?.message });
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
            fetchShops();
        }
    }, [auth, appLoading, navigate]);

    const handleToggle = async (shopId, isActive) => {
        const res = await updateAdminShopStatusApi(shopId, isActive);
        if (res && !res.message) {
            setShops((prev) => prev.map((item) => (item._id === res._id ? res : item)));
            notification.success({ message: 'Đã cập nhật shop' });
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Quản lý shop</h1>
                        <p className="text-slate-500">Bật/tắt shop trong hệ thống.</p>
                    </div>
                    <Link to="/admin/profile" className="btn-ghost">Quay lại Admin</Link>
                </div>

                {loading ? (
                    <div className="surface rounded-3xl p-10 text-center">Đang tải...</div>
                ) : shops.length === 0 ? (
                    <div className="surface rounded-3xl p-10 text-center">Chưa có shop.</div>
                ) : (
                    <div className="surface rounded-3xl p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="py-2">Tên shop</th>
                                        <th className="py-2">Email</th>
                                        <th className="py-2">Trạng thái</th>
                                        <th className="py-2">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {shops.map((shop) => (
                                        <tr key={shop._id} className="border-t border-slate-100">
                                            <td className="py-3 font-medium text-slate-900">{shop.name}</td>
                                            <td className="py-3">{shop.ownerEmail}</td>
                                            <td className="py-3">{shop.isActive ? 'Đang hoạt động' : 'Tạm khóa'}</td>
                                            <td className="py-3">
                                                <button
                                                    type="button"
                                                    className="btn-ghost"
                                                    onClick={() => handleToggle(shop._id, !shop.isActive)}
                                                >
                                                    {shop.isActive ? 'Khóa' : 'Mở'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminShops;

