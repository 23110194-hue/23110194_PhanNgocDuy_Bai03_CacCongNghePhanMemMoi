import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { Search, ShoppingCart, User, LogOut, Package, Crown } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const { auth, setAuth } = useContext(AuthContext);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/products?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    const handleLogout = () => {
        localStorage.clear("access_token");
        setAuth({ isAuthenticated: false, user: { email: "", name: "", role: "" } });
        navigate("/");
    };

    const profileUrl = auth?.user?.role === 'admin' ? '/admin/profile' : '/user/profile';

    return (
        <header className="bg-white/80 backdrop-blur border-b border-slate-200/60 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
                                BK
                            </div>
                            <span className="font-display text-xl text-slate-900">BookStore</span>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-2xl px-6 hidden md:block">
                        <form onSubmit={handleSearch} className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-white/70 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 sm:text-sm transition"
                                placeholder="Tìm sách, tác giả..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </form>
                    </div>

                    <div className="flex items-center gap-5">
                        <Link to="/products" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">
                            Tất cả sách
                        </Link>

                        <div className="relative cursor-pointer text-slate-500 hover:text-slate-900 transition-colors">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">0</span>
                        </div>

                        <div className="relative group">
                            {auth.isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex flex-col items-end hidden sm:flex">
                                        <span className="text-sm font-medium text-slate-900">
                                            {auth.user.name || auth.user.email.split('@')[0]}
                                        </span>
                                        {auth.user.role === 'admin' ? (
                                            <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                                                <Crown className="w-3 h-3" /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-xs text-emerald-600 font-semibold">Thành viên</span>
                                        )}
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-slate-900 font-bold border border-amber-200 cursor-pointer">
                                        {(auth.user.name || auth.user.email).charAt(0).toUpperCase()}
                                    </div>

                                    <div className="absolute right-0 top-full mt-3 w-48 bg-white rounded-xl shadow-lg py-2 ring-1 ring-black/5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <Link to={profileUrl} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                            <User className="w-4 h-4" /> Hồ sơ của tôi
                                        </Link>
                                        {auth.user.role === 'admin' && (
                                            <Link to="/user" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                                                <Package className="w-4 h-4" /> Quản lý Users
                                            </Link>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-slate-100 flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link to="/login" className="text-slate-500 hover:text-slate-900 font-medium transition-colors">
                                        Đăng nhập
                                    </Link>
                                    <Link to="/register" className="btn-primary">
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;