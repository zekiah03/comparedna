"use client";

import Link from "next/link";
import type { Entry } from "@/lib/types";
import { TYPE_META } from "@/lib/types";
import { RadarMini } from "@/components/radar-chart";
import { cn } from "@/lib/utils";

export function EntryCard({ entry }: { entry: Entry }) {
  const typeColor = TYPE_META[entry.type].color;

  return (
    <Link
      href={`/analyze/${entry.id}`}
      className="card card-interactive block p-5 group animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={cn(
              "badge",
              typeColor === "amber" && "badge-amber",
              typeColor === "teal" && "badge-teal",
              typeColor === "rose" && "badge-rose",
              typeColor === "violet" && "badge-violet",
            )}>
              {entry.type} · {TYPE_META[entry.type].label}
            </span>
            <span className="badge">{entry.category}</span>
            {entry.isVirtual && <span className="badge badge-violet">仮想種</span>}
          </div>
          <h3 className="text-[17px] font-semibold text-[var(--text-primary)] truncate">
            {entry.name}
          </h3>
        </div>
        <RadarMini axes={entry.axes12} />
      </div>
      <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed line-clamp-2 italic">
        {entry.catchphrase}
      </p>
    </Link>
  );
}
