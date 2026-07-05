"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "비밀번호가 올바르지 않습니다.");
        return;
      }
      const next = searchParams.get("next") ?? "/";
      router.replace(next);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-center text-lg font-bold">대한민국 여행 스크래치 맵</h1>
      <p className="text-center text-sm text-slate-500">입장 비밀번호를 입력하세요.</p>
      <input
        type="password"
        inputMode="numeric"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        aria-label="비밀번호"
        className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting || password.length === 0}
        className="w-full rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
      >
        입장하기
      </button>
    </form>
  );
}
