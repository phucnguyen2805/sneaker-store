import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../store/authSlice.js";
import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const { language } = useThemeLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(login(formData));

    if (login.fulfilled.match(result)) {
      const user = result.payload?.user || {
        role: result.payload?.role || "USER",
      };

      if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f7f6] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="border-b border-neutral-100 px-6 py-8 sm:px-8 sm:py-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              {t.login.eyebrow}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
              {t.login.title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {t.login.description}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  {t.login.email}
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.login.emailPlaceholder}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  {t.login.password}
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.login.passwordPlaceholder}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? t.login.loggingIn : t.login.submit}</span>

                {!loading && (
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
              {t.login.noAccount}{" "}
              <Link
                to="/register"
                className="font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-500"
              >
                {t.login.register}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
