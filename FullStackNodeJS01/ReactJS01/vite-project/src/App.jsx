import { Outlet, Link } from 'react-router-dom';
import Header from './components/layout/header';
import axios from './util/axios.customize';
import { useContext, useEffect } from 'react';
import { AuthContext } from './components/context/auth.context';
import { Spin } from 'antd';

function App() {
    const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

    useEffect(() => {
        const fetchAccount = async () => {
            setAppLoading(true);
            const res = await axios.get('/v1/api/account');
            if (res && !res.message) {
                setAuth({
                    isAuthenticated: true,
                    user: {
                        id: res.id ?? '',
                        email: res.email ?? '',
                        name: res.name ?? '',
                        role: (res.role ?? 'user').toLowerCase(),
                    },
                });
            }
            setAppLoading(false);
        };
        fetchAccount();
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {appLoading === true ? (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}>
                    <Spin />
                </div>
            ) : (
                <>
                    <Header />
                    <main style={{ flex: 1, width: '100%' }}>
                        <Outlet />
                    </main>
                    <footer style={{ background: '#1a1a1a', color: '#9ca3af', paddingTop: 40, paddingBottom: 20, marginTop: 'auto' }}>
                        <div className="container">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginBottom: 32 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <div style={{ width: 30, height: 30, background: '#f97316', borderRadius: 6, color: '#fff', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>BK</div>
                                        <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>BookStore</span>
                                    </div>
                                    <p style={{ fontSize: 13, lineHeight: 1.7 }}>Nơi cung cấp những tri thức tốt nhất với hàng ngàn đầu sách chất lượng.</p>
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Liên kết</h4>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {[['/', 'Trang chủ'], ['/products', 'Tất cả sách'], ['/products?promo=true', 'Khuyến mãi']].map(([to, label]) => (
                                            <li key={to}><Link to={to} style={{ fontSize: 13, color: '#9ca3af', textDecoration: 'none', transition: 'color 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#f97316'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>{label}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 style={{ color: '#fff', fontWeight: 600, marginBottom: 14, fontSize: 14 }}>Hỗ trợ khách hàng</h4>
                                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                                        <li>📧 hotro@bookstore.vn</li>
                                        <li>📞 Hotline: 1900 1000</li>
                                        <li>🕐 8h - 22h hàng ngày</li>
                                    </ul>
                                </div>
                            </div>
                            <div style={{ borderTop: '1px solid #374151', paddingTop: 16, textAlign: 'center', fontSize: 12 }}>
                                © 2026 BookStore. All rights reserved. Phan Ngoc Duy — 23110194.
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}

export default App;