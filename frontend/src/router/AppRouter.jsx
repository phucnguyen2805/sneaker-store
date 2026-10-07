import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/ProtectedRoute.jsx";

import AboutPage from "../pages/AboutPage.jsx";
import AdminChatPage from "../pages/AdminChatPage.jsx";
import AdminOrderPage from "../pages/AdminOrderPage.jsx";
import AdminProductPage from "../pages/AdminProductPage.jsx";
import AdminTestPage from "../pages/AdminTestPage.jsx";
import AdminUserPage from "../pages/AdminUserPage.jsx";
import AdminVariantPage from "../pages/AdminVariantPage.jsx";
import CartPage from "../pages/CartPage.jsx";
import CheckoutPage from "../pages/CheckoutPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import OrderDetailPage from "../pages/OrderDetailPage.jsx";
import OrderHistoryPage from "../pages/OrderHistoryPage.jsx";
import ProductDetailPage from "../pages/ProductDetailPage.jsx";
import ProductListPage from "../pages/ProductListPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";
import AdminBrandPage from "../pages/AdminBrandPage.jsx";
import AdminCategoryPage from "../pages/AdminCategoryPage.jsx";

import MainLayout from "../layouts/MainLayout.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/products" element={<ProductListPage />} />

          <Route path="/products/:id" element={<ProductDetailPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />

            <Route path="/cart" element={<CartPage />} />

            <Route path="/checkout" element={<CheckoutPage />} />

            <Route path="/orders" element={<OrderHistoryPage />} />

            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminTestPage />} />

            <Route
              path="/admin-test"
              element={<Navigate to="/admin" replace />}
            />

            <Route path="/admin/chat" element={<AdminChatPage />} />

            <Route path="/admin/products" element={<AdminProductPage />} />

            <Route
              path="/admin/products/:productId/variants"
              element={<AdminVariantPage />}
            />

            <Route path="/admin/orders" element={<AdminOrderPage />} />

            <Route path="/admin/users" element={<AdminUserPage />} />

            <Route path="/admin/brands" element={<AdminBrandPage />} />

            <Route path="/admin/categories" element={<AdminCategoryPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
