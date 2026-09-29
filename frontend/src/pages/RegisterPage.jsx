import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../store/authSlice.js";
import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  const { language } = useThemeLanguage();
  const t = translations[language];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      navigate("/login");
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [successMessage, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSuccessMessage("");

    const result = await dispatch(register(formData));

    if (register.fulfilled.match(result)) {
      setSuccessMessage(t.register.successMessage);
    }
  };

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[#f7f7f6] px-6 py-16 sm:py-20">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
          <div className="border-b border-neutral-100 px-6 py-8 sm:px-8 sm:py-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
              {t.register.eyebrow}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">
              {t.register.title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-neutral-500">
              {t.register.description}
            </p>
          </div>

          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  {t.register.fullName}
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t.register.fullNamePlaceholder}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-neutral-800"
                >
                  {t.register.email}
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.register.emailPlaceholder}
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
                  {t.register.password}
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.register.passwordPlaceholder}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition-all duration-200 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                />

                <p className="mt-2 text-xs text-neutral-400">
                  {t.register.passwordHint}
                </p>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-between rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>
                  {loading ? t.register.creatingAccount : t.register.submit}
                </span>

                {!loading && (
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-neutral-200 pt-6 text-center text-sm text-neutral-500">
              {t.register.hasAccount}{" "}
              <Link
                to="/login"
                className="font-semibold text-neutral-900 transition-colors duration-200 hover:text-neutral-500"
              >
                {t.register.login}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
