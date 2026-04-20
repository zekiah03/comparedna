import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center">
      <div className="badge mb-6">404</div>
      <h1 className="text-3xl font-bold tracking-tight mb-3">その分類は見つかりません</h1>
      <p className="text-[14px] text-[var(--text-muted)] mb-8">
        URLが間違っているか、まだ分析されていない対象かもしれません。
      </p>
      <div className="flex items-center justify-center gap-2">
        <Link href="/" className="btn btn-primary h-10">ホームに戻る</Link>
        <Link href="/library" className="btn btn-ghost h-10">ライブラリを見る</Link>
      </div>
    </div>
  );
}
