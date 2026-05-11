import React, { useContext, useState } from 'react';
import {
    UsergroupAddOutlined, HomeOutlined, SettingOutlined,
    UserOutlined, CrownOutlined
} from '@ant-design/icons';
import { Menu, Tag } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [current, setCurrent] = useState('home');

    const profileUrl = auth?.user?.role === 'admin' ? '/admin/profile' : '/user/profile';
    const profileLabel = auth?.user?.role === 'admin'
        ? <><CrownOutlined /> Admin Profile</>
        : <><UserOutlined /> Profile</>;

    const items = [
        {
            label: <Link to="/">Home Page</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        },
        ...(auth.isAuthenticated ? [{
            label: <Link to="/user">Users</Link>,
            key: 'user',
            icon: <UsergroupAddOutlined />,
        }] : []),
        {
            label: (
                <span>
                    {auth?.user?.email ?? "Tài khoản"}&nbsp;
                    {auth.isAuthenticated && (
                        <Tag color={auth?.user?.role === 'admin' ? 'red' : 'blue'} style={{ fontSize: 11 }}>
                            {auth?.user?.role === 'admin' ? '👑 Admin' : 'User'}
                        </Tag>
                    )}
                </span>
            ),
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [
                    {
                        label: <Link to={profileUrl}>{profileLabel}</Link>,
                        key: 'profile',
                    },
                    {
                        label: (
                            <span onClick={() => {
                                localStorage.clear("access_token");
                                setAuth({ isAuthenticated: false, user: { email: "", name: "", role: "" } });
                                navigate("/");
                            }}>
                                Đăng xuất
                            </span>
                        ),
                        key: 'logout',
                    }
                ] : [
                    {
                        label: <Link to="/login">Đăng nhập</Link>,
                        key: 'login',
                    },
                    {
                        label: <Link to="/register">Đăng ký</Link>,
                        key: 'register',
                    }
                ]),
            ],
        },
    ];

    const onClick = (e) => setCurrent(e.key);

    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;