import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import { useThemeLanguage } from "../context/useThemeLanguage.js";
import { translations } from "../i18n/translations.js";

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  const { language } = useThemeLanguage();
  const t = translations[language];

  const displayName = user?.fullName || user?.name || t.profile.notUpdated;

  const email = user?.email || t.profile.notUpdated;
  const role = user?.role || "USER";

  const initial = displayName.trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f7f6]">
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-28">
        {/* Heading */}
        <div className="border-b border-neutral-200 pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            {t.profile.eyebrow}
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
            {t.profile.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-500 sm:text-base">
            {t.profile.description}
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
          {/* Account information */}
          <div className="overflow-hidden rounded-[1.75rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
            <div className="border-b border-neutral-100 px-6 py-6 sm:px-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
                {t.profile.accountInformation}
              </p>

              <h2 className="mt-1 text-xl font-semibold tracking-tight text-neutral-950">
                {t.profile.personalInformation}
              </h2>
            </div>

            <div className="px-6 py-7 sm:px-8">
              {/* User identity */}
              <div className="flex flex-col gap-5 border-b border-neutral-100 pb-7 sm:flex-row sm:items-center">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-xl font-semibold text-white">
                  {initial || "U"}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                    {t.profile.customer}
                  </p>

                  <h3 className="mt-1 truncate text-xl font-semibold tracking-tight text-neutral-950">
                    {displayName}
                  </h3>

                  <p className="mt-1 truncate text-sm text-neutral-500">
                    {email}
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="divide-y divide-neutral-100">
                <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">
                      {t.profile.fullName}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-neutral-950">
                      {displayName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">
                      {t.profile.email}
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-neutral-950">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-400">
                      {t.profile.role}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-neutral-950">
                      {role === "ADMIN"
                        ? t.profile.admin
                        : t.profile.customerRole}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">
                    {role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-neutral-950 p-6 text-white shadow-[0_15px_45px_rgba(0,0,0,0.10)]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {t.profile.account}
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                {t.profile.manageAccount}
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-400">
                {t.profile.manageDescription}
              </p>
            </div>

            <div className="overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white shadow-[0_15px_45px_rgba(0,0,0,0.05)]">
              <div className="border-b border-neutral-100 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  {t.profile.quickAccess}
                </p>
              </div>

              <div className="p-2">
                <Link
                  to="/orders"
                  className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:text-neutral-950"
                >
                  <span>{t.profile.orderHistory}</span>

                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/products"
                  className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:text-neutral-950"
                >
                  <span>{t.profile.exploreProducts}</span>

                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>

                <Link
                  to="/cart"
                  className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:text-neutral-950"
                >
                  <span>{t.profile.cart}</span>

                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;
