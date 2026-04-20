"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "ホーム" },
  { href: "/library", label: "ライブラリ" },
  { href: "/map", label: "マップ" },
  { href: "/rankings", label: "ランキング" },
  { href: "/compare", label: "比較" },
  { href: "/lab", label: "もしもラボ" },
];

const NAV_SETTINGS = { href: "/settings", label: "設定" };

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(11,15,26,0.72)] border-b border-[var(--border-subtle)]">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <LogoMark />
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-[var(--text-primary)] tracking-tight">Morpho</span>
            <span className="text-[11px] text-[var(--text-dim)] hidden sm:inline font-serif italic">μορφή</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 h-8 rounded-[var(--radius-md)] text-[13px] flex items-center transition-colors",
                  active
                    ? "text-[var(--text-primary)] bg-[var(--bg-elevated)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <span className="w-px h-5 bg-[var(--border-subtle)] mx-1" aria-hidden />
          <Link
            href={NAV_SETTINGS.href}
            aria-label={NAV_SETTINGS.label}
            className={cn(
              "w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center transition-colors",
              pathname.startsWith(NAV_SETTINGS.href)
                ? "text-[var(--text-primary)] bg-[var(--bg-elevated)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
            )}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <div className="relative w-7 h-7 flex items-center justify-center">
      <svg viewBox="0 0 28 28" className="w-7 h-7" aria-hidden="true">
        <defs>
          <linearGradient id="logoG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5EEAD4" />
            <stop offset="100%" stopColor="#F5B454" />
          </linearGradient>
        </defs>
        <circle cx="14" cy="14" r="11" fill="none" stroke="url(#logoG)" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="5" fill="none" stroke="url(#logoG)" strokeWidth="1.5" />
        <circle cx="14" cy="14" r="1.8" fill="url(#logoG)" />
      </svg>
    </div>
  );
}
