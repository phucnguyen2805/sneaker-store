function AboutPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
          About Us
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
          Về Sneaker Store
        </h1>

        <p className="mt-6 text-lg leading-8 text-neutral-600">
          Sneaker Store là dự án thương mại điện tử được xây dựng với mục
          tiêu mô phỏng một cửa hàng sneaker thực tế.
        </p>

        <p className="mt-4 text-base leading-7 text-neutral-600">
          Hệ thống hỗ trợ quản lý sản phẩm, biến thể theo size và màu sắc,
          tồn kho, giỏ hàng, đơn hàng và các chức năng dành cho quản trị viên.
        </p>
      </div>
    </section>
  );
}

export default AboutPage;