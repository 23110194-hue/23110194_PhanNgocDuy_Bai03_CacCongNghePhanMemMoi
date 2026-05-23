import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getAdminProductsApi, updateAdminProductStatusApi } from '../util/api';
import { formatCurrency } from '../util/format';

const AdminProducts = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await getAdminProductsApi();
        setLoading(false);
        if (res && !res.message) {
            setProducts(res.items || []);
            return;
        }
        notification.error({ message: 'Không thể tải sản phẩm', description: res?.message });
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
            fetchProducts();
        }
    }, [auth, appLoading, navigate]);

    const handleToggle = async (productId, isActive) => {
        const res = await updateAdminProductStatusApi(productId, isActive);
        if (res && !res.message) {
            setProducts((prev) => prev.map((item) => (item.id === res.id ? res : item)));
            notification.success({ message: 'Đã cập nhật sản phẩm' });
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
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Quản lý sản phẩm</h1>
                        <p className="text-slate-500">Bật/tắt sản phẩm trong hệ thống.</p>
                    </div>
                    <Link to="/admin/profile" className="btn-ghost">Quay lại Admin</Link>
                </div>

                {loading ? (
                    <div className="surface rounded-3xl p-10 text-center">Đang tải...</div>
                ) : products.length === 0 ? (
                    <div className="surface rounded-3xl p-10 text-center">Chưa có sản phẩm.</div>
                ) : (
                    <div className="surface rounded-3xl p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="py-2">Tên</th>
                                        <th className="py-2">Danh mục</th>
                                        <th className="py-2">Giá</th>
                                        <th className="py-2">Trạng thái</th>
                                        <th className="py-2">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {products.map((product) => (
                                        <tr key={product.id} className="border-t border-slate-100">
                                            <td className="py-3 font-medium text-slate-900">{product.title}</td>
                                            <td className="py-3">{product.category}</td>
                                            <td className="py-3">{formatCurrency(product.price)}</td>
                                            <td className="py-3">{product.isActive ? 'Đang bán' : 'Đã ẩn'}</td>
                                            <td className="py-3">
                                                <button
                                                    type="button"
                                                    className="btn-ghost"
                                                    onClick={() => handleToggle(product.id, !product.isActive)}
                                                >
                                                    {product.isActive ? 'Ẩn' : 'Mở'}
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

export default AdminProducts;

