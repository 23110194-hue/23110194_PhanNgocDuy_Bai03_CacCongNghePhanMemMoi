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
    const { auth, appLoading } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [shop, setShop] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState(null);

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
            fetchProducts();
            return;
        }
        notification.error({ message: 'Không thể lưu sản phẩm', description: res?.message });
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
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
    };

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'vendor') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Sản phẩm của shop</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Thêm mới và cập nhật sản phẩm cho shop</p>
                    </div>
                    <Link to="/vendor/orders" style={{ fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 7, border: '1px solid #e5e7eb', color: '#374151', textDecoration: 'none', background: '#fff' }}>Đơn hàng</Link>
                </div>

                {/* Form */}
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px 24px', marginBottom: 16 }}>
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
                                {editingId ? 'Cập nhật' : 'Thêm sản phẩm'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleReset} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 7, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Hủy chỉnh sửa</button>
                            )}
                        </div>
                    </form>
                </div>

                {loading ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 32, textAlign: 'center', color: '#9ca3af' }}>Đang tải sản phẩm...</div>
                ) : products.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 48, textAlign: 'center', color: '#9ca3af' }}>Chưa có sản phẩm nào.</div>
                ) : (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Danh sách sản phẩm</span>
                            <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>{products.length} sản phẩm</span>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                        {['Tên', 'Danh mục', 'Giá', 'Tồn kho', 'Trạng thái', 'Hành động'].map(h => (
                                            <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, i) => (
                                        <tr key={product.id} style={{ borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <td style={{ padding: '11px 16px', fontWeight: 600, color: '#111', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.title}</td>
                                            <td style={{ padding: '11px 16px', color: '#6b7280' }}>{product.category}</td>
                                            <td style={{ padding: '11px 16px', color: '#f97316', fontWeight: 600 }}>{formatCurrency(product.price)}</td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: product.stock > 0 ? '#f0fdf4' : '#fef2f2', color: product.stock > 0 ? '#16a34a' : '#dc2626', border: `1px solid ${product.stock > 0 ? '#bbf7d0' : '#fecaca'}` }}>
                                                    {product.stock > 0 ? `${product.stock} còn` : 'Hết'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: product.isActive ? '#f0fdf4' : '#f9fafb', color: product.isActive ? '#16a34a' : '#9ca3af', border: `1px solid ${product.isActive ? '#bbf7d0' : '#e5e7eb'}` }}>
                                                    {product.isActive ? 'Đang bán' : 'Đã ẩn'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '11px 16px' }}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button type="button" onClick={() => handleEdit(product)} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#374151', cursor: 'pointer' }}>Sửa</button>
                                                    <button type="button" onClick={() => handleDeactivate(product.id)} style={{ fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>Ẩn</button>
                                                </div>
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

export default VendorProducts;
