import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 px-6 py-10">
      <section className="mx-auto flex max-w-5xl flex-col gap-10 rounded-3xl bg-white p-8 shadow-sm md:p-12">
        <nav className="flex items-center justify-between">
          <div className="text-xl font-bold">SellerAI</div>
          <Link href="/login" className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
            Đăng nhập
          </Link>
        </nav>

        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">AI tool cho TikTok Shop</p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl">
              Tạo caption bán hàng trong vài giây.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Nhập tên sản phẩm, tệp khách hàng, phong cách. AI sẽ tạo hook, caption, hashtag, script video và CTA để seller đăng bài nhanh hơn.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/dashboard" className="rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white">
                Dùng thử
              </Link>
              <a href="#pricing" className="rounded-2xl border border-slate-300 px-6 py-3 font-semibold text-slate-800">
                Xem giá
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Demo output</p>
              <h2 className="mt-3 text-xl font-bold">Serum giảm mụn cho nữ 18–25</h2>
              <p className="mt-4 text-slate-700">Hook: “Da mụn mãi không hết? Có thể bạn đang thiếu bước này…”</p>
              <p className="mt-3 text-slate-700">Caption: “Một chai serum nhỏ nhưng cứu mood cả ngày. Dành cho nàng muốn da dịu hơn, tự tin hơn mỗi sáng.”</p>
              <p className="mt-3 text-slate-500">#serumtrimun #tiktokshop #skincare</p>
            </div>
          </div>
        </div>

        <section id="pricing" className="grid gap-4 md:grid-cols-3">
          {["Free - 5 lượt/ngày", "Pro - 99k/tháng", "Agency - 299k/tháng"].map((plan) => (
            <div key={plan} className="rounded-2xl border border-slate-200 p-5">
              <h3 className="font-bold">{plan}</h3>
              <p className="mt-2 text-sm text-slate-600">Phù hợp để test thị trường và thu tiền sớm.</p>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
