import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { CartContext } from '../context/cart.context';
import { Search, ShoppingCart, User, LogOut, Package, Crown, Truck, ChevronDown } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);

    const cartCount = cart?.summary?.totalQuantity || 0;

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) navigate(`/products?q=${encodeURIComponent(searchTerm)}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        setAuth({ isAuthenticated: false, user: { id: '', email: '', name: '', role: '' } });
        window.location.href = '/';
    };

    const profileByRole = { admin: '/admin/profile', vendor: '/vendor/shop', manager: '/manager/vendors', user: '/user/profile' };
    const profileUrl = profileByRole[auth?.user?.role] || '/user/profile';

    return (
        <header>
            {/* ── Top bar ── */}
            <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: '#f97316', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: 14
                        }}>BK</div>
                        <span style={{ fontWeight: 700, fontSize: 18, color: '#1a1a1a' }}>BookStore</span>
                    </Link>

                    {/* Search bar */}
                    <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 520, position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sách, tác giả..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', height: 40,
                                border: '2px solid #f97316', borderRadius: 6,
                                padding: '0 44px 0 14px', fontSize: 14,
                                outline: 'none', color: '#1a1a1a'
                            }}
                        />
                        <button type="submit" style={{
                            position: 'absolute', right: 0, top: 0,
                            width: 40, height: 40, border: 'none',
                            background: '#f97316', borderRadius: '0 6px 6px 0',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Search style={{ width: 18, height: 18, color: '#fff' }} />
                        </button>
                    </form>

                    {/* Right icons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 'auto' }}>
                        {/* Cart */}
                        <Link to="/cart" style={{ position: 'relative', color: '#4b5563', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <ShoppingCart style={{ width: 22, height: 22 }} />
                            <span style={{ fontSize: 13, fontWeight: 500, display: 'none' }}>Giỏ hàng</span>
                            {cartCount > 0 && (
                                <span style={{
                                    position: 'absolute', top: -8, right: -10,
                                    background: '#f97316', color: '#fff',
                                    fontSize: 11, fontWeight: 700,
                                    width: 18, height: 18, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>{cartCount}</span>
                            )}
                        </Link>

                        {/* User */}
                        {auth.isAuthenticated ? (
                            <div style={{ position: 'relative' }} onMouseEnter={() => setMenuOpen(true)} onMouseLeave={() => setMenuOpen(false)}>
                                <button style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 13, color: '#1a1a1a', fontWeight: 500
                                }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: '#f97316', color: '#fff',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: 13
                                    }}>
                                        {(auth.user.name || auth.user.email).charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {auth.user.name || auth.user.email.split('@')[0]}
                                    </span>
                                    <ChevronDown style={{ width: 14, height: 14 }} />
                                </button>

                                {menuOpen && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '100%',
                                        width: 200, background: '#fff',
                                        border: '1px solid #e5e7eb', borderRadius: 8,
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                        zIndex: 100, paddingTop: 4, paddingBottom: 4
                                    }}>
                                        {[
                                            { to: profileUrl, label: 'Hồ sơ của tôi', icon: User },
                                            { to: '/orders', label: 'Đơn hàng', icon: Package },
                                            { to: '/favorites', label: 'Yêu thích', icon: Package },
                                        ].map(item => (
                                            <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontSize: 13, color: '#374151' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <item.icon style={{ width: 14, height: 14 }} />
                                                {item.label}
                                            </Link>
                                        ))}
                                        {auth.user.role === 'vendor' && (
                                            <Link to="/vendor/shop" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontSize: 13, color: '#374151' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <Package style={{ width: 14, height: 14 }} /> Quản lý Shop
                                            </Link>
                                        )}
                                        {auth.user.role === 'manager' && (
                                            <Link to="/manager/vendors" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontSize: 13, color: '#374151' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <Crown style={{ width: 14, height: 14 }} /> Quản lý Vendor
                                            </Link>
                                        )}
                                        {auth.user.role === 'admin' && (
                                            <Link to="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', fontSize: 13, color: '#374151' }}
                                                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                                <Crown style={{ width: 14, height: 14 }} /> Admin Dashboard
                                            </Link>
                                        )}
                                        <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
                                        <button onClick={handleLogout} style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '9px 16px', fontSize: 13, color: '#ef4444',
                                            background: 'none', border: 'none', cursor: 'pointer', width: '100%'
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <LogOut style={{ width: 14, height: 14 }} /> Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Link to="/login" style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <User style={{ width: 16, height: 16 }} /> Đăng nhập
                                </Link>
                                <Link to="/register" className="btn-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Nav bar (orange) ── */}
            <div style={{ background: '#f97316' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                    <Link to="/products" style={{ color: '#fff', fontWeight: 700, fontSize: 13, padding: '0 16px', borderRight: '1px solid rgba(255,255,255,0.3)', height: '100%', display: 'flex', alignItems: 'center', letterSpacing: '0.04em' }}>
                        ☰ TẤT CẢ SÁCH
                    </Link>
                    {[
                        { to: '/products?sort=newest', label: 'Sách Mới' },
                        { to: '/products?sort=best', label: 'Bán Chạy' },
                        { to: '/products?promo=true', label: 'Khuyến Mãi' },
                        { to: '/products?sort=viewed', label: 'Xem Nhiều' },
                    ].map(item => (
                        <Link key={item.to} to={item.to} style={{ color: '#fff', fontSize: 13, fontWeight: 500, padding: '0 16px', height: '100%', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            {item.label}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
};

export default Header;