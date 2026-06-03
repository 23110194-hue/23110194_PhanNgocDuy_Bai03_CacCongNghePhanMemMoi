import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import {
    createVendorProductApi,
    getVendorProductsApi,
    removeVendorProductApi,
    updateVendorProductApi,
} from '../util/api';
import { formatCurrency } from '../util/format';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Store, Package, ShoppingBag, Star, DollarSign, Heart, LayoutGrid, List } from 'lucide-react';

const MENU = [
    { key: 'shop',     label: 'Shop của tôi',   sub: 'Cập nhật thông tin shop',  icon: Store       },
    { key: 'products', label: 'Sản phẩm',        sub: 'Quản lý sách bán',          icon: Package     },
    { key: 'orders',   label: 'Đơn hàng',        sub: 'Xem & xử lý đơn',           icon: ShoppingBag },
    { key: 'reviews',  label: 'Đánh giá',        sub: 'Phản hồi khách hàng',       icon: Star        },
    { key: 'revenue',  label: 'Doanh thu',       sub: 'Thống kê doanh thu shop',   icon: DollarSign  },
    { key: 'favorites',label: 'Yêu thích',       sub: 'Sản phẩm được lưu',         icon: Heart       },
];


const initialForm = {
    title: '',
    author: '',
    category: '',
    price: '',
    discountPercent: 0,
    stock: 0,
    images: '',
    tags: '',
    description: '',
    isNew: false,
    isHot: false,
    isActive: true,
};

const VendorProducts = () => {
    const navigate = useNavigate();
    const { auth, setAuth, appLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [shop, setShop] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    const fetchProducts = async () => {
        setLoading(true);
        const res = await getVendorProductsApi();
        setLoading(false);
        if (res && !res.message) {
            setProducts(res.products || []);
            setShop(res.shop || null);
            return;
        }
        if (res?.message && res.message.includes('Shop')) {
            notification.warning({ message: 'Vui lòng đăng ký shop trước.' });
            navigate('/vendor/shop');
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
            if (auth.user?.role !== 'vendor') {
                navigate('/user/profile');
                return;
            }
            fetchProducts();
        }
    }, [auth, appLoading, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form };
        const res = editingId
            ? await updateVendorProductApi(editingId, payload)
            : await createVendorProductApi(payload);

        if (res && !res.message) {
            notification.success({ message: editingId ? 'Đã cập nhật sản phẩm' : 'Đã tạo sản phẩm' });
            setForm(initialForm);
            setEditingId(null);
            setShowForm(false);
            fetchProducts();
            return;
        }
        notification.error({ message: 'Không thể lưu sản phẩm', description: res?.message });
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setShowForm(true);
        setForm({
            title: product.title || '',
            author: product.author || '',
            category: product.category || '',
            price: product.price || '',
            discountPercent: product.discountPercent || 0,
            stock: product.stock || 0,
            images: (product.images || []).join(', '),
            tags: (product.tags || []).join(', '),
            description: product.description || '',
            isNew: Boolean(product.isNew),
            isHot: Boolean(product.isHot),
            isActive: product.isActive !== false,
        });
    };

    const handleDeactivate = async (productId) => {
        const res = await removeVendorProductApi(productId);
        if (res && !res.message) {
            notification.success({ message: 'Đã ẩn sản phẩm' });
            fetchProducts();
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    const handleReset = () => {
        setEditingId(null);
        setForm(initialForm);
        setShowForm(false);
    };

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
                {/* Product List Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', margin: 0 }}>Danh sách sản phẩm</h2>
                    {!showForm && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 7, padding: 2, background: '#fff' }}>
                                <button type="button" onClick={() => setViewMode('grid')} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 5, border: 'none', background: viewMode === 'grid' ? '#fff7ed' : 'transparent', color: viewMode === 'grid' ? '#f97316' : '#6b7280', cursor: 'pointer' }} title="Hiển thị dạng lưới">
                                    <LayoutGrid style={{ width: 14, height: 14 }} />
                                </button>
                                <button type="button" onClick={() => setViewMode('list')} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', borderRadius: 5, border: 'none', background: viewMode === 'list' ? '#fff7ed' : 'transparent', color: viewMode === 'list' ? '#f97316' : '#6b7280', cursor: 'pointer' }} title="Hiển thị dạng bảng">
                                    <List style={{ width: 14, height: 14 }} />
                                </button>
                            </div>
                            <button onClick={() => setShowForm(true)} style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                + Thêm sản phẩm mới
                            </button>
                        </div>
                    )}
                </div>

                {/* Form (Hidden by default) */}
                {showForm && (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 24 }}>
                        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 16 }}>{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Tên sản phẩm *</label>
                                    <input name="title" value={form.title} onChange={handleChange} required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Tác giả</label>
                                    <input name="author" value={form.author} onChange={handleChange} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Danh mục *</label>
                                    <input name="category" value={form.category} onChange={handleChange} required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Giá *</label>
                                    <input name="price" value={form.price} onChange={handleChange} type="number" required style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Giảm giá (%)</label>
                                    <input name="discountPercent" value={form.discountPercent} onChange={handleChange} type="number" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, alignItems: 'end' }}>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Tồn kho</label>
                                    <input name="stock" value={form.stock} onChange={handleChange} type="number" style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div style={{ display: 'flex', gap: 16, paddingBottom: 4 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                                        <input type="checkbox" name="isNew" checked={form.isNew} onChange={handleChange} /> Mới
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
                                        <input type="checkbox" name="isHot" checked={form.isHot} onChange={handleChange} /> Hot
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Ảnh (URL cách nhau bằng dấu phẩy)</label>
                                <input name="images" value={form.images} onChange={handleChange} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Tags (cách nhau bằng dấu phẩy)</label>
                                <input name="tags" value={form.tags} onChange={handleChange} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Mô tả</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button type="submit" style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 7, padding: '9px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                                    {editingId ? 'Lưu cập nhật' : 'Thêm sản phẩm'}
                                </button>
                                <button type="button" onClick={handleReset} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                                    Hủy bỏ
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Products List/Grid View */}
                {!showForm && (
                    <>
                        {loading ? (
                            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải sản phẩm...</div>
                        ) : products.length === 0 ? (
                            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>
                                <div style={{ marginBottom: 12 }}>Chưa có sản phẩm nào.</div>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* Grid view of beautiful cards */
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
                                {products.map((product) => {
                                    const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
                                    const hasDiscount = (product.discountPercent || 0) > 0;
                                    return (
                                        <div key={product.id} className="card" style={{
                                            background: '#fff',
                                            borderRadius: 12,
                                            border: '1px solid #e5e7eb',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            position: 'relative',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                                            transition: 'transform 0.15s, box-shadow 0.15s'
                                        }}>
                                            {/* Image & aspect ratio of 140% */}
                                            <div style={{ position: 'relative', paddingTop: '140%', background: '#f9fafb', overflow: 'hidden' }}>
                                                <img
                                                    src={product.images?.length > 0 ? product.images[0] : 'https://placehold.co/300x420?text=No+Image'}
                                                    alt={product.title}
                                                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                                {/* Badges */}
                                                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    {product.isNew && (
                                                        <span style={{ background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>MỚI</span>
                                                    )}
                                                    {hasDiscount && (
                                                        <span style={{ background: '#f97316', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>
                                                            -{product.discountPercent}%
                                                        </span>
                                                    )}
                                                    {!product.isActive && (
                                                        <span style={{ background: '#9ca3af', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>ĐÃ ẨN</span>
                                                    )}
                                                    {product.stock <= 0 && (
                                                        <span style={{ background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>HẾT HÀNG</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{product.category}</div>
                                                <div style={{
                                                    fontSize: 13, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.4, flex: 1,
                                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                }} title={product.title}>
                                                    {product.title}
                                                </div>
                                                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{product.author}</div>

                                                {/* Price & Stock */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                                    <div>
                                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#f97316' }}>
                                                            {formatCurrency(finalPrice)}
                                                        </div>
                                                        {hasDiscount && (
                                                            <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>
                                                                {formatCurrency(product.price)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: product.stock > 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                                                        {product.stock > 0 ? `Còn: ${product.stock}` : 'Hết hàng'}
                                                    </div>
                                                </div>

                                                {/* Sold count */}
                                                <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    🔥 Đã bán: {product.sold || 0}
                                                </div>

                                                {/* Action buttons at the bottom of the card */}
                                                <div style={{ display: 'flex', gap: 6, marginTop: 12, borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                                                    <button type="button" onClick={() => handleEdit(product)} style={{ flex: 1, fontSize: 12, fontWeight: 600, padding: '6px 0', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
                                                        onMouseLeave={e => e.currentTarget.style.background = '#f9fafb'}>
                                                        Sửa
                                                    </button>
                                                    <button type="button" onClick={() => handleDeactivate(product.id)} style={{ flex: 1, fontSize: 12, fontWeight: 600, padding: '6px 0', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', transition: 'background 0.15s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}>
                                                        {product.isActive ? 'Ẩn' : 'Hiện'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* List/Table View */
                            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                                {['Tên', 'Danh mục', 'Giá', 'Tồn kho', 'Trạng thái', 'Hành động'].map(h => (
                                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product, i) => {
                                                const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);
                                                return (
                                                    <tr key={product.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                                        <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                                <div style={{ width: 42, height: 56, borderRadius: 4, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f9fafb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    {product.images?.[0] ? (
                                                                        <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                    ) : (
                                                                        <Package style={{ width: 16, height: 16, color: '#9ca3af' }} />
                                                                    )}
                                                                </div>
                                                                <div style={{ minWidth: 0 }}>
                                                                    <div style={{ fontWeight: 700, color: '#111', fontSize: 13, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 220 }} title={product.title}>
                                                                        {product.title}
                                                                    </div>
                                                                    {product.author && (
                                                                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 220 }}>
                                                                            Tác giả: {product.author}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#6b7280', verticalAlign: 'middle' }}>{product.category}</td>
                                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                            <div style={{ fontWeight: 700, color: '#f97316' }}>{formatCurrency(finalPrice)}</div>
                                                            {product.discountPercent > 0 && (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                                    <span style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(product.price)}</span>
                                                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '1px 4px', borderRadius: 4 }}>-{product.discountPercent}%</span>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: product.stock > 0 ? '#f0fdf4' : '#fef2f2', color: product.stock > 0 ? '#16a34a' : '#dc2626', border: `1px solid ${product.stock > 0 ? '#bbf7d0' : '#fecaca'}` }}>
                                                                {product.stock > 0 ? `${product.stock} còn` : 'Hết'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                            <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: product.isActive ? '#f0fdf4' : '#f9fafb', color: product.isActive ? '#16a34a' : '#9ca3af', border: `1px solid ${product.isActive ? '#bbf7d0' : '#e5e7eb'}` }}>
                                                                {product.isActive ? 'Đang bán' : 'Đã ẩn'}
                                                            </span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', verticalAlign: 'middle' }}>
                                                            <div style={{ display: 'flex', gap: 6 }}>
                                                                <button type="button" onClick={() => handleEdit(product)} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>Sửa</button>
                                                                <button type="button" onClick={() => handleDeactivate(product.id)} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Ẩn</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default VendorProducts;
