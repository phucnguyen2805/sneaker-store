import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';

import { logout } from '../store/authSlice.js';

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getNavLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-neutral-950'
        : 'text-neutral-500 hover:text-neutral-950'
    }`;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const displayName =
    user?.fullName || user?.name || user?.email || 'Tài khoản';

  const isAdmin = user?.role === 'ADMIN';

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
          <NavLink
            to="/"
            className={getNavLinkClass}
          >
            Trang chủ
          </NavLink>

          <NavLink
            to="/about"
            className={getNavLinkClass}
          >
            Giới thiệu
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink
                to="/profile"
                className={getNavLinkClass}
              >
                Tài khoản
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/admin-test"
                  className={({ isActive }) =>
                    `text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? 'text-neutral-950'
                        : 'text-neutral-500 hover:text-neutral-950'
                    }`
                  }
                >
                  Quản trị
                </NavLink>
              )}

              <div className="hidden h-6 w-px bg-neutral-200 sm:block" />

              <span className="hidden text-sm text-neutral-500 lg:inline">
                Xin chào,{' '}
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
              className="rounded-lg bg-neutral-950 px-5 py-2.5 text-sm font-medium !text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800"
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