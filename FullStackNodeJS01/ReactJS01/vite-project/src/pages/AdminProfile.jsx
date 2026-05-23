import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ShoppingBag, Users, Package, Store, BarChart3 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';

const PanelOrders   = lazy(() => import('./admin/PanelOrders'));
const PanelUsers    = lazy(() => import('./admin/PanelUsers'));
const PanelProducts = lazy(() => import('./admin/PanelProducts'));
const PanelShops    = lazy(() => import('./admin/PanelShops'));
const PanelRevenue  = lazy(() => import('./admin/PanelRevenue'));

const MENU = [
    { key: 'orders',   label: 'Đơn hàng',   sub: 'Quản lý & cập nhật trạng thái', icon: ShoppingBag },
    { key: 'users',    label: 'Người dùng',  sub: 'Phân quyền tài khoản',           icon: Users       },
    { key: 'products', label: 'Sản phẩm',    sub: 'Bật / tắt sản phẩm',             icon: Package     },
    { key: 'shops',    label: 'Shop',         sub: 'Khóa / mở shop',                 icon: Store       },
    { key: 'revenue',  label: 'Doanh thu',   sub: 'Thống kê hệ thống',              icon: BarChart3   },
];

const PANEL_MAP = {
    orders: PanelOrders, users: PanelUsers,
    products: PanelProducts, shops: PanelShops, revenue: PanelRevenue,
};

const AdminProfile = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [activeKey, setActiveKey] = useState('orders');

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) navigate('/login');
            else if (auth.user?.role !== 'admin') navigate('/user/profile');
        }
    }, [auth, appLoading, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    if (appLoading || auth.user?.role !== 'admin') return null;

    const ActivePanel = PANEL_MAP[activeKey];
    const activeItem  = MENU.find(m => m.key === activeKey);

    return (
        <DashboardLayout
            menuItems={MENU}
            activeKey={activeKey}
            setActiveKey={setActiveKey}
            user={auth.user}
            onLogout={handleLogout}
            topbarTitle={activeItem?.label}
            topbarSub={activeItem?.sub}
        >
            <Suspense fallback={<div style={{ color: '#9ca3af', padding: 20 }}>Đang tải...</div>}>
                <ActivePanel />
            </Suspense>
        </DashboardLayout>
    );
};

export default AdminProfile;
