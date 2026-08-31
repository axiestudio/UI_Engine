/**
 * Handcraft kit — in-repo crafted primitives (not vendored).
 * Carries the design DNA of the initial presets (zigzag grain, editorial type,
 * hand-tuned constants) so every preset feels made by hand, not generated.
 * Keep constants opinionated; avoid generic utility shells here.
 */
'use client';
import * as React from "react"
import { cn } from "@/lib/utils"

// ── Grain — fractal-noise overlay (the zigzag bg-grain DNA) ─────────────────
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Grain({ opacity = 0.055, className }: { opacity?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-[1] mix-blend-overlay", className)}
      style={{ backgroundImage: GRAIN_URI, opacity }}
    />
  )
}

// ── Dots — faint dotted field (zigzag "faint dots" DNA) ──────────────────────
export function Dots({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.13] [background-image:radial-gradient(circle_at_1px_1px,var(--dot,currentColor)_1px,transparent_0)]", className)}
      style={{ backgroundSize: `${size}px ${size}px`, ["--dot" as string]: "currentColor" }}
    />
  )
}

// ── CornerTicks — hand-placed corner marks (viewfinder DNA) ─────────────────
export function CornerTicks({
  size = 12,
  offset = 10,
  className,
  corners = ["tl", "tr", "bl", "br"],
}: {
  size?: number
  offset?: number
  className?: string
  corners?: ("tl" | "tr" | "bl" | "br")[]
}) {
  const pos: Record<string, string> = {
    tl: `top-[${offset}px] left-[${offset}px] border-t border-l`,
    tr: `top-[${offset}px] right-[${offset}px] border-t border-r`,
    bl: `bottom-[${offset}px] left-[${offset}px] border-b border-l`,
    br: `bottom-[${offset}px] right-[${offset}px] border-b border-r`,
  }
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {corners.map((c) => (
        <span key={c} className={cn("absolute border-current", pos[c])} style={{ width: size, height: size }} />
      ))}
    </span>
  )
}

// ── Sheen — hover light sweep (only animates on group-hover) ─────────────────
export function Sheen({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -translate-x-[110%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%]",
        dark
          ? "bg-[linear-gradient(105deg,transparent_42%,rgba(0,0,0,0.06)_50%,transparent_58%)]"
          : "bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.22)_50%,transparent_58%)]",
        className,
      )}
    />
  )
}

// ── Accent — serif-italic editorial accent word ──────────────────────────────
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <em className={cn("font-serif italic font-medium tracking-normal", className)} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {children}
    </em>
  )
}

// ── MonoLabel — small-caps mono label with tick (index DNA) ─────────────────
export function MonoLabel({ children, className, tick = true }: { children: React.ReactNode; className?: string; tick?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", className)}>
      {tick && <span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />}
      {children}
    </span>
  )
}

// ── SectionShell — the thought-through container ─────────────────────────────
// Widths are hand-picked per content type (not a one-size 1280 shell):
//   760 — statements & forms · 920 — reading/prose · 1120 — feature grids · 1280 — data tables
export type ShellWidth = 760 | 920 | 1120 | 1280

export function SectionShell({
  children,
  width = 1120,
  tone = "paper",
  padding = "roomy",
  rails = false,
  grain = false,
  rule = "none",
  id,
  className,
}: {
  children: React.ReactNode
  width?: ShellWidth
  tone?: "paper" | "ink"
  padding?: "roomy" | "tight" | "grand"
  rails?: boolean
  grain?: boolean
  rule?: "none" | "top" | "bottom" | "both"
  id?: string
  className?: string
}) {
  const ink = tone === "ink"
  const padY = padding === "grand" ? "py-24 sm:py-32 lg:py-36" : padding === "tight" ? "py-14 sm:py-16" : "py-20 sm:py-24"
  const hair = ink ? "border-background/10" : "border-border"
  return (
    <section id={id} className={cn("relative isolate w-full overflow-hidden", ink && "bg-foreground", className)}>
      {grain && <Grain opacity={ink ? 0.07 : 0.04} />}
      {rails && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[var(--shell-w)] -translate-x-1/2 border-x lg:block", hair)}
        />
      )}
      {(rule === "top" || rule === "both") && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute left-1/2 top-0 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-t border-dashed", hair)}
        />
      )}
      {(rule === "bottom" || rule === "both") && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", hair)}
        />
      )}
      <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", padY)} style={{ ["--shell-w" as string]: `${width}px`, maxWidth: width }}>
        {children}
      </div>
    </section>
  )
}

// ── SectionHead — editorial header: ticked eyebrow, display title, offset sub ─
export function SectionHead({
  eyebrow,
  title,
  subtitle,
  align = "left",
  index,
  tone = "paper",
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  align?: "left" | "center"
  /** Watermark ordinal, e.g. "01" — huge outlined, absolute. */
  index?: string
  tone?: "paper" | "ink"
  className?: string
}) {
  const ink = tone === "ink"
  return (
    <header className={cn("relative", align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl", className)}>
      {index && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-10 right-0 select-none font-display text-[120px] font-black leading-none tracking-[-0.05em] [-webkit-text-stroke:1.5px_currentColor] [color:transparent] opacity-[0.07] sm:text-[160px]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {index}
        </span>
      )}
      {eyebrow && (
        <MonoLabel className={cn("mb-5", ink ? "text-background/55" : "text-muted-foreground", align === "center" && "justify-center")}>
          {eyebrow}
        </MonoLabel>
      )}
      <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", ink ? "text-background" : "text-foreground")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-[15px] font-medium leading-[1.7] sm:text-base", ink ? "text-background/65" : "text-muted-foreground", align === "left" && "max-w-xl")}>
          {subtitle}
        </p>
      )}
    </header>
  )
}

// ── Ordinal — numbered tick for lists/cards ("01 /") ─────────────────────────
export function Ordinal({ n, total, className }: { n: number; total?: number; className?: string }) {
  return (
    <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60", className)}>
      {String(n).padStart(2, "0")}
      {total ? <span className="opacity-50"> / {String(total).padStart(2, "0")}</span> : <span aria-hidden> /</span>}
    </span>
  )
}
