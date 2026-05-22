"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    const result = mode === "login"
      ? await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      : await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });

    setLoading(false);

    if (result.error) {
      const errorMessage = result.error.message === "Invalid login credentials"
        ? "Email hoặc mật khẩu không đúng. Nếu vừa đăng ký, hãy xác nhận email trong hộp thư trước khi đăng nhập."
        : result.error.message;
      setMessage(errorMessage);
      return;
    }

    if (mode === "register") {
      if (result.data.session) {
        router.push("/dashboard");
        return;
      }

      setMessage("Đăng ký thành công. Hãy mở email xác nhận từ Supabase rồi đăng nhập lại.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold">{mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h1>
        <p className="mt-2 text-slate-600">Vào dashboard để tạo content TikTok Shop bằng AI.</p>

        <label className="mt-6 block text-sm font-semibold">Email</label>
        <input
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <label className="mt-4 block text-sm font-semibold">Mật khẩu</label>
        <input
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={6}
        />

        <button disabled={loading} className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white disabled:opacity-60">
          {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Đăng ký"}
        </button>

        {message && <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">{message}</p>}

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-5 text-sm font-semibold text-slate-700"
        >
          {mode === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
        </button>
      </form>
    </main>
  );
}
