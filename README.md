# Sneaker Store

Website thương mại điện tử Full-stack chuyên kinh doanh giày thể thao, được xây dựng bằng Java Spring Boot và ReactJS.

## Tech Stack

### Backend

- **Ngôn ngữ & Framework:** Java 17, Spring Boot, Spring Data JPA, Spring Security
- **Xác thực:** JWT (JSON Web Token)
- **Database & Tool:** MySQL, Liquibase
- **Logging & Build:** Log4j2, Maven

### Frontend

- **Ngôn ngữ & Framework:** ReactJS, Vite
- **Quản lý State:** Redux Toolkit
- **Routing & Gọi API:** React Router, Axios
- **Giao diện:** Tailwind CSS

---

## Chức năng chính

### Dành cho Khách hàng (Customer)

- Đăng ký và đăng nhập (Xác thực bằng JWT).
- Duyệt, tìm kiếm và lọc sản phẩm (theo thương hiệu, danh mục, kích cỡ, giá cả).
- Xem chi tiết sản phẩm.
- Lựa chọn màu sắc và kích cỡ giày.
- Quản lý giỏ hàng (Thêm, cập nhật, xóa sản phẩm).
- Thanh toán đơn hàng (Checkout).
- Xem lịch sử và chi tiết đơn hàng.
- Hủy đơn hàng.
- Quản lý hồ sơ cá nhân.

### Dành cho Quản trị viên (Admin)

- Dashboard thống kê tổng quan.
- Quản lý sản phẩm (CRUD).
- Quản lý biến thể sản phẩm (Kích cỡ và màu sắc).
- Quản lý đơn hàng của khách hàng (Cập nhật trạng thái).
- Xem thống kê doanh thu và đơn hàng.

---

## Cấu trúc dự án

```text
sneaker-store/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sneakerstore/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── dto/
│   │   │   │   ├── entity/
│   │   │   │   ├── exception/
│   │   │   │   ├── repository/
│   │   │   │   ├── security/
│   │   │   │   ├── service/
│   │   │   │   └── specification/
│   │   │   └── resources/
│   │   │       ├── db/changelog/
│   │   │       ├── application.properties
│   │   │       └── log4j2-spring.xml
│   │   └── test/
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── router/
│   │   ├── services/
│   │   ├── store/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## Hướng dẫn cài đặt và chạy dự án

### 1. Cấu hình & Chạy Backend

Backend sử dụng biến môi trường cho các thông tin nhạy cảm. Bạn cần thiết lập các biến này trước khi chạy ứng dụng.

**Biến môi trường yêu cầu:**

```env
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRATION=86400000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Cơ sở dữ liệu:**

- Dự án sử dụng MySQL và Liquibase để quản lý phiên bản database.
- Tên Database cần tạo: `sneaker_store`
- Changelogs của Liquibase nằm tại: `backend/src/main/resources/db/changelog/`
- Master changelog: `db.changelog-master.yaml`

**Chạy Backend:**
Mở terminal và thực thi các lệnh sau:

```bash
cd backend
# Sau khi đã set các biến môi trường
mvnw.cmd spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

### 2. Cấu hình & Chạy Frontend

Mở một terminal mới:

```bash
cd frontend
npm install
```

**Cấu hình biến môi trường Frontend:**
Tạo file `frontend/.env.local` với nội dung sau:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

_(Lưu ý: Không commit file `.env.local` lên Git)._

**Chạy Frontend:**

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

---

## Xác thực (Authentication)

- Ứng dụng sử dụng **JWT (JSON Web Token)**.
- Frontend lưu trữ Access Token và tự động đính kèm vào các request thông qua Header:
  `Authorization: Bearer <token>`
- Các Route bảo vệ (Protected Routes) yêu cầu phải đăng nhập.
- Các Route dành cho Admin yêu cầu tài khoản phải có quyền `ADMIN`.

---

## API Endpoints

Base URL của Backend REST API: `http://localhost:8080/api`

**Các nhóm API chính:**

- `/api/auth` - Xác thực (Login, Register)
- `/api/products` - Quản lý sản phẩm
- `/api/brands` - Quản lý thương hiệu
- `/api/categories` - Quản lý danh mục
- `/api/sizes` - Quản lý kích cỡ
- `/api/colors` - Quản lý màu sắc
- `/api/variants` - Quản lý biến thể sản phẩm
- `/api/cart` - Quản lý giỏ hàng
- `/api/orders` - Quản lý đơn hàng (Customer)
- `/api/admin/orders` - Quản lý đơn hàng (Admin)
- `/api/admin/statistics` - Thống kê báo cáo

---

## Build Frontend (Production)

Để build giao diện frontend cho môi trường production, chạy lệnh sau:

```bash
cd frontend
npm run build
```

---

## Mục tiêu dự án

Dự án này được phát triển như một ứng dụng thương mại điện tử toàn diện nhằm minh họa các kỹ năng:

- Phát triển REST API.
- Thiết kế cơ sở dữ liệu với JPA và MySQL.
- Quản lý phiên bản cơ sở dữ liệu (Migration) bằng Liquibase.
- Phân quyền và xác thực bảo mật với JWT.
- Kiểm soát truy cập dựa trên vai trò (Role-based access control).
- Xử lý logic nghiệp vụ có tính giao dịch (Transactional business logic).
- Quản lý State trong React với Redux Toolkit.
- Tích hợp API với Axios.
- Xây dựng giao diện thương mại điện tử Responsive.
- Phát triển các tính năng quản trị hệ thống (Admin Panel).
