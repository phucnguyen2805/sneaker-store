import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { register } from '../store/authSlice.js';

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage('');

    const result = await dispatch(register(formData));

    if (register.fulfilled.match(result)) {
      setSuccessMessage(
        'Đăng ký thành công. Bạn sẽ được chuyển đến trang đăng nhập.',
      );

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-neutral-100 px-6 py-16">
      <div className="mx-auto max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
              Create Account
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
              Đăng ký
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Tạo tài khoản để bắt đầu mua sắm tại Sneaker Store.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Họ và tên
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-neutral-800"
              >
                Mật khẩu
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />

              <p className="mt-2 text-xs text-neutral-400">
                Mật khẩu tối thiểu 6 ký tự.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
            </button>
          </form>

          <div className="mt-6 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="font-semibold text-neutral-900 transition-colors hover:text-neutral-600"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;