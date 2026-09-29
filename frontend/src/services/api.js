import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Tự động gắn JWT vào mọi request nếu người dùng đã đăng nhập.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    /*
     * Nếu request gửi FormData:
     * - Không tự set Content-Type.
     * - Browser/Axios sẽ tự tạo multipart boundary chính xác.
     *
     * Nếu request gửi dữ liệu thông thường:
     * - Dùng application/json.
     */
    if (config.data instanceof FormData) {
      if (config.headers && typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
    } else if (config.headers) {
      if (typeof config.headers.set === "function") {
        config.headers.set("Content-Type", "application/json");
      } else {
        config.headers["Content-Type"] = "application/json";
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/*
 * Tự xử lý khi JWT hết hạn hoặc không còn hợp lệ.
 *
 * Lưu ý:
 * Không xử lý /auth/login và /auth/register ở đây,
 * vì đăng nhập sai hoặc đăng ký lỗi có thể trả về 401/4xx
 * và người dùng vẫn cần ở lại đúng trang để xem thông báo lỗi.
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/register");

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      /*
       * Chỉ chuyển trang khi người dùng chưa ở /login.
       * replace giúp tránh trường hợp bấm Back quay lại trang
       * yêu cầu đăng nhập bằng token đã hết hạn.
       */
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  },
);

export default api;
