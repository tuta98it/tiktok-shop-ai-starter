"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Generation = {
  id: string;
  product_name: string;
  target_customer: string;
  tone: string;
  output: string;
  created_at: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [productName, setProductName] = useState("Serum giảm mụn");
  const [targetCustomer, setTargetCustomer] = useState("Nữ 18-25, da dầu, thích skincare giá hợp lý");
  const [tone, setTone] = useState("hài hước, gần gũi, bán hàng tự nhiên");
  const [output, setOutput] = useState("");
  const [history, setHistory] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setAuthChecked(true);
      const { data: rows } = await supabase
        .from("generations")
        .select("id, product_name, target_customer, tone, output, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      setHistory((rows ?? []) as Generation[]);
    }
    init();
  }, [router, supabase]);

  async function generate() {
    setLoading(true);
    setOutput("");

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productName, targetCustomer, tone }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setOutput(data.error ?? "Có lỗi xảy ra.");
      return;
    }

    setOutput(data.output);
    setHistory((prev) => [data.generation, ...prev].filter(Boolean).slice(0, 8));
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (!authChecked) {
    return <main className="p-8">Đang tải...</main>;
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <section className="mx-auto max-w-6xl">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">SellerAI Dashboard</h1>
            <p className="mt-1 text-slate-600">Tạo caption, hook, hashtag, script và CTA cho TikTok Shop.</p>
          </div>
          <button onClick={logout} className="rounded-2xl border border-slate-300 px-5 py-2 font-semibold">
            Đăng xuất
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <label className="block text-sm font-semibold">Tên sản phẩm</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />

            <label className="mt-5 block text-sm font-semibold">Khách hàng mục tiêu</label>
            <textarea value={targetCustomer} onChange={(e) => setTargetCustomer(e.target.value)} className="mt-2 h-28 w-full rounded-2xl border border-slate-300 px-4 py-3" />

            <label className="mt-5 block text-sm font-semibold">Phong cách nội dung</label>
            <input value={tone} onChange={(e) => setTone(e.target.value)} className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3" />

            <button onClick={generate} disabled={loading} className="mt-6 rounded-2xl bg-slate-900 px-6 py-3 font-semibold text-white disabled:opacity-60">
              {loading ? "Đang tạo..." : "Tạo content"}
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">Kết quả</h2>
            <pre className="mt-4 min-h-80 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">
              {output || "Kết quả AI sẽ hiển thị ở đây."}
            </pre>
          </div>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Lịch sử gần đây</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {history.map((item) => (
              <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-bold">{item.product_name}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.tone}</p>
                <p className="mt-3 line-clamp-5 whitespace-pre-wrap text-sm text-slate-700">{item.output}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
