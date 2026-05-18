import { Outlet } from "react-router-dom";
import Header from "./components/layout/header";
import axios from "./util/axios.customize";
import { useContext, useEffect } from "react";
import { AuthContext } from "./components/context/auth.context";
import { Spin } from "antd";

function App() {
  const { setAuth, appLoading, setAppLoading } = useContext(AuthContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      const res = await axios.get(`/v1/api/account`);
      if (res && !res.message) {
        setAuth({
          isAuthenticated: true,
          user: {
            email: res.email ?? "",
            name: res.name ?? "",
            role: res.role ?? "user",
          }
        })
      }
      setAppLoading(false);
    }
    fetchAccount();
  }, [])

  return (
    <div className="w-full min-h-screen flex flex-col">
      {appLoading === true ? (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)"
        }}>
          <Spin />
        </div>
      ) : (
        <>
          <Header />
          <main className="flex-1 w-full">
            <Outlet />
          </main>
          <footer className="bg-slate-900 text-slate-300 py-12 mt-auto w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-amber-300">📦</span> BookStore
                </h3>
                <p className="text-slate-400">Noi cung cap nhung tri thuc tot nhat voi hang ngan dau sach chat luong, gia uu dai.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Lien ket</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/" className="hover:text-amber-300 transition-colors">Trang chu</a></li>
                  <li><a href="/products" className="hover:text-amber-300 transition-colors">San pham</a></li>
                  <li><a href="/products?promo=true" className="hover:text-amber-300 transition-colors">Khuyen mai</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Ho tro khach hang</h4>
                <ul className="space-y-2 text-sm">
                  <li>Email: hotro@bookstore.vn</li>
                  <li>Hotline: 1900 1000</li>
                  <li>Thoi gian lam viec: 8h - 22h hang ngay</li>
                </ul>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
              © 2026 BookStore. All rights reserved. Phan Ngoc Duy - 23110194.
            </div>
          </footer>
        </>
      )}
    </div>
  )
}

export default App;