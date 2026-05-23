import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import RegisterPage from './pages/register.jsx';
import UserPage from './pages/user.jsx';
import HomePage from './pages/home.jsx';
import LoginPage from './pages/login.jsx';
import ForgotPasswordPage from './pages/forgotPassword.jsx';
import UserProfile from './pages/UserProfile.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/Cart.jsx';
import CheckoutPage from './pages/Checkout.jsx';
import OrdersPage from './pages/Orders.jsx';
import OrderDetailPage from './pages/OrderDetail.jsx';
import FavoritesPage from './pages/Favorites.jsx';
import VendorShop from './pages/VendorShop.jsx';
import VendorProducts from './pages/VendorProducts.jsx';
import VendorOrders from './pages/VendorOrders.jsx';
import VendorRevenue from './pages/VendorRevenue.jsx';
import VendorReviews from './pages/VendorReviews.jsx';
import VendorFavorites from './pages/VendorFavorites.jsx';
import ManagerVendors from './pages/ManagerVendors.jsx';
import ManagerProducts from './pages/ManagerProducts.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminShops from './pages/AdminShops.jsx';
import AdminRevenue from './pages/AdminRevenue.jsx';
import { AuthWrapper } from './components/context/auth.context.jsx';
import { CartWrapper } from './components/context/cart.context.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <Products /> },
      { path: "product/:slug", element: <ProductDetail /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "favorites", element: <FavoritesPage /> },
      { path: "user", element: <UserPage /> },
      { path: "user/profile", element: <UserProfile /> },
      { path: "admin/profile", element: <AdminProfile /> },
      { path: "admin/orders", element: <AdminOrders /> },
      { path: "admin/users", element: <AdminUsers /> },
      { path: "admin/products", element: <AdminProducts /> },
      { path: "admin/shops", element: <AdminShops /> },
      { path: "admin/revenue", element: <AdminRevenue /> },
      { path: "vendor/shop", element: <VendorShop /> },
      { path: "vendor/products", element: <VendorProducts /> },
      { path: "vendor/orders", element: <VendorOrders /> },
      { path: "vendor/revenue", element: <VendorRevenue /> },
      { path: "vendor/reviews", element: <VendorReviews /> },
      { path: "vendor/favorites", element: <VendorFavorites /> },
      { path: "manager/vendors", element: <ManagerVendors /> },
      { path: "manager/products", element: <ManagerProducts /> },
    ]
  },
  { path: "register", element: <RegisterPage /> },
  { path: "login", element: <LoginPage /> },
  { path: "forgot-password", element: <ForgotPasswordPage /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthWrapper>
      <CartWrapper>
        <RouterProvider router={router} />
      </CartWrapper>
    </AuthWrapper>
  </React.StrictMode>,
)