import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notification } from 'antd';
import { AuthContext } from '../components/context/auth.context';
import { getAdminUsersApi, updateAdminUserRoleApi } from '../util/api';

const roleOptions = ['user', 'vendor', 'manager', 'admin'];

const AdminUsers = () => {
    const navigate = useNavigate();
    const { auth, appLoading } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleDrafts, setRoleDrafts] = useState({});

    const fetchUsers = async () => {
        setLoading(true);
        const res = await getAdminUsersApi();
        setLoading(false);
        if (res && !res.message) {
            setUsers(res.items || []);
            return;
        }
        notification.error({ message: 'Không thể tải người dùng', description: res?.message });
    };

    useEffect(() => {
        if (!appLoading) {
            if (!auth.isAuthenticated) {
                navigate('/login');
                return;
            }
            if (auth.user?.role !== 'admin') {
                navigate('/user/profile');
                return;
            }
            fetchUsers();
        }
    }, [auth, appLoading, navigate]);

    const handleRoleChange = (userId, role) => {
        setRoleDrafts((prev) => ({ ...prev, [userId]: role }));
    };

    const handleUpdateRole = async (userId) => {
        const role = roleDrafts[userId];
        if (!role) {
            notification.warning({ message: 'Vui lòng chọn role mới.' });
            return;
        }
        const res = await updateAdminUserRoleApi(userId, role);
        if (res && !res.message) {
            notification.success({ message: 'Đã cập nhật role' });
            setUsers((prev) => prev.map((item) => (item._id === res._id ? res : item)));
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    if (appLoading) return null;
    if (!auth.isAuthenticated || auth.user?.role !== 'admin') return null;

    return (
        <div style={{ background: '#f5f6fa', minHeight: '100vh', padding: '24px 0 40px' }}>
            <div className="container">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-semibold text-slate-900">Quản lý người dùng</h1>
                        <p className="text-slate-500">Thay đổi vai trò tài khoản.</p>
                    </div>
                    <Link to="/admin/profile" className="btn-ghost">Quay lại Admin</Link>
                </div>

                {loading ? (
                    <div className="surface rounded-3xl p-10 text-center">Đang tải...</div>
                ) : users.length === 0 ? (
                    <div className="surface rounded-3xl p-10 text-center">Chưa có người dùng.</div>
                ) : (
                    <div className="surface rounded-3xl p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="py-2">Email</th>
                                        <th className="py-2">Tên</th>
                                        <th className="py-2">Role</th>
                                        <th className="py-2">Cập nhật</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-700">
                                    {users.map((user) => (
                                        <tr key={user._id} className="border-t border-slate-100">
                                            <td className="py-3 font-medium text-slate-900">{user.email}</td>
                                            <td className="py-3">{user.name}</td>
                                            <td className="py-3">
                                                <select
                                                    value={roleDrafts[user._id] ?? user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                    className="form-select"
                                                >
                                                    {roleOptions.map((role) => (
                                                        <option key={role} value={role}>{role}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3">
                                                <button type="button" className="btn-ghost" onClick={() => handleUpdateRole(user._id)}>Lưu</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;

