function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-89px)] max-w-7xl items-center px-6 py-16">
      <section className="w-full">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          Sneaker Store
        </p>

        <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight text-neutral-950">
          Find the sneakers that fit your style.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-600">
          Khám phá các mẫu sneaker, lựa chọn size và màu sắc phù hợp,
          sau đó đặt hàng trực tiếp trên cửa hàng.
        </p>
      </section>
    </main>
  );
}

export default HomePage;