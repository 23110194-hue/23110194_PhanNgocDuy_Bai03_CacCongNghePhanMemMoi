import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, PackageCheck, Truck, ShieldCheck, ChevronRight, User, Phone } from 'lucide-react';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { createOrderApi } from '../util/api';
import { formatCurrency } from '../util/format';

const inputStyle = {
    width: '100%',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '11px 14px',
    fontSize: 14,
    outline: 'none',
    color: '#1a1a1a',
    background: '#fafafa',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { cart, refreshCart, cartLoading } = useContext(CartContext);

    const [form, setForm] = useState({
        fullName: auth.user?.name || '',
        phone: '',
        addressLine: '',
        note: '',
    });
    const [loading, setLoading] = useState(false);
    const [focusField, setFocusField] = useState(null);

    useEffect(() => {
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        if (auth.user?.role !== 'user') { navigate('/'); return; }
        refreshCart(false);
    }, [auth.isAuthenticated, auth.user, navigate, refreshCart]);

    useEffect(() => {
        if (!cartLoading && cart.items.length === 0 && auth.isAuthenticated) navigate('/cart');
    }, [cart.items.length, auth.isAuthenticated, cartLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName || !form.phone || !form.addressLine) {
            notification.warning({ message: 'Vui lòng nhập đầy đủ thông tin giao hàng.' });
            return;
        }
        setLoading(true);
        const res = await createOrderApi(form);
        setLoading(false);
        if (res && !res.message) {
            notification.success({ message: '🎉 Đặt hàng thành công!' });
            await refreshCart();
            navigate('/orders');
            return;
        }
        notification.error({ message: 'Đặt hàng thất bại', description: res?.message || 'Vui lòng thử lại.' });
    };

    if (!auth.isAuthenticated) return null;

    const fieldStyle = (name) => ({
        ...inputStyle,
        borderColor: focusField === name ? '#f97316' : '#e5e7eb',
        background: focusField === name ? '#fff' : '#fafafa',
    });

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '28px 0 48px' }}>
            <div className="container">

                {/* ── Progress bar ── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
                    {[
                        { label: 'Giỏ hàng', done: true },
                        { label: 'Thanh toán', active: true },
                        { label: 'Xác nhận', done: false },
                    ].map((step, i) => (
                        <React.Fragment key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: step.done ? '#f97316' : step.active ? '#f97316' : '#e5e7eb',
                                    color: step.done || step.active ? '#fff' : '#9ca3af',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 13, fontWeight: 700,
                                }}>{i + 1}</div>
                                <span style={{
                                    fontSize: 13, fontWeight: step.active ? 700 : 500,
                                    color: step.active ? '#f97316' : step.done ? '#374151' : '#9ca3af'
                                }}>{step.label}</span>
                            </div>
                            {i < 2 && (
                                <div style={{ flex: 1, height: 2, background: step.done ? '#f97316' : '#e5e7eb', margin: '0 12px', maxWidth: 60 }} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20, alignItems: 'start' }}>

                    {/* ── LEFT: Form ── */}
                    <form onSubmit={handleSubmit}>

                        {/* Shipping info card */}
                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <MapPin style={{ width: 18, height: 18, color: '#f97316' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Thông tin giao hàng</div>
                                    <div style={{ fontSize: 12, color: '#9ca3af' }}>Điền chính xác để tránh thất lạc hàng</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                                        <User style={{ width: 13, height: 13, color: '#9ca3af' }} /> Họ và tên *
                                    </label>
                                    <input
                                        type="text" name="fullName" value={form.fullName}
                                        onChange={handleChange}
                                        onFocus={() => setFocusField('fullName')}
                                        onBlur={() => setFocusField(null)}
                                        style={fieldStyle('fullName')}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                                        <Phone style={{ width: 13, height: 13, color: '#9ca3af' }} /> Số điện thoại *
                                    </label>
                                    <input
                                        type="text" name="phone" value={form.phone}
                                        onChange={handleChange}
                                        onFocus={() => setFocusField('phone')}
                                        onBlur={() => setFocusField(null)}
                                        style={fieldStyle('phone')}
                                        placeholder="09xx xxx xxx"
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7 }}>
                                    <MapPin style={{ width: 13, height: 13, color: '#9ca3af' }} /> Địa chỉ nhận hàng *
                                </label>
                                <input
                                    type="text" name="addressLine" value={form.addressLine}
                                    onChange={handleChange}
                                    onFocus={() => setFocusField('addressLine')}
                                    onBlur={() => setFocusField(null)}
                                    style={fieldStyle('addressLine')}
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 7, display: 'block' }}>
                                    Ghi chú (tùy chọn)
                                </label>
                                <textarea
                                    name="note" value={form.note}
                                    onChange={handleChange}
                                    onFocus={() => setFocusField('note')}
                                    onBlur={() => setFocusField(null)}
                                    style={{ ...fieldStyle('note'), minHeight: 88, resize: 'vertical' }}
                                    placeholder="Giao giờ hành chính, gọi trước khi giao, để trước cửa..."
                                />
                            </div>
                        </div>

                        {/* Payment card */}
                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px 28px', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <CreditCard style={{ width: 18, height: 18, color: '#f97316' }} />
                                </div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Phương thức thanh toán</div>
                            </div>

                            <div style={{
                                border: '2px solid #f97316', borderRadius: 10,
                                padding: '14px 18px', background: '#fff7ed',
                                display: 'flex', alignItems: 'center', gap: 12
                            }}>
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%',
                                    border: '2px solid #f97316', background: '#f97316',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: '#92400e' }}>Thanh toán khi nhận hàng (COD)</div>
                                    <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Trả tiền mặt khi nhận hàng, hoàn toàn an toàn</div>
                                </div>
                                <Truck style={{ width: 22, height: 22, color: '#f97316', marginLeft: 'auto' }} />
                            </div>
                        </div>

                        {/* Security note */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 20 }}>
                            <ShieldCheck style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: '#15803d' }}>Thông tin đơn hàng được bảo mật tuyệt đối. Chính sách đổi trả trong vòng 7 ngày.</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <Link to="/cart" style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '12px 20px', border: '1.5px solid #e5e7eb', borderRadius: 10,
                                fontSize: 14, fontWeight: 600, color: '#374151',
                                background: '#fff', textDecoration: 'none'
                            }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}>
                                ← Quay lại giỏ
                            </Link>
                            <button type="submit" disabled={loading} style={{
                                flex: 1, padding: '13px 24px',
                                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f97316, #ea580c)',
                                color: '#fff', border: 'none', borderRadius: 10,
                                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: loading ? 'none' : '0 4px 15px rgba(249,115,22,0.4)'
                            }}>
                                <PackageCheck style={{ width: 18, height: 18 }} />
                                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                            </button>
                        </div>
                    </form>

                    {/* ── RIGHT: Order summary ── */}
                    <div style={{ position: 'sticky', top: 16 }}>
                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                            <div style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', padding: '16px 20px' }}>
                                <div style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Tóm tắt đơn hàng</div>
                                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>{cart.items.length} sản phẩm</div>
                            </div>

                            <div style={{ padding: '16px 20px' }}>
                                {/* Items */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                                    {cart.items.map((item) => (
                                        <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{
                                                width: 44, height: 56, borderRadius: 6,
                                                background: '#f3f4f6', flexShrink: 0, overflow: 'hidden',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                {item.image && <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>x{item.quantity}</div>
                                            </div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f97316', flexShrink: 0 }}>
                                                {formatCurrency(item.lineTotal)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div style={{ borderTop: '1px dashed #e5e7eb', margin: '0 0 14px' }} />

                                {/* Subtotals */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                                        <span>Tạm tính</span>
                                        <span style={{ fontWeight: 600, color: '#374151' }}>{formatCurrency(cart.summary.subtotal)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
                                        <span>Phí vận chuyển</span>
                                        <span style={{ fontWeight: 600, color: cart.summary.shippingFee === 0 ? '#16a34a' : '#374151' }}>
                                            {cart.summary.shippingFee === 0 ? 'Miễn phí' : formatCurrency(cart.summary.shippingFee)}
                                        </span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '12px 16px', marginTop: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Tổng cộng</span>
                                        <span style={{ fontWeight: 900, fontSize: 20, color: '#f97316' }}>{formatCurrency(cart.summary.total)}</span>
                                    </div>
                                </div>

                                {/* Trust badges */}
                                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {[
                                        { icon: ShieldCheck, label: 'Bảo hành chính hãng', color: '#16a34a' },
                                        { icon: Truck, label: 'Giao hàng toàn quốc', color: '#2563eb' },
                                        { icon: PackageCheck, label: 'Đổi trả 7 ngày', color: '#f97316' },
                                    ].map(({ icon: Icon, label, color }) => (
                                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6b7280' }}>
                                            <Icon style={{ width: 14, height: 14, color, flexShrink: 0 }} />
                                            {label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
