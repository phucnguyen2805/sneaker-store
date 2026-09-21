import { BrowserRouter, Route, Routes } from "react-router-dom";

import Header from "../components/Header.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";

import AboutPage from "../pages/AboutPage.jsx";
import AdminTestPage from "../pages/AdminTestPage.jsx";
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
            <Route path="/admin-test" element={<AdminTestPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
