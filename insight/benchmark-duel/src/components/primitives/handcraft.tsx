/**
 * Handcraft kit — professional refinement.
 * Keeps the crafted DNA (rails, ticks, grain) but tuned for enterprise
 * dashboards: tighter rhythm, restrained texture, token-first colors.
 */
'use client';
import * as React from "react"
import { cn } from "@/lib/utils"

// ── Grain — subtle paper fiber, far less noisy than before ─────────────────
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Grain({ opacity = 0.03, className }: { opacity?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light", className)}
      style={{ backgroundImage: GRAIN_URI, opacity }}
    />
  )
}

// ── Dots — very faint field for ink bands only ──────────────────────────────
export function Dots({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,var(--dot,currentColor)_1px,transparent_0)]", className)}
      style={{ backgroundSize: `${size}px ${size}px`, ["--dot" as string]: "currentColor" }}
    />
  )
}

// ── CornerTicks — refined viewfinder marks ─────────────────────────────────
export function CornerTicks({
  size = 10,
  offset = 12,
  className,
  corners = ["tl", "tr", "bl", "br"],
}: {
  size?: number
  offset?: number
  className?: string
  corners?: ("tl" | "tr" | "bl" | "br")[]
}) {
  const pos: Record<string, React.CSSProperties> = {
    tl: { top: offset, left: offset, borderTopWidth: 1, borderLeftWidth: 1 },
    tr: { top: offset, right: offset, borderTopWidth: 1, borderRightWidth: 1 },
    bl: { bottom: offset, left: offset, borderBottomWidth: 1, borderLeftWidth: 1 },
    br: { bottom: offset, right: offset, borderBottomWidth: 1, borderRightWidth: 1 },
  }
  return (
    <span aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {corners.map((c) => (
        <span key={c} className="absolute border-current" style={{ width: size, height: size, ...pos[c] }} />
      ))}
    </span>
  )
}

// ── Sheen — restrained hover sweep (token-based, kept for crafted presets) ────
export function Sheen({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -translate-x-[110%] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%]",
        dark
          ? "bg-[linear-gradient(105deg,transparent_42%,hsl(var(--foreground)/0.05)_50%,transparent_58%)]"
          : "bg-[linear-gradient(105deg,transparent_42%,hsl(var(--background)/0.12)_50%,transparent_58%)]",
        className,
      )}
    />
  )
}

// ── Accent — editorial italic, now token-aware ─────────────────────────────
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <em className={cn("font-serif italic font-medium tracking-normal", className)} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      {children}
    </em>
  )
}

// ── MonoLabel — professional small-caps label ──────────────────────────────
export function MonoLabel({ children, className, tick = true }: { children: React.ReactNode; className?: string; tick?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]", className)}>
      {tick && <span aria-hidden className="inline-block size-[4px] rotate-45 bg-current opacity-70" />}
      {children}
    </span>
  )
}

// ── SectionShell — refined container with tighter rhythm ───────────────────
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
  const padY = padding === "grand" ? "py-16 sm:py-20 lg:py-24" : padding === "tight" ? "py-10 sm:py-12" : "py-14 sm:py-16 lg:py-20"
  const hair = ink ? "border-background/10" : "border-border/60"
  return (
    <section id={id} className={cn("relative isolate w-full overflow-hidden", ink && "bg-foreground", className)}>
      {grain && <Grain opacity={ink ? 0.04 : 0.025} />}
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

// ── SectionHead — editorial header, weight corrected ───────────────────────
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
            "pointer-events-none absolute -top-10 right-0 select-none font-display text-[96px] font-bold leading-none tracking-[-0.05em] [-webkit-text-stroke:1px_currentColor] [color:transparent] opacity-[0.05] sm:text-[120px]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {index}
        </span>
      )}
      {eyebrow && (
        <MonoLabel className={cn("mb-4", ink ? "text-background/55" : "text-muted-foreground", align === "center" && "justify-center")}>
          {eyebrow}
        </MonoLabel>
      )}
      <h2 className={cn("font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] sm:text-[34px] lg:text-[40px]", ink ? "text-background" : "text-foreground")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-3 text-[14px] font-normal leading-[1.65] sm:text-[15px]", ink ? "text-background/65" : "text-muted-foreground", align === "left" && "max-w-xl")}>
          {subtitle}
        </p>
      )}
    </header>
  )
}

// ── Ordinal — refined number ───────────────────────────────────────────────
export function Ordinal({ n, total, className }: { n: number; total?: number; className?: string }) {
  return (
    <span className={cn("font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground", className)}>
      {String(n).padStart(2, "0")}
      {total ? <span className="opacity-50"> / {String(total).padStart(2, "0")}</span> : <span aria-hidden className="opacity-40"> /</span>}
    </span>
  )
}
