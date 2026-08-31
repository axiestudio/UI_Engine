import * as React from "react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — contacts, inboxes, deployments: groups + pinned headers.
// JOB      scan a long grouped list knowing where you are
// SIGNATURE each group header sticks at the scroll edge and the NEXT header
//           pushes it up (classic iOS stack, done with position stack math,
//           no JS scroll listener); rows get a slide reveal on first view.
// A11Y     grouped ol structure; header counts in text.

export type GroupList<T> = { key: string; header: React.ReactNode; rows: T[] }
export type StickyGroupListProps<T> = { groups: GroupList<T>[]; renderRow: (t: T) => React.ReactNode; height?: string; className?: string }

export function StickyGroupList<T>({ groups, renderRow, height = "520px", className }: StickyGroupListProps<T>) {
  return (
    <div className={cn("overflow-y-auto rounded-xl border bg-card font-sans", className)} style={{ height }} tabIndex={0}>
      {groups.map((g) => (
        <section key={g.key} aria-label={g.key}>
          <h3 className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-muted/70 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
            {g.header}<span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] tabular-nums">{g.rows.length}</span>
          </h3>
          <ol>{g.rows.map((r, i) => <li key={i} className="px-4 py-2.5 transition-colors hover:bg-muted/40 odd:bg-transparent">{renderRow(r)}</li>)}</ol>
        </section>
      ))}
    </div>
  )
}
