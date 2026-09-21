import { useSelector } from 'react-redux';

function ProfilePage() {
  const { user } = useSelector((state) => state.auth);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-2xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          My Account
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
          Hồ sơ tài khoản
        </h1>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Họ và tên
          </p>

          <p className="mt-1 text-lg font-semibold text-neutral-900">
            {user?.fullName || user?.name || 'Chưa cập nhật'}
          </p>

          <p className="mt-5 text-sm text-neutral-500">
            Email
          </p>

          <p className="mt-1 text-lg font-semibold text-neutral-900">
            {user?.email || 'Chưa cập nhật'}
          </p>

          <p className="mt-5 text-sm text-neutral-500">
            Role
          </p>

          <p className="mt-1 text-lg font-semibold text-neutral-900">
            {user?.role || 'USER'}
          </p>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;