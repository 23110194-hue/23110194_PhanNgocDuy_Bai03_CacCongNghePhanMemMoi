import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, MapPin, PackageCheck } from 'lucide-react';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { CartContext } from '../components/context/cart.context';
import { createOrderApi } from '../util/api';
import { formatCurrency } from '../util/format';

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

    useEffect(() => {
        if (!auth.isAuthenticated) {
            navigate('/login');
            return;
        }
        refreshCart(false);
    }, [auth.isAuthenticated, navigate, refreshCart]);

    useEffect(() => {
        if (!cartLoading && cart.items.length === 0 && auth.isAuthenticated) {
            navigate('/cart');
        }
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
            notification.success({ message: 'Đặt hàng thành công!' });
            await refreshCart();
            navigate(`/orders/${res._id}`);
            return;
        }
        notification.error({ message: 'Đặt hàng thất bại', description: res?.message || 'Vui lòng thử lại.' });
    };

    if (!auth.isAuthenticated) return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <PackageCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Thanh toán COD</h1>
                        <p className="text-slate-500">Nhập địa chỉ nhận hàng và xác nhận đơn.</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
                    <form onSubmit={handleSubmit} className="surface rounded-3xl p-6 space-y-5">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <MapPin className="w-5 h-5" />
                            Thông tin giao hàng
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-600">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    className="form-input mt-2"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-600">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="form-input mt-2"
                                    placeholder="09xx xxx xxx"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">Địa chỉ nhận hàng</label>
                            <input
                                type="text"
                                name="addressLine"
                                value={form.addressLine}
                                onChange={handleChange}
                                className="form-input mt-2"
                                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-600">Ghi chú</label>
                            <textarea
                                name="note"
                                value={form.note}
                                onChange={handleChange}
                                className="form-input mt-2 min-h-24"
                                placeholder="Giao giờ hành chính, gọi trước khi giao..."
                            />
                        </div>

                        <div className="border-t border-slate-200 pt-5">
                            <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                                <CreditCard className="w-5 h-5" />
                                Phương thức thanh toán
                            </div>
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Thanh toán khi nhận hàng (COD) - bắt buộc.
                            </div>
                            <div className="text-xs text-slate-500 mt-2">(Bạn có thể tìm hiểu thêm các ví điện tử ở các phiên bản sau.)</div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <Link to="/cart" className="btn-ghost">Quay lại giỏ hàng</Link>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                Xác nhận đặt hàng
                            </button>
                        </div>
                    </form>

                    <div className="surface rounded-3xl p-6 h-fit">
                        <h3 className="font-semibold text-slate-900 mb-4">Tóm tắt đơn hàng</h3>
                        <div className="space-y-2 text-sm text-slate-600">
                            {cart.items.map((item) => (
                                <div key={item.productId} className="flex justify-between">
                                    <span>{item.title} x {item.quantity}</span>
                                    <span className="font-semibold text-slate-900">{formatCurrency(item.lineTotal)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-slate-200 mt-4 pt-4 space-y-2 text-sm text-slate-600">
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(cart.summary.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Phí vận chuyển</span>
                                <span className="font-semibold text-slate-900">{formatCurrency(cart.summary.shippingFee)}</span>
                            </div>
                            <div className="flex justify-between text-base">
                                <span className="font-semibold">Tổng cộng</span>
                                <span className="font-bold text-slate-900">{formatCurrency(cart.summary.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;

