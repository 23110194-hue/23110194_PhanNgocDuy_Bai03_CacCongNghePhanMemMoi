import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { Result, Avatar, Card, Tag, Button, Row, Col } from 'antd';
import { UserOutlined, MailOutlined, CrownOutlined } from '@ant-design/icons';

const UserProfile = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);

    useEffect(() => {
        if (!appLoading && !auth.isAuthenticated) {
            navigate('/login');
        }
    }, [auth, appLoading, navigate]);

    if (appLoading) return null;

    return (
        <div style={{ padding: "40px 20px", minHeight: "calc(100vh - 64px)", background: "#f7f2ea" }}>
            <Row justify="center">
                <Col xs={24} md={16} lg={10}>
                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: "0 8px 32px rgba(15,118,110,0.12)",
                            overflow: "hidden",
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{
                            background: "linear-gradient(135deg, #0f172a 0%, #0f766e 100%)",
                            padding: "40px 30px",
                            textAlign: "center",
                            color: "#fff",
                        }}>
                            <Avatar
                                size={80}
                                icon={<UserOutlined />}
                                style={{ background: "rgba(255,255,255,0.3)", marginBottom: 16 }}
                            />
                            <h2 style={{ color: "#fff", margin: 0, fontSize: 24 }}>
                                {auth.user?.name || "User"}
                            </h2>
                            <Tag color="blue" style={{ marginTop: 8, fontSize: 13 }}>
                                User Account
                            </Tag>
                        </div>

                        <div style={{ padding: "24px 30px" }}>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 0", borderBottom: "1px solid #f0f0f0"
                            }}>
                                <MailOutlined style={{ color: "#0f766e", fontSize: 18 }} />
                                <div>
                                    <div style={{ fontSize: 12, color: "#999" }}>Email</div>
                                    <div style={{ fontWeight: 500 }}>{auth.user?.email}</div>
                                </div>
                            </div>
                            <div style={{
                                display: "flex", alignItems: "center", gap: 12,
                                padding: "14px 0",
                            }}>
                                <UserOutlined style={{ color: "#0f766e", fontSize: 18 }} />
                                <div>
                                    <div style={{ fontSize: 12, color: "#999" }}>Vai trò</div>
                                    <div>
                                        <Tag color="green">User</Tag>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="primary"
                                block
                                size="large"
                                onClick={() => navigate('/')}
                                style={{
                                    background: "#0f766e", borderColor: "#0f766e",
                                    marginTop: 16, borderRadius: 8
                                }}
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

export default UserProfile;
