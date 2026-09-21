import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Chưa đăng nhập thì bắt buộc về trang Login.
  // Lưu lại trang người dùng đang muốn truy cập để sau này
  // có thể quay lại đúng trang đó sau khi đăng nhập.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Nếu route có giới hạn role thì kiểm tra role hiện tại.
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role;

    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}

export default ProtectedRoute;