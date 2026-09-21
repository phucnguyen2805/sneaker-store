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
    `group relative whitespace-nowrap px-1 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"
    }`;

  const getAdminLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm transition-colors duration-200 ${
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
    <header className="sticky top-0 z-50 border-b border-neutral-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex min-h-[76px] items-center justify-between gap-6">
          {/* Logo */}
          <NavLink
            to="/"
            className="shrink-0 transition-opacity duration-200 hover:opacity-65"
          >
            <div className="text-lg font-bold tracking-[-0.03em] text-neutral-950 sm:text-xl">
              Sneaker Store
            </div>

            <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-neutral-400">
              Premium Footwear
            </div>
          </NavLink>

          {/* Navigation */}
          <nav className="hidden items-center gap-5 md:flex lg:gap-7">
            <NavLink to="/" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  Trang chủ
                  <span
                    className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/products" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  Sản phẩm
                  <span
                    className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/about" className={getNavLinkClass}>
              {({ isActive }) => (
                <>
                  Giới thiệu
                  <span
                    className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                      isActive
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>

            {isAuthenticated && (
              <>
                <NavLink to="/cart" className={getNavLinkClass}>
                  {({ isActive }) => (
                    <>
                      <span className="flex items-center gap-2">
                        Giỏ hàng
                        {totalItems > 0 && (
                          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                            {totalItems}
                          </span>
                        )}
                      </span>

                      <span
                        className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </>
                  )}
                </NavLink>

                <NavLink to="/profile" className={getNavLinkClass}>
                  {({ isActive }) => (
                    <>
                      Tài khoản
                      <span
                        className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </>
                  )}
                </NavLink>

                {isAdmin && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAdminMenuOpen((current) => !current)}
                      className={`relative px-1 py-2 text-sm font-semibold transition-colors duration-200 ${
                        adminMenuOpen
                          ? "text-neutral-950"
                          : "text-neutral-500 hover:text-neutral-950"
                      }`}
                    >
                      Quản trị
                      <span
                        className={`absolute inset-x-1 bottom-0 h-px origin-left bg-neutral-950 transition-transform duration-300 ${
                          adminMenuOpen ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </button>

                    <div
                      className={`absolute right-0 top-[calc(100%+12px)] w-52 origin-top-right overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.10)] transition-all duration-200 ${
                        adminMenuOpen
                          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                          : "pointer-events-none -translate-y-2 scale-95 opacity-0"
                      }`}
                    >
                      <div className="border-b border-neutral-100 px-4 py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                          Khu vực quản trị
                        </p>
                      </div>

                      <div className="py-1">
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
                          Quản lý sản phẩm
                        </NavLink>

                        <NavLink
                          to="/admin/orders"
                          onClick={() => setAdminMenuOpen(false)}
                          className={getAdminLinkClass}
                        >
                          Quản lý đơn hàng
                        </NavLink>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* User actions */}
          <div className="flex shrink-0 items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden border-l border-neutral-200 pl-5 lg:block">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400">
                    Xin chào
                  </p>

                  <p className="mt-0.5 max-w-32 truncate text-sm font-semibold text-neutral-900">
                    {displayName}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white active:translate-y-0 sm:px-5"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 sm:px-5"
              >
                Đăng nhập
              </NavLink>
            )}
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="flex gap-5 overflow-x-auto border-t border-neutral-100 py-3 md:hidden">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-950"
              }`
            }
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-950"
              }`
            }
          >
            Sản phẩm
          </NavLink>

          <NavLink
            to="/about"
            className={({ isActive }) =>
              `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "text-neutral-950"
                  : "text-neutral-500 hover:text-neutral-950"
              }`
            }
          >
            Giới thiệu
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink
                to="/cart"
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`
                }
              >
                Giỏ hàng
                {totalItems > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-950 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                    {totalItems}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-neutral-950"
                      : "text-neutral-500 hover:text-neutral-950"
                  }`
                }
              >
                Tài khoản
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? "text-neutral-950"
                        : "text-neutral-500 hover:text-neutral-950"
                    }`
                  }
                >
                  Quản trị
                </NavLink>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
