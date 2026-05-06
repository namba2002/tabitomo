"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function CreatedContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const name = searchParams.get("name") ?? "";
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500">無効なURLです。</p>
          <Link href="/" className="text-blue-500 underline mt-4 block">
            トップに戻る
          </Link>
        </div>
      </main>
    );
  }

  const roomUrl = typeof window !== "undefined"
    ? `${window.location.origin}/rooms/${slug}`
    : `/rooms/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = roomUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* 成功アイコン */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">
            ルームを作成しました！
          </h1>
          {name && (
            <p className="text-base font-semibold text-blue-500 mb-2">「{name}」</p>
          )}
          <p className="text-sm text-gray-500 leading-relaxed">
            このURLをみんなに共有して、<br />
            一緒に行きたい場所を追加しましょう
          </p>
        </div>

        {/* URLカード */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <p className="text-xs text-gray-400 mb-2 font-medium">共有URL</p>
          <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 break-all">
            <span className="text-sm text-gray-700">{roomUrl}</span>
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {copied ? "✓ コピーしました！" : "URLをコピーする"}
          </button>
        </div>

        {/* ルームを開くボタン */}
        <Link
          href={`/rooms/${slug}`}
          className="block w-full py-3.5 rounded-xl font-semibold text-sm text-center bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-50 transition-colors active:scale-95 mb-4"
        >
          ルームを開く
        </Link>

        {/* 新しいルームリンク */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 underline">
            新しいルームを作成する
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CreatedPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </main>
    }>
      <CreatedContent />
    </Suspense>
  );
}
