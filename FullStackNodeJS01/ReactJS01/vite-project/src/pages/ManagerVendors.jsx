import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getManagerVendorsApi, updateManagerVendorStatusApi } from '../util/api';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Store, Package } from 'lucide-react';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 10;


const MENU = [
    { key: 'vendors',  label: 'Quản lý Vendor', sub: 'Duyệt và kiểm soát shop',   icon: Store   },
    { key: 'products', label: 'Kiểm duyệt SP',  sub: 'Duyệt sản phẩm Vendor',     icon: Package },
];

const ManagerVendors = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [activeKey, setActiveKey] = useState('vendors');
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchVendors = async () => {
        setLoading(true);
        const res = await getManagerVendorsApi();
        setLoading(false);
        if (res && !res.message) { setVendors(res.items || []); return; }
        notification.error({ message: 'Không thể tải vendor', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) { navigate('/login'); return; }
            if (auth.user?.role !== 'manager') { navigate('/user/profile'); return; }
            fetchVendors();
        }
    }, [auth, appLoading, navigate]);

    const totalPages = Math.ceil(vendors.length / PAGE_SIZE);
    const paged = useMemo(() => vendors.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [vendors, page]);

    const handleToggle = async (shopId, isActive) => {
        const res = await updateManagerVendorStatusApi(shopId, isActive);
        if (res && !res.message) {
            setVendors(prev => prev.map(s => s._id === res._id ? res : s));
            notification.success({ message: isActive ? 'Đã mở shop' : 'Đã khóa shop' });
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    if (appLoading || !auth.isAuthenticated || auth.user?.role !== 'manager') return null;

    const activeItem = MENU.find(m => m.key === activeKey);

    const renderContent = () => {
        if (activeKey === 'products') { navigate('/manager/products'); return null; }

        if (loading) return <div style={{ color: '#9ca3af', padding: 20 }}>Đang tải...</div>;
        if (vendors.length === 0) return (
            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                Chưa có vendor nào trong hệ thống.
            </div>
        );

        return (
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{vendors.length} shop • Trang {page}/{totalPages}</span>
                    <button onClick={fetchVendors} style={{ fontSize: 13, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        ↻ Làm mới
                    </button>
                </div>

                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                    {['Tên shop', 'Email chủ', 'Trạng thái', ''].map(h => (
                                        <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {paged.map((shop, i) => (
                                    <tr key={shop._id} style={{ borderBottom: i < paged.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, color: '#111' }}>{shop.name}</td>
                                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{shop.ownerEmail}</td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                                                background: shop.isActive ? '#f0fdf4' : '#fef2f2',
                                                color: shop.isActive ? '#16a34a' : '#dc2626',
                                                border: `1px solid ${shop.isActive ? '#bbf7d0' : '#fecaca'}`,
                                            }}>
                                                {shop.isActive ? '● Hoạt động' : '● Tạm khóa'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <button
                                                onClick={() => handleToggle(shop._id, !shop.isActive)}
                                                style={{
                                                    fontSize: 12, fontWeight: 600, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', border: '1px solid',
                                                    background: shop.isActive ? '#fef2f2' : '#f0fdf4',
                                                    color: shop.isActive ? '#dc2626' : '#16a34a',
                                                    borderColor: shop.isActive ? '#fecaca' : '#bbf7d0',
                                                }}>
                                                {shop.isActive ? 'Khóa' : 'Mở'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo(0,0); }} />
            </div>
        );
    };

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
            {renderContent()}
        </DashboardLayout>
    );
};

export default ManagerVendors;
