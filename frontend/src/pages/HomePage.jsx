import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="overflow-hidden bg-[#f7f7f6]">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* Hero content */}
          <div className="max-w-2xl">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
              Premium Footwear
            </p>

            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-0.045em] text-neutral-950 sm:text-6xl lg:text-7xl">
              Sneakers made
              <span className="block text-neutral-400">for your everyday.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              Khám phá những mẫu sneaker nổi bật, chọn đúng size và màu sắc, rồi
              hoàn tất đơn hàng trực tiếp trên Sneaker Store.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="group inline-flex items-center justify-center rounded-xl bg-neutral-950 px-6 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0"
              >
                <span>Khám phá sản phẩm</span>

                <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>

              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-6 py-3.5 text-sm font-medium text-neutral-900 transition-all duration-300 hover:-translate-y-0.5 hover:border-neutral-950 hover:bg-neutral-50 active:translate-y-0"
              >
                Về Sneaker Store
              </Link>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-y border-neutral-200 py-5">
              <div className="pr-4">
                <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                  01
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Chọn mẫu sneaker
                </p>
              </div>

              <div className="border-l border-neutral-200 px-4">
                <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                  02
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Chọn size & màu
                </p>
              </div>

              <div className="border-l border-neutral-200 pl-4">
                <p className="text-2xl font-semibold tracking-tight text-neutral-950">
                  03
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Đặt hàng trực tuyến
                </p>
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-neutral-950 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.14)] sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_20%_85%,rgba(255,255,255,0.08),transparent_32%)]" />

              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-500">
                    Sneaker Store
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-600">
                    2026 Collection
                  </p>
                </div>

                <div className="relative flex flex-1 items-center justify-center">
                  <div className="absolute h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

                  <div className="absolute h-40 w-40 rounded-full border border-white/5 sm:h-52 sm:w-52" />

                  <div className="relative w-[78%] rotate-[-10deg] transition-transform duration-700 ease-out hover:rotate-[-5deg] hover:scale-105">
                    <div className="relative">
                      <div className="h-20 rounded-[40px_28px_24px_18px] border border-white/10 bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-500 shadow-[0_25px_50px_rgba(0,0,0,0.38)] sm:h-24" />

                      <div className="absolute left-[8%] top-[24%] h-8 w-[55%] -skew-x-12 border-b-2 border-neutral-400/70 sm:h-9" />

                      <div className="absolute bottom-[-13px] left-[6%] right-[2%] h-5 rounded-full bg-white shadow-[0_8px_18px_rgba(255,255,255,0.22)] sm:h-6" />

                      <div className="absolute right-[5%] top-[10%] h-14 w-20 rounded-[10px_18px_18px_10px] border-l border-white/20 bg-neutral-700/60 sm:h-16 sm:w-24" />

                      <div className="absolute left-[19%] top-[8%] h-5 w-16 -skew-x-12 rounded-full bg-neutral-200/80 sm:w-20" />

                      <div className="absolute left-[33%] top-[13%] h-5 w-16 -skew-x-12 rounded-full bg-neutral-200/60 sm:w-20" />

                      <div className="absolute left-[47%] top-[18%] h-5 w-14 -skew-x-12 rounded-full bg-neutral-200/40 sm:w-16" />
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Everyday essentials
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      Move with confidence.
                    </p>
                  </div>

                  <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 sm:flex">
                    <span className="text-sm text-neutral-400">01</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-neutral-200 bg-white px-5 py-4 shadow-[0_15px_35px_rgba(0,0,0,0.08)] sm:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                Curated selection
              </p>
              <p className="mt-1 text-sm font-semibold text-neutral-950">
                Clean. Simple. Everyday.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection intro */}
      <section className="border-y border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400">
                Our approach
              </p>

              <h2 className="mt-4 max-w-md text-3xl font-semibold tracking-[-0.035em] text-neutral-950 sm:text-4xl">
                Chọn đôi giày phù hợp với cách bạn sống.
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Thiết kế
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Những thiết kế dễ phối, tập trung vào tính ứng dụng hằng ngày.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Lựa chọn
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Chọn theo thương hiệu, size, màu sắc và khoảng giá phù hợp.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-950">
                  Trải nghiệm
                </p>
                <p className="mt-2 text-sm leading-6 text-neutral-500">
                  Từ xem sản phẩm đến đặt hàng, mọi bước đều được giữ gọn và rõ
                  ràng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-neutral-950 px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
                Find your pair
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl">
                Sẵn sàng tìm đôi sneaker tiếp theo?
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400 sm:text-base">
                Xem toàn bộ sản phẩm và tìm mẫu phù hợp với phong cách của bạn.
              </p>
            </div>

            <Link
              to="/products"
              className="group inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-100 active:translate-y-0"
            >
              <span>Xem sản phẩm</span>

              <span className="ml-3 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
