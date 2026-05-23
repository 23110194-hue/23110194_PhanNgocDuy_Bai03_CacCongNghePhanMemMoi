import React, { useEffect, useState, useMemo } from 'react';
import { notification } from 'antd';
import { getAdminUsersApi, updateAdminUserRoleApi } from '../../util/api';
import Pagination from '../../components/Pagination';

const PAGE_SIZE = 10;

const ROLE_STYLE = {
    admin:   { bg: '#fff7ed', color: '#f97316', border: '#fed7aa' },
    manager: { bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe' },
    vendor:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    user:    { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
};
const roleOptions = ['user', 'vendor', 'manager', 'admin'];

const PanelUsers = () => {
    const [users, setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [drafts, setDrafts] = useState({});
    const [page, setPage]     = useState(1);

    const fetchUsers = async () => {
        setLoading(true);
        const res = await getAdminUsersApi();
        setLoading(false);
        if (res && !res.message) { setUsers(res.items || []); return; }
        notification.error({ message: 'Không thể tải người dùng', description: res?.message });
    };
    useEffect(() => { fetchUsers(); }, []);

    const totalPages = Math.ceil(users.length / PAGE_SIZE);
    const paged = useMemo(() => users.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [users, page]);

    const handleSave = async (userId) => {
        const role = drafts[userId];
        if (!role) { notification.warning({ message: 'Chưa thay đổi role' }); return; }
        const res = await updateAdminUserRoleApi(userId, role);
        if (res && !res.message) {
            notification.success({ message: 'Đã cập nhật role' });
            setUsers(prev => prev.map(u => u._id === res._id ? res : u));
            setDrafts(prev => { const n={...prev}; delete n[userId]; return n; });
            return;
        }
        notification.error({ message: 'Không thể cập nhật', description: res?.message });
    };

    if (loading) return <div style={{ color: '#9ca3af', padding: 20 }}>Đang tải...</div>;

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{users.length} tài khoản</span>
                <button onClick={fetchUsers} style={{ fontSize: 13, color: '#f97316', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>↻ Làm mới</button>
            </div>

            <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {['Email', 'Tên', 'Role hiện tại', 'Đổi role', ''].map((h, i) => (
                                    <th key={i} style={{ textAlign: 'left', padding: '11px 16px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paged.map((user, i) => {
                                const rs = ROLE_STYLE[user.role] || ROLE_STYLE.user;
                                const draft = drafts[user._id] ?? user.role;
                                const changed = drafts[user._id] && drafts[user._id] !== user.role;
                                return (
                                    <tr key={user._id} style={{ borderBottom: i < paged.length-1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <td style={{ padding: '11px 16px', color: '#374151', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</td>
                                        <td style={{ padding: '11px 16px', fontWeight: 600, color: '#111' }}>{user.name}</td>
                                        <td style={{ padding: '11px 16px' }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: rs.bg, color: rs.color, border: `1px solid ${rs.border}` }}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td style={{ padding: '11px 16px' }}>
                                            <select value={draft} onChange={e => setDrafts(p => ({...p, [user._id]: e.target.value}))}
                                                style={{ border: `1px solid ${changed ? '#f97316' : '#e5e7eb'}`, borderRadius: 6, padding: '5px 8px', fontSize: 13, outline: 'none', background: changed ? '#fff7ed' : '#fff' }}>
                                                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '11px 16px' }}>
                                            <button onClick={() => handleSave(user._id)}
                                                style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 6, cursor: 'pointer', border: 'none', background: changed ? '#f97316' : '#f3f4f6', color: changed ? '#fff' : '#9ca3af' }}>
                                                Lưu
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo(0,0); }} />
        </div>
    );
};

export default PanelUsers;
