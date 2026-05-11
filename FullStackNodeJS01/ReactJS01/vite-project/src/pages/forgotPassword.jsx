import React, { useState } from 'react';
import {
    Button, Col, Divider, Form, Input,
    notification, Row, Steps
} from 'antd';
import {
    MailOutlined, LockOutlined, SafetyCertificateOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { sendForgotPasswordOTPApi, verifyForgotPasswordOTPApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';

const { Step } = Steps;

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [emailForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [forgotEmail, setForgotEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    // Bước 1: Gửi OTP qua email
    const onSendOTPFinish = async (values) => {
        setLoading(true);
        const res = await sendForgotPasswordOTPApi(values.email);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({
                message: "Gửi OTP thành công",
                description: res.EM,
            });
            setForgotEmail(values.email);
            setCurrentStep(1);
        } else {
            notification.error({
                message: "Lỗi",
                description: res?.EM ?? "Không thể gửi OTP, vui lòng thử lại",
            });
        }
    };

    // Bước 2: Xác thực OTP + đặt mật khẩu mới
    const onResetPasswordFinish = async (values) => {
        const { otp, newPassword } = values;
        setLoading(true);
        const res = await verifyForgotPasswordOTPApi(forgotEmail, otp, newPassword);
        setLoading(false);

        if (res && res.EC === 0) {
            notification.success({
                message: "Đặt lại mật khẩu thành công! 🎉",
                description: res.EM,
            });
            navigate('/login');
        } else {
            notification.error({
                message: "Thất bại",
                description: res?.EM ?? "Mã OTP không hợp lệ hoặc đã hết hạn",
            });
        }
    };

    // Gửi lại OTP
    const handleResendOTP = async () => {
        setResendLoading(true);
        const res = await sendForgotPasswordOTPApi(forgotEmail);
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
                        Quên Mật Khẩu
                    </h2>

                    <Steps current={currentStep} size="small" style={{ marginBottom: "28px" }}>
                        <Step title="Nhập Email" icon={<MailOutlined />} />
                        <Step title="Xác thực OTP" icon={<SafetyCertificateOutlined />} />
                        <Step title="Hoàn tất" icon={<CheckCircleOutlined />} />
                    </Steps>

                    {/* ── Bước 1: Nhập email ── */}
                    {currentStep === 0 && (
                        <Form form={emailForm} name="forgot-step1" onFinish={onSendOTPFinish} layout="vertical">
                            <p style={{ color: "#666", marginBottom: 16 }}>
                                Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
                            </p>
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
                                    placeholder="Nhập email đã đăng ký"
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
                                Gửi mã OTP
                            </Button>
                        </Form>
                    )}

                    {/* ── Bước 2: Nhập OTP + mật khẩu mới ── */}
                    {currentStep === 1 && (
                        <div>
                            <div style={{
                                background: "#f0f0ff", borderRadius: "8px",
                                padding: "16px", marginBottom: "20px", textAlign: "center"
                            }}>
                                <MailOutlined style={{ fontSize: 32, color: "#4f46e5", marginBottom: 8 }} />
                                <p style={{ margin: 0, color: "#555" }}>
                                    Mã OTP đã được gửi đến <strong>{forgotEmail}</strong>
                                </p>
                                <p style={{ margin: 0, color: "#999", fontSize: 13 }}>
                                    Mã có hiệu lực trong <strong>5 phút</strong>
                                </p>
                            </div>

                            <Form form={resetForm} name="forgot-step2" onFinish={onResetPasswordFinish} layout="vertical">
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
                                        placeholder="Nhập mã OTP"
                                        maxLength={6}
                                        size="large"
                                        style={{ textAlign: "center", letterSpacing: "6px", fontSize: "20px" }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Mật khẩu mới"
                                    name="newPassword"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
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
                                    label="Xác nhận mật khẩu mới"
                                    name="confirmNewPassword"
                                    dependencies={['newPassword']}
                                    rules={[
                                        { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        prefix={<LockOutlined style={{ color: '#bbb' }} />}
                                        placeholder="Nhập lại mật khẩu mới"
                                        size="large"
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
                                    Đặt Lại Mật Khẩu
                                </Button>

                                <Button
                                    block
                                    size="large"
                                    loading={resendLoading}
                                    onClick={handleResendOTP}
                                    style={{ marginBottom: 4 }}
                                >
                                    Gửi lại OTP
                                </Button>

                                <Button
                                    type="link"
                                    block
                                    onClick={() => { setCurrentStep(0); resetForm.resetFields(); }}
                                >
                                    ← Quay lại
                                </Button>
                            </Form>
                        </div>
                    )}

                    <Divider />
                    <div style={{ textAlign: "center" }}>
                        Nhớ mật khẩu rồi? <Link to="/login" style={{ color: "#4f46e5" }}>Đăng nhập</Link>
                    </div>
                    <div style={{ textAlign: "center", marginTop: 8 }}>
                        Chưa có tài khoản? <Link to="/register" style={{ color: "#4f46e5" }}>Đăng ký</Link>
                    </div>
                </div>
            </Col>
        </Row>
    );
};

export default ForgotPasswordPage;
