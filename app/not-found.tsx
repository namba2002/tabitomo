import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-6">🗺️</div>
        <h1 className="text-xl font-bold text-gray-800 mb-3">
          この共有リストは見つかりませんでした
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          URLが間違っている可能性があります。<br />
          共有してくれた方にもう一度URLを確認してみましょう。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-500 text-white rounded-xl font-medium text-sm hover:bg-blue-600 transition-colors"
        >
          新しいルームを作成する
        </Link>
      </div>
    </main>
  );
}
