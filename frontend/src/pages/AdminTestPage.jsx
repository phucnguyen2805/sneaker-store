function AdminTestPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
        Admin Area
      </p>

      <h1 className="text-4xl font-bold tracking-tight text-neutral-950">
        Admin Protected Page
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
        Nếu bạn nhìn thấy trang này thì tài khoản hiện tại có quyền ADMIN.
      </p>
    </section>
  );
}

export default AdminTestPage;