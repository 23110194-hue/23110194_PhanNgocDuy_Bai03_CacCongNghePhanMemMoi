import React, { useState } from 'react';
import {
    Button, Col, Divider, Form, Input,
    notification, Row, Steps, InputNumber
} from 'antd';
import {
    UserOutlined, MailOutlined, LockOutlined,
    SafetyCertificateOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { createUserApi, verifyRegisterOTPApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';

const { Step } = Steps;

const RegisterPage = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const onRegisterFinish = async (values) => {
        const { name, email, password } = values;
        setLoading(true);
        const res = await createUserApi(name, email, password);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({
                message: "Gửi OTP thành công",
                description: res.EM,
            });
            setRegisteredEmail(email);
            setCurrentStep(1);
        } else {
            notification.error({
                message: "Đăng ký thất bại",
                description: res?.EM ?? "Đã xảy ra lỗi, vui lòng thử lại",
            });
        }
    };

    const onVerifyOTPFinish = async (values) => {
        const { otp } = values;
        setLoading(true);
        const res = await verifyRegisterOTPApi(registeredEmail, otp);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({
                message: "Kích hoạt thành công! 🎉",
                description: res.EM,
            });
            navigate('/login');
        } else {
            notification.error({
                message: "Xác thực OTP thất bại",
                description: res?.EM ?? "Mã OTP không hợp lệ",
            });
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        const currentValues = form.getFieldsValue();
        const res = await createUserApi(currentValues.name, registeredEmail, currentValues.password);
        setResendLoading(false);
        if (res && res.EC === 0) {
            notification.success({ message: "Đã gửi lại OTP", description: res.EM });
        } else {
            notification.error({ message: "Lỗi", description: res?.EM });
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
        <Row justify="center" style={{ marginTop: "40px", marginBottom: "40px" }}>
            <Col xs={23} md={16} lg={9}>
                <div style={formBoxStyle}>
                    <h2 style={{ textAlign: "center", marginBottom: "24px", color: "#4f46e5" }}>
                        Đăng Ký Tài Khoản
                    </h2>

                    <Steps current={currentStep} size="small" style={{ marginBottom: "28px" }}>
                        <Step title="Thông tin" icon={<UserOutlined />} />
                        <Step title="Xác thực OTP" icon={<SafetyCertificateOutlined />} />
                        <Step title="Hoàn tất" icon={<CheckCircleOutlined />} />
                    </Steps>

                    {currentStep === 0 && (
                        <Form form={form} name="register" onFinish={onRegisterFinish} layout="vertical">
                            <Form.Item
                                label="Họ và tên"
                                name="name"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ tên!' },
                                    { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined style={{ color: '#bbb' }} />}
                                    placeholder="Nhập họ và tên"
                                    size="large"
                                />
                            </Form.Item>

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
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bbb' }} />}
                                    placeholder="Tối thiểu 6 ký tự"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Xác nhận mật khẩu"
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: '#bbb' }} />}
                                    placeholder="Nhập lại mật khẩu"
                                    size="large"
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                size="large"
                                loading={loading}
                                style={{ background: "#4f46e5", borderColor: "#4f46e5" }}
                            >
                                Tiếp tục
                            </Button>
                        </Form>
                    )}

                    {currentStep === 1 && (
                        <div>
                            <div style={{
                                background: "#f0f0ff", borderRadius: "8px",
                                padding: "16px", marginBottom: "20px", textAlign: "center"
                            }}>
                                <MailOutlined style={{ fontSize: 32, color: "#4f46e5", marginBottom: 8 }} />
                                <p style={{ margin: 0, color: "#555" }}>
                                    Mã OTP đã được gửi đến <strong>{registeredEmail}</strong>
                                </p>
                                <p style={{ margin: 0, color: "#999", fontSize: 13 }}>
                                    Vui lòng kiểm tra hộp thư (bao gồm Spam). Mã có hiệu lực trong <strong>5 phút</strong>.
                                </p>
                            </div>

                            <Form form={otpForm} name="verify-otp" onFinish={onVerifyOTPFinish} layout="vertical">
                                <Form.Item
                                    label="Mã OTP (6 chữ số)"
                                    name="otp"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mã OTP!' },
                                        { len: 6, message: 'Mã OTP gồm 6 chữ số!' },
                                        { pattern: /^\d+$/, message: 'Mã OTP chỉ gồm chữ số!' }
                                    ]}
                                >
                                    <Input
                                        prefix={<SafetyCertificateOutlined style={{ color: '#bbb' }} />}
                                        placeholder="Nhập mã OTP 6 chữ số"
                                        maxLength={6}
                                        size="large"
                                        style={{ textAlign: "center", letterSpacing: "6px", fontSize: "20px" }}
                                    />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    block
                                    size="large"
                                    loading={loading}
                                    style={{ background: "#4f46e5", borderColor: "#4f46e5", marginBottom: 10 }}
                                >
                                    Xác nhận OTP
                                </Button>

                                <Button
                                    block
                                    size="large"
                                    loading={resendLoading}
                                    onClick={handleResendOTP}
                                >
                                    Gửi lại OTP
                                </Button>

                                <Button
                                    type="link"
                                    block
                                    onClick={() => { setCurrentStep(0); otpForm.resetFields(); }}
                                    style={{ marginTop: 4 }}
                                >
                                    ← Quay lại
                                </Button>
                            </Form>
                        </div>
                    )}

                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default RegisterPage;