import React, { useContext, useState } from 'react';
import {
    Button, Col, Divider, Form, Input,
    notification, Row
} from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';

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
            localStorage.setItem("access_token", res.access_token);
            setAuth({
                isAuthenticated: true,
                user: {
                    email: res?.user?.email ?? "",
                    name: res?.user?.name ?? "",
                    role: res?.user?.role ?? "user",
                }
            });
            notification.success({
                message: "Đăng nhập thành công! 🎉",
                description: `Chào mừng trở lại, ${res?.user?.name || res?.user?.email}!`,
            });
            navigate(res.redirectUrl || "/");
        } else if (res && res.EC === 3) {
            notification.warning({
                message: "Tài khoản chưa kích hoạt",
                description: res.EM,
                duration: 6,
            });
        } else {
            notification.error({
                message: "Đăng nhập thất bại",
                description: res?.EM ?? "Email hoặc mật khẩu không đúng",
            });
        }
    };

    const formBoxStyle = {
        padding: "30px",
        border: "1px solid #e8e8e8",
        borderRadius: "12px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        background: "#fff",
    };

    return (
        <Row justify="center" style={{ marginTop: "60px", marginBottom: "40px" }}>
            <Col xs={23} md={16} lg={9}>
                <div style={formBoxStyle}>
                    <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#4f46e5" }}>
                        Đăng Nhập
                    </h2>

                    <Form name="login" onFinish={onFinish} layout="vertical">
                        <Form.Item
                            label="Email"
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#bbb' }} />}
                                placeholder="Nhập địa chỉ email"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            label="Mật khẩu"
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bbb' }} />}
                                placeholder="Nhập mật khẩu"
                                size="large"
                            />
                        </Form.Item>

                        <div style={{ textAlign: "right", marginBottom: "16px" }}>
                            <Link to="/forgot-password" style={{ color: "#4f46e5" }}>
                                Quên mật khẩu?
                            </Link>
                        </div>

                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            loading={loading}
                            style={{ background: "#4f46e5", borderColor: "#4f46e5" }}
                        >
                            Đăng Nhập
                        </Button>
                    </Form>

                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        Chưa có tài khoản? <Link to="/register" style={{ color: "#4f46e5" }}>Đăng ký tại đây</Link>
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default LoginPage;