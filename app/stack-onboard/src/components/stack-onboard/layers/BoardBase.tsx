import * as React from "react"
import { cn } from "@/lib/utils"

// ── BOARD BASE — the bottom bun. Skip / continue, lights up when done. ──────

export type BoardBaseProps = {
  cta?: string
  onCta?: () => void
  onSkip?: () => void
  ready?: boolean
  className?: string
}

export function BoardBase({ cta = "Enter the studio", onCta, onSkip, ready, className }: BoardBaseProps) {
  return (
    <div className={cn("flex items-center gap-3 rounded-b-[14px] border-t border-app-line/70 bg-muted/30 px-5 py-3.5", className)}>
      <button
        type="button"
        onClick={onSkip}
        className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip for now
      </button>
      <button
        type="button"
        onClick={onCta}
        aria-disabled={!ready}
        className={cn(
          "ml-auto h-9 rounded-full px-5 text-[11px] font-black uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          ready
            ? "bg-foreground text-background hover:-translate-y-0.5"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        {cta}
      </button>
    </div>
  )
}
