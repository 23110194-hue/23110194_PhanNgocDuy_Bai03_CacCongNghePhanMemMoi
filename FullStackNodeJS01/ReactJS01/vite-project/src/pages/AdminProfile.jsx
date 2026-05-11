import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { Avatar, Card, Tag, Button, Row, Col, Alert } from 'antd';
import { CrownOutlined, MailOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const AdminProfile = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) {
                navigate('/login');
            } else if (auth.user?.role !== 'admin') {
                navigate('/user/profile');
            }
        }
    }, [auth, appLoading, navigate]);

    if (appLoading) return null;
    if (auth.user?.role !== 'admin') return null;

    return (
        <div style={{ padding: "40px 20px", minHeight: "calc(100vh - 64px)", background: "#fff7ed" }}>
            <Row justify="center">
                <Col xs={24} md={16} lg={10}>
                    <Alert
                        message="Khu vực Quản trị viên"
                        description="Bạn đang truy cập vào trang dành riêng cho Admin."
                        type="warning"
                        showIcon
                        icon={<CrownOutlined />}
                        style={{ marginBottom: 20, borderRadius: 10 }}
                    />

                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 8px 32px rgba(234,88,12,0.15)",
                            overflow: "hidden",
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{
                            background: "linear-gradient(135deg, #ea580c 0%, #dc2626 100%)",
                            padding: "40px 30px",
                            textAlign: "center",
                            color: "#fff",
                        }}>
                            <Avatar
                                size={80}
                                icon={<CrownOutlined />}
                                style={{ background: "rgba(255,255,255,0.25)", marginBottom: 16 }}
                            />
                            <h2 style={{ color: "#fff", margin: 0, fontSize: 24 }}>
                                {auth.user?.name || "Admin"}
                            </h2>
                            <Tag color="volcano" style={{ marginTop: 8, fontSize: 13 }}>
                                👑 Administrator
                            </Tag>
                        </div>

                        <div style={{ padding: "24px 30px" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 0", borderBottom: "1px solid #f0f0f0"
                            }}>
                                <MailOutlined style={{ color: "#ea580c", fontSize: 18 }} />
                                <div>
                                    <div style={{ fontSize: 12, color: "#999" }}>Email</div>
                                    <div style={{ fontWeight: 500 }}>{auth.user?.email}</div>
                                </div>
                            </div>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 0", borderBottom: "1px solid #f0f0f0"
                            }}>
                                <CrownOutlined style={{ color: "#ea580c", fontSize: 18 }} />
                                <div>
                                    <div style={{ fontSize: 12, color: "#999" }}>Vai trò</div>
                                    <div><Tag color="red">👑 Admin</Tag></div>
                                </div>
                            </div>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 0",
                            }}>
                                <SettingOutlined style={{ color: "#ea580c", fontSize: 18 }} />
                                <div>
                                    <div style={{ fontSize: 12, color: "#999" }}>Quyền hạn</div>
                                    <div style={{ color: "#555" }}>Toàn quyền quản trị hệ thống</div>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                block
                                size="large"
                                onClick={() => navigate('/user')}
                                danger
                                style={{ marginTop: 16, borderRadius: 8 }}
                            >
                                Quản lý Người dùng
                            </Button>
                            <Button
                                block
                                size="large"
                                onClick={() => navigate('/')}
                                style={{ marginTop: 8, borderRadius: 8 }}
                            >
                                Về Trang Chủ
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminProfile;
