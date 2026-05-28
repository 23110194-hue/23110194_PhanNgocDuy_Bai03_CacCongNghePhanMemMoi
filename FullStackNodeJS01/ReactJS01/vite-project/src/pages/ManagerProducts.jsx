import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { formatCurrency } from '../util/format';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Store, Package } from 'lucide-react';
import { getManagerProductsApi, updateManagerProductStatusApi } from '../util/api';

const MENU = [
    { key: 'vendors',  label: 'Quản lý Vendor', sub: 'Duyệt và kiểm soát shop',   icon: Store   },
    { key: 'products', label: 'Kiểm duyệt SP',  sub: 'Duyệt sản phẩm Vendor',     icon: Package },
];


const ManagerProducts = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        setLoading(true);
        const res = await getManagerProductsApi();
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
            if (auth.user?.role !== 'manager') {
                navigate('/user/profile');
                return;
            }
            fetchProducts();
        }
    }, [auth, appLoading, navigate]);

    const handleToggle = async (productId, isActive) => {
        const res = await updateManagerProductStatusApi(productId, isActive);
        if (res && !res.message) {
            setProducts((prev) => prev.map((item) => (item.id === res.id ? res : item)));
            notification.success({ message: 'Đã cập nhật sản phẩm' });
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    const handleMenuClick = (key) => {
        if (key === 'vendors') { navigate('/manager/vendors'); }
        else if (key === 'products') { navigate('/manager/products'); }
    };

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'manager') return null;

    const activeItem = MENU.find(m => m.key === 'products');

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey="products"
            setActiveKey={handleMenuClick}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle={activeItem?.label}
            topbarSub={activeItem?.sub}
        >
            <div>
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Kiểm duyệt sản phẩm</h1>
                        <p className="text-slate-500">Bật/tắt sản phẩm từ vendor.</p>
                    </div>
                    <Link to="/manager/vendors" className="btn-ghost">Quản lý Vendor</Link>
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
        </DashboardLayout>
    );
};

export default ManagerProducts;

