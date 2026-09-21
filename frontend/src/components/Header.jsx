import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../store/authSlice.js";
import { fetchCart, resetCart } from "../store/cartSlice.js";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { cart } = useSelector((state) => state.cart);

  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    } else {
      dispatch(resetCart());
    }
  }, [dispatch, isAuthenticated]);

  const getNavLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
    }`;

  const getAdminLinkClass = ({ isActive }) =>
    `block px-4 py-2.5 text-sm transition-colors duration-200 ${
      isActive
        ? "bg-neutral-100 font-semibold text-neutral-950"
        : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-950"
    }`;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    setAdminMenuOpen(false);
    navigate("/");
  };

  const displayName =
    user?.fullName || user?.name || user?.email || "Tài khoản";

  const isAdmin = user?.role === "ADMIN";

  const totalItems = cart?.totalItems || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <NavLink
          to="/"
          className="text-xl font-bold tracking-tight text-neutral-950 transition-opacity duration-200 hover:opacity-70"
        >
          Sneaker Store
        </NavLink>

        <nav className="flex items-center gap-7">
          <NavLink to="/" className={getNavLinkClass}>
            Trang chủ
          </NavLink>

          <NavLink to="/products" className={getNavLinkClass}>
            Sản phẩm
          </NavLink>

          <NavLink to="/about" className={getNavLinkClass}>
            Giới thiệu
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `relative text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`
                }
              >
                Giỏ hàng
                {totalItems > 0 && (
                  <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white">
                    {totalItems}
                  </span>
                )}
              </NavLink>

              <NavLink to="/profile" className={getNavLinkClass}>
                Tài khoản
              </NavLink>

              {isAdmin && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAdminMenuOpen((current) => !current)}
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      adminMenuOpen
                        ? "text-neutral-950"
                        : "text-neutral-500 hover:text-neutral-950"
                    }`}
                  >
                    Quản trị
                  </button>

                  {adminMenuOpen && (
                    <div className="absolute right-0 top-10 w-48 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
                      <NavLink
                        to="/admin"
                        onClick={() => setAdminMenuOpen(false)}
                        className={getAdminLinkClass}
                      >
                        Dashboard
                      </NavLink>

                      <NavLink
                        to="/admin/products"
                        onClick={() => setAdminMenuOpen(false)}
                        className={getAdminLinkClass}
                      >
                        Sản phẩm
                      </NavLink>

                      <NavLink
                        to="/admin/orders"
                        onClick={() => setAdminMenuOpen(false)}
                        className={getAdminLinkClass}
                      >
                        Đơn hàng
                      </NavLink>
                    </div>
                  )}
                </div>
              )}

              <div className="hidden h-6 w-px bg-neutral-200 sm:block" />

              <span className="hidden text-sm text-neutral-500 lg:inline">
                Xin chào,{" "}
                <span className="font-semibold text-neutral-900">
                  {displayName}
                </span>
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:bg-neutral-50"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
            >
              Đăng nhập
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
