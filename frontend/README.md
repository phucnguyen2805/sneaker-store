# Sneaker Store Frontend

Ứng dụng Frontend cho dự án thương mại điện tử Sneaker Store.

## Tech Stack

- ReactJS
- Vite
- Redux Toolkit
- Axios
- React Router
- Tailwind CSS

## Chức năng

### Dành cho Khách hàng (Customer)

- Đăng ký và đăng nhập
- Duyệt sản phẩm
- Tìm kiếm và lọc sản phẩm
- Xem chi tiết sản phẩm
- Chọn kích cỡ và màu sắc
- Thêm sản phẩm vào giỏ hàng
- Cập nhật và xóa sản phẩm trong giỏ hàng
- Thanh toán (Checkout)
- Xem lịch sử đơn hàng
- Xem chi tiết đơn hàng
- Quản lý hồ sơ cá nhân

### Dành cho Quản trị viên (Admin)

- Dashboard thống kê tổng quan
- Quản lý sản phẩm
- Quản lý biến thể sản phẩm
- Quản lý đơn hàng
- Cập nhật trạng thái đơn hàng
- Thống kê doanh thu và đơn hàng

## Cấu trúc dự án

```text
src/
├── components/
├── layouts/
├── pages/
├── router/
├── services/
├── store/
├── App.jsx
├── index.css
└── main.jsx
```

## Biến môi trường (Environment)

Tạo file `.env.local` tại thư mục gốc của frontend:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

_(Lưu ý: Không commit file `.env.local` lên Git)._

## Chạy Development Server

```bash
npm install
npm run dev
```

Development server chạy tại: `http://localhost:5173`

## Build Production

```bash
npm run build
```

## Kiểm tra mã nguồn (Lint)

```bash
npm run lint
```
