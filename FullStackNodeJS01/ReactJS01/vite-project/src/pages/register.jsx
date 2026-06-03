import React, { useState } from 'react';
import { Form, Input, notification } from 'antd';
import { createUserApi, verifyRegisterOTPApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck, CheckCircle, Home } from 'lucide-react';

const STEPS = [
    { label: 'Thông tin', icon: User },
    { label: 'Xác thực OTP', icon: ShieldCheck },
    { label: 'Hoàn tất', icon: CheckCircle },
];

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const [registeredPassword, setRegisteredPassword] = useState('');

    const onRegisterFinish = async (values) => {
        const { name, email, password } = values;
        setLoading(true);
        const res = await createUserApi(name, email, password);
        setLoading(false);
        if (res && res.EC === 0) {
            notification.success({ message: 'Gửi OTP thành công', description: res.EM });
            setRegisteredEmail(email);
            setRegisteredPassword(password);
            setCurrentStep(1);
        } else {
            notification.error({ message: 'Đăng ký thất bại', description: res?.EM ?? 'Đã xảy ra lỗi' });
        }
    };

    const onVerifyOTPFinish = async (values) => {
        setLoading(true);
        const res = await verifyRegisterOTPApi(registeredEmail, values.otp);
        setLoading(false);
        if (res && res.EC === 0) {
            notification.success({ message: 'Kích hoạt thành công! 🎉', description: res.EM });
            navigate('/login');
        } else {
            notification.error({ message: 'Xác thực OTP thất bại', description: res?.EM ?? 'Mã OTP không hợp lệ' });
        }
    };

    const handleResendOTP = async () => {
        if (!registeredEmail || !registeredPassword) {
            notification.warning({ message: 'Không thể gửi lại OTP', description: 'Vui lòng quay lại bước 1.' });
            return;
        }
        setResendLoading(true);
        const values = form.getFieldsValue();
        const res = await createUserApi(values.name || registeredEmail, registeredEmail, registeredPassword);
        setResendLoading(false);
        if (res && res.EC === 0) notification.success({ message: 'Đã gửi lại OTP', description: res.EM });
        else notification.error({ message: 'Lỗi', description: res?.EM });
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 104px)', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', position: 'relative' }}>
            {/* Nút về trang chủ - góc trên trái */}
            <Link to="/" style={{ position: 'absolute', top: 20, left: 20, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', textDecoration: 'none', padding: '7px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontWeight: 500, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f97316'; e.currentTarget.style.borderColor = '#fed7aa'; e.currentTarget.style.background = '#fff7ed'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; }}>
                <Home style={{ width: 14, height: 14 }} /> Trang chủ
            </Link>

            <div style={{ width: '100%', maxWidth: 440 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                        <div style={{ width: 36, height: 36, background: '#f97316', borderRadius: 8, color: '#fff', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>BK</div>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>BookStore</span>
                    </Link>
                </div>

                {/* Card */}
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '28px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 6 }}>Đăng ký tài khoản</h2>

                    {/* Steps indicator */}
                    <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const done = i < currentStep;
                            const active = i === currentStep;
                            return (
                                <React.Fragment key={i}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4, background: done ? '#f97316' : active ? '#fff7ed' : '#f3f4f6', border: `2px solid ${done || active ? '#f97316' : '#e5e7eb'}` }}>
                                            <Icon style={{ width: 13, height: 13, color: done ? '#fff' : active ? '#f97316' : '#9ca3af' }} />
                                        </div>
                                        <span style={{ fontSize: 10, color: active ? '#f97316' : '#9ca3af', fontWeight: active ? 700 : 400, textAlign: 'center' }}>{step.label}</span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div style={{ flex: 1, height: 2, background: i < currentStep ? '#f97316' : '#e5e7eb', marginTop: 13, flexShrink: 0, maxWidth: 40 }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Step 0: Register form */}
                    {currentStep === 0 && (
                        <Form form={form} name="register" onFinish={onRegisterFinish} layout="vertical" size="large">
                            {[
                                { name: 'name', label: 'Họ và tên', placeholder: 'Nhập họ và tên', rules: [{ required: true, message: 'Vui lòng nhập họ tên!' }, { min: 2, message: 'Ít nhất 2 ký tự!' }] },
                                { name: 'email', label: 'Email', placeholder: 'Nhập địa chỉ email', rules: [{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }] },
                            ].map(f => (
                                <Form.Item key={f.name} name={f.name} label={f.label} rules={f.rules}>
                                    <Input placeholder={f.placeholder} style={{ borderRadius: 7, fontSize: 14 }} />
                                </Form.Item>
                            ))}
                            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Tối thiểu 6 ký tự!' }]}>
                                <Input.Password placeholder="Tối thiểu 6 ký tự" style={{ borderRadius: 7, fontSize: 14 }} />
                            </Form.Item>
                            <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['password']}
                                rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Hai mật khẩu không khớp!')); } })
                                ]}>
                                <Input.Password placeholder="Nhập lại mật khẩu" style={{ borderRadius: 7, fontSize: 14 }} />
                            </Form.Item>
                            <Form.Item>
                                <button type="submit" disabled={loading}
                                    style={{ width: '100%', height: 44, background: '#f97316', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                                    {loading ? 'Đang xử lý...' : 'Tiếp tục →'}
                                </button>
                            </Form.Item>
                        </Form>
                    )}

                    {/* Step 1: OTP */}
                    {currentStep === 1 && (
                        <div>
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '14px 16px', marginBottom: 20, textAlign: 'center' }}>
                                <div style={{ fontSize: 24, marginBottom: 6 }}>📧</div>
                                <p style={{ margin: 0, fontSize: 13, color: '#374151' }}>
                                    Mã OTP đã gửi đến <strong>{registeredEmail}</strong>
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
                                    Kiểm tra hộp thư (bao gồm Spam). Hiệu lực <strong>5 phút</strong>.
                                </p>
                            </div>

                            <Form form={otpForm} name="verify-otp" onFinish={onVerifyOTPFinish} layout="vertical" size="large">
                                <Form.Item name="otp" label="Mã OTP (6 chữ số)"
                                    rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }, { len: 6, message: 'OTP gồm 6 chữ số!' }, { pattern: /^\d+$/, message: 'Chỉ gồm chữ số!' }]}>
                                    <Input placeholder="000000" maxLength={6} style={{ borderRadius: 7, fontSize: 24, textAlign: 'center', letterSpacing: '8px', fontWeight: 700 }} />
                                </Form.Item>
                                <Form.Item>
                                    <button type="submit" disabled={loading}
                                        style={{ width: '100%', height: 44, background: '#f97316', color: '#fff', border: 'none', borderRadius: 7, fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 10, opacity: loading ? 0.7 : 1 }}>
                                        {loading ? 'Đang xác thực...' : '✓ Xác nhận OTP'}
                                    </button>
                                </Form.Item>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button type="button" onClick={handleResendOTP} disabled={resendLoading}
                                        style={{ flex: 1, height: 40, border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                                        {resendLoading ? '...' : '↻ Gửi lại OTP'}
                                    </button>
                                    <button type="button" onClick={() => { setCurrentStep(0); otpForm.resetFields(); }}
                                        style={{ flex: 1, height: 40, border: '1px solid #e5e7eb', borderRadius: 7, background: '#fff', fontSize: 13, cursor: 'pointer', color: '#374151' }}>
                                        ← Quay lại
                                    </button>
                                </div>
                            </Form>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 8, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" style={{ color: '#f97316', fontWeight: 600 }}>Đăng nhập</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;