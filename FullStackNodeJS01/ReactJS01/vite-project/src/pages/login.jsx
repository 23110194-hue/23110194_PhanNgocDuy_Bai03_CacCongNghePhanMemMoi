import React, { useContext, useState } from 'react';
import { Form, Input, notification } from 'antd';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { Home } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        const { email, password } = values;
        setLoading(true);
        const res = await loginApi(email, password);
        setLoading(false);

        if (res && res.EC === 0) {
            localStorage.setItem('access_token', res.access_token);
            setAuth({
                isAuthenticated: true,
                user: {
                    id: res?.user?.id ?? '',
                    email: res?.user?.email ?? '',
                    name: res?.user?.name ?? '',
                    role: (res?.user?.role ?? 'user').toLowerCase(),
                }
            });
            notification.success({ message: `Chào mừng trở lại, ${res?.user?.name || res?.user?.email}! 🎉` });
            navigate(res.redirectUrl || '/');
        } else if (res && res.EC === 3) {
            notification.warning({ message: 'Tài khoản chưa kích hoạt', description: res.EM, duration: 6 });
        } else {
            notification.error({ message: 'Đăng nhập thất bại', description: res?.EM ?? 'Email hoặc mật khẩu không đúng' });
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 104px)', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', position: 'relative' }}>
            {/* Nút về trang chủ - góc trên trái */}
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
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: '32px 32px 28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>Đăng nhập</h2>
                    <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Vui lòng nhập email và mật khẩu</p>

                    <Form name="login" onFinish={onFinish} layout="vertical" size="large">
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input placeholder="Email" style={{ borderRadius: 6, fontSize: 14 }} />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password placeholder="Mật khẩu" style={{ borderRadius: 6, fontSize: 14 }} />
                        </Form.Item>

                        <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -8 }}>
                            <Link to="/forgot-password" style={{ fontSize: 13, color: '#f97316' }}>Quên mật khẩu?</Link>
                        </div>

                        <Form.Item>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', height: 44, border: 'none',
                                    background: '#f97316', color: '#fff',
                                    borderRadius: 6, fontSize: 15, fontWeight: 700,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.7 : 1, transition: 'background 0.15s'
                                }}
                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#ea580c'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f97316'; }}
                            >
                                {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                            </button>
                        </Form.Item>
                    </Form>

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 20, textAlign: 'center', fontSize: 13, color: '#6b7280' }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" style={{ color: '#f97316', fontWeight: 600 }}>Đăng ký tại đây</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;