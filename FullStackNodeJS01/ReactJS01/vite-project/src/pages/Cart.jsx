import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { formatCurrency } from '../util/format';

const CartPage = () => {
    const navigate = useNavigate();
    const { auth } = useContext(AuthContext);
    const { cart, cartLoading, updateCartItem, removeCartItem, clearCart, refreshCart } = useContext(CartContext);

    useEffect(() => {
        if (!auth.isAuthenticated) { navigate('/login'); return; }
        refreshCart(false);
    }, [auth.isAuthenticated, navigate, refreshCart]);

    if (!auth.isAuthenticated) return null;

    const items = cart?.items || [];

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingCart style={{ width: 20, height: 20, color: '#f97316' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111', margin: 0 }}>Giỏ hàng</h1>
                        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Kiểm tra lại trước khi thanh toán</p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '56px 24px', textAlign: 'center' }}>
                        <ShoppingCart style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 12px' }} />
                        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>Giỏ hàng đang trống</h2>
                        <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 20 }}>Hãy chọn thêm sách để tiếp tục mua sắm.</p>
                        <Link to="/products" style={{ background: '#f97316', color: '#fff', borderRadius: 8, padding: '9px 24px', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                            Khám phá sách
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
                        {/* Cart items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {items.map(item => (
                                <div key={item.productId} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '14px 16px', display: 'flex', gap: 14 }}>
                                    {/* Image */}
                                    <Link to={`/product/${item.slug}`} style={{ display: 'block', flexShrink: 0 }}>
                                        <img src={item.image || 'https://placehold.co/72x96?text=📖'} alt={item.title}
                                            style={{ width: 72, height: 96, objectFit: 'cover', borderRadius: 7, border: '1px solid #e5e7eb' }} />
                                    </Link>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                                            <div>
                                                <Link to={`/product/${item.slug}`} style={{ textDecoration: 'none' }}>
                                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111', lineHeight: 1.4 }}>{item.title}</div>
                                                </Link>
                                                {item.discountPercent > 0 && (
                                                    <span style={{ fontSize: 11, color: '#f97316', fontWeight: 700 }}>-{item.discountPercent}% GIẢM</span>
                                                )}
                                            </div>
                                            <button type="button" onClick={() => removeCartItem(item.productId)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', flexShrink: 0 }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#d1d5db'}>
                                                <Trash2 style={{ width: 16, height: 16 }} />
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 8 }}>
                                            <div>
                                                <div style={{ fontSize: 16, fontWeight: 700, color: '#f97316' }}>{formatCurrency(item.finalPrice)}</div>
                                                {item.discountPercent > 0 && <div style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>{formatCurrency(item.price)}</div>}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                                                    <button type="button" onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                                                        style={{ width: 32, height: 34, border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                                        <Minus style={{ width: 13, height: 13 }} />
                                                    </button>
                                                    <span style={{ minWidth: 36, textAlign: 'center', fontWeight: 700, fontSize: 14, borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', lineHeight: '34px', display: 'block' }}>{item.quantity}</span>
                                                    <button type="button" onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                                                        disabled={Number.isFinite(item.stock) && item.quantity >= item.stock}
                                                        style={{ width: 32, height: 34, border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                                                        <Plus style={{ width: 13, height: 13 }} />
                                                    </button>
                                                </div>
                                                <span style={{ fontSize: 13, color: '#6b7280' }}>
                                                    = <strong style={{ color: '#111' }}>{formatCurrency(item.lineTotal)}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={() => clearCart()} disabled={cartLoading}
                                style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 16px', fontSize: 13, color: '#9ca3af', cursor: 'pointer', alignSelf: 'flex-start' }}>
                                Xóa tất cả
                            </button>
                        </div>

                        {/* Summary */}
                        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '20px' }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 16 }}>Tóm tắt đơn hàng</h3>
                            {[
                                { label: 'Số lượng', value: cart?.summary?.totalQuantity },
                                { label: 'Tạm tính', value: formatCurrency(cart?.summary?.subtotal) },
                                { label: 'Phí vận chuyển', value: formatCurrency(cart?.summary?.shippingFee) },
                            ].map(row => (
                                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
                                    <span>{row.label}</span><strong style={{ color: '#111' }}>{row.value}</strong>
                                </div>
                            ))}
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 16 }}>
                                <span>Tổng cộng</span>
                                <span style={{ color: '#f97316' }}>{formatCurrency(cart?.summary?.total)}</span>
                            </div>
                            <button type="button" onClick={() => navigate('/checkout')} disabled={cartLoading}
                                style={{ width: '100%', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                Thanh toán COD <ArrowRight style={{ width: 16, height: 16 }} />
                            </button>
                            <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: '#9ca3af', textDecoration: 'none' }}>
                                Tiếp tục mua sắm
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
