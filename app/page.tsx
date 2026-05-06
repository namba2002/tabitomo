"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaneTakeoff } from "lucide-react";

export default function TopPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmedName = name.trim();
  const isValid = trimmedName.length > 0 && trimmedName.length <= 50;

  async function handleCreateRoom() {
    if (!isValid || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      if (!res.ok) throw new Error();
      const { slug, name: roomName } = await res.json();
      router.push(`/created?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(roomName)}`);
    } catch {
      setError("ルームの作成に失敗しました。もう一度お試しください。");
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4 shadow-lg">
            <PlaneTakeoff className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
            tabitomo
          </h1>
          <p className="text-base text-gray-500">
            みんなで行きたい場所を共有しよう
          </p>
        </div>

        {/* カード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <p className="text-sm text-gray-600 mb-5 leading-relaxed text-center">
            グループ名を入力して<br />
            ルームを作成してください
          </p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              グループ名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
              maxLength={50}
              placeholder="例）大学の友達、家族、会社の同僚"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50"
            />
            {name.length > 0 && (
              <p className={`text-xs mt-1 text-right ${name.length > 50 ? "text-red-400" : "text-gray-400"}`}>
                {name.length}/50
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
          )}

          <button
            onClick={handleCreateRoom}
            disabled={!isValid || isLoading}
            className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold text-base hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? "作成中..." : "ルームを作成する"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          ログイン不要で使えます
        </p>
      </div>
    </main>
  );
}
