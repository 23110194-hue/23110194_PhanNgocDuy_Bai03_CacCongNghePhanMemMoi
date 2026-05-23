import React, { useState } from 'react';
import { Form, Input, notification } from 'antd';
import { sendForgotPasswordOTPApi, verifyForgotPasswordOTPApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, CheckCircle, Home, ArrowLeft, RotateCcw } from 'lucide-react';

const STEPS = [
    { label: 'Nhập Email', icon: Mail },
    { label: 'Xác thực OTP', icon: ShieldCheck },
    { label: 'Hoàn tất', icon: CheckCircle },
];

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [emailForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [forgotEmail, setForgotEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const onSendOTPFinish = async (values) => {
        setLoading(true);
        const res = await sendForgotPasswordOTPApi(values.email);
        setLoading(false);
        if (res && res.EC === 0) {
            notification.success({ message: 'Gửi OTP thành công', description: res.EM });
            setForgotEmail(values.email);
            setCurrentStep(1);
        } else {
            notification.error({ message: 'Lỗi', description: res?.EM ?? 'Không thể gửi OTP, vui lòng thử lại' });
        }
    };

    const onResetPasswordFinish = async (values) => {
        const { otp, newPassword } = values;
        setLoading(true);
        const res = await verifyForgotPasswordOTPApi(forgotEmail, otp, newPassword);
        setLoading(false);
        if (res && res.EC === 0) {
            notification.success({ message: 'Đặt lại mật khẩu thành công!', description: res.EM });
            navigate('/login');
        } else {
            notification.error({ message: 'Thất bại', description: res?.EM ?? 'Mã OTP không hợp lệ hoặc đã hết hạn' });
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        const res = await sendForgotPasswordOTPApi(forgotEmail);
        setResendLoading(false);
        if (res && res.EC === 0) {
            notification.success({ message: 'Đã gửi lại OTP', description: res.EM });
        } else {
            notification.error({ message: 'Lỗi', description: res?.EM });
        }
    };

    const inputStyle = { width: '100%', border: '1px solid #e5e7eb', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
    const btnPrimary = { width: '100%', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 };
    const btnGhost = { width: '100%', background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer', marginBottom: 8 };

    return (
        <div style={{ minHeight: 'calc(100vh - 104px)', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', position: 'relative' }}>
            {/* Home button */}
            <Link to="/" style={{ position: 'absolute', top: 20, left: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.background = '#fff7ed'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}>
                <Home style={{ width: 14, height: 14 }} /> Trang chủ
            </Link>

            <div style={{ width: '100%', maxWidth: 420 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, background: '#f97316', borderRadius: 8, color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>BK</div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>BookStore</span>
                    </Link>
                </div>

                {/* Card */}
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '28px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Quên mật khẩu</h2>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Đặt lại mật khẩu qua email đã đăng ký</p>

                    {/* Step indicators */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const active = i <= currentStep;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                                    {i > 0 && <div style={{ position: 'absolute', left: 0, top: 14, width: '50%', height: 2, background: i <= currentStep ? '#f97316' : '#e5e7eb' }} />}
                                    {i < STEPS.length - 1 && <div style={{ position: 'absolute', right: 0, top: 14, width: '50%', height: 2, background: i < currentStep ? '#f97316' : '#e5e7eb' }} />}
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: active ? '#f97316' : '#f3f4f6', color: active ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                                        <Icon style={{ width: 13, height: 13 }} />
                                    </div>
                                    <span style={{ fontSize: 10, marginTop: 4, color: active ? '#f97316' : '#9ca3af', fontWeight: active ? 600 : 400 }}>{step.label}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Step 0: Email */}
                    {currentStep === 0 && (
                        <Form form={emailForm} onFinish={onSendOTPFinish} layout="vertical">
                            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                            </p>
                            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]} style={{ marginBottom: 16 }}>
                                <input placeholder="Email đã đăng ký" style={inputStyle} onChange={e => emailForm.setFieldValue('email', e.target.value)} />
                            </Form.Item>
                            <button type="submit" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading}
                                onClick={() => emailForm.submit()}>
                                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                            </button>
                        </Form>
                    )}

                    {/* Step 1: OTP + new password */}
                    {currentStep === 1 && (
                        <div>
                            <div style={{ background: '#fff7ed', borderRadius: 8, padding: '12px 16px', marginBottom: 20, textAlign: 'center', border: '1px solid #fed7aa' }}>
                                <Mail style={{ width: 24, height: 24, color: '#f97316', marginBottom: 6 }} />
                                <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
                                    Mã OTP đã gửi đến <strong>{forgotEmail}</strong>
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>Có hiệu lực trong <strong>5 phút</strong></p>
                            </div>

                            <Form form={resetForm} onFinish={onResetPasswordFinish} layout="vertical">
                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Mã OTP (6 chữ số)</label>
                                    <Form.Item name="otp" rules={[{ required: true, message: 'Nhập mã OTP!' }, { len: 6, message: 'OTP gồm 6 chữ số!' }, { pattern: /^\d+$/, message: 'Chỉ gồm chữ số!' }]} style={{ marginBottom: 0 }}>
                                        <input maxLength={6} placeholder="● ● ● ● ● ●" style={{ ...inputStyle, textAlign: 'center', letterSpacing: 10, fontSize: 18, fontWeight: 700 }}
                                            onChange={e => resetForm.setFieldValue('otp', e.target.value)} />
                                    </Form.Item>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Mật khẩu mới</label>
                                    <Form.Item name="newPassword" rules={[{ required: true, message: 'Nhập mật khẩu mới!' }, { min: 6, message: 'Tối thiểu 6 ký tự!' }]} style={{ marginBottom: 0 }}>
                                        <Input.Password placeholder="Tối thiểu 6 ký tự" style={{ borderRadius: 8, height: 42, fontSize: 14 }}
                                            onChange={e => resetForm.setFieldValue('newPassword', e.target.value)} />
                                    </Form.Item>
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Xác nhận mật khẩu mới</label>
                                    <Form.Item name="confirmNewPassword"
                                        dependencies={['newPassword']}
                                        rules={[{ required: true, message: 'Xác nhận mật khẩu!' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) return Promise.resolve(); return Promise.reject(new Error('Hai mật khẩu không khớp!')); } })]}
                                        style={{ marginBottom: 0 }}>
                                        <Input.Password placeholder="Nhập lại mật khẩu mới" style={{ borderRadius: 8, height: 42, fontSize: 14 }}
                                            onChange={e => resetForm.setFieldValue('confirmNewPassword', e.target.value)} />
                                    </Form.Item>
                                </div>
                                <button type="button" style={{ ...btnPrimary, opacity: loading ? 0.7 : 1 }} disabled={loading} onClick={() => resetForm.submit()}>
                                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                                </button>
                                <button type="button" style={btnGhost} disabled={resendLoading} onClick={handleResendOTP}>
                                    <RotateCcw style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} />
                                    {resendLoading ? 'Đang gửi...' : 'Gửi lại OTP'}
                                </button>
                                <button type="button" style={{ ...btnGhost, marginBottom: 0 }} onClick={() => { setCurrentStep(0); resetForm.resetFields(); }}>
                                    <ArrowLeft style={{ width: 13, height: 13, display: 'inline', marginRight: 6 }} /> Quay lại
                                </button>
                            </Form>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 20, paddingTop: 16, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                        Nhớ mật khẩu rồi?{' '}
                        <Link to="/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập</Link>
                        {' · '}
                        <Link to="/register" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Đăng ký</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
