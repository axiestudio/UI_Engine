/**
 * Handcraft kit — refined professional primitives.
 * Keeps the crafted DNA but tightens spacing, typography, and surfaces
 * for a clean, enterprise-grade feel. All props remain compatible.
 */
'use client';
import * as React from "react"
import { cn } from "@/lib/utils"

// ── Grain — subtle paper texture (kept but much lighter) ─────────────────
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")"

export function Grain({ opacity = 0.02, className }: { opacity?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-[1] mix-blend-overlay", className)}
      style={{ backgroundImage: GRAIN_URI, opacity }}
    />
  )
}

// ── Dots — faint grid ────────────────────────────────────────────────────
export function Dots({ size = 26, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,var(--dot,currentColor)_1px,transparent_0)]", className)}
      style={{ backgroundSize: `${size}px ${size}px`, ["--dot" as string]: "currentColor" }}
    />
  )
}

// ── CornerTicks — minimal ────────────────────────────────────────────────
export function CornerTicks({
  size = 10,
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
    <span aria-hidden className={cn("pointer-events-none absolute inset-0 opacity-40", className)}>
      {corners.map((c) => (
        <span key={c} className={cn("absolute border-current", pos[c])} style={{ width: size, height: size }} />
      ))}
    </span>
  )
}

// ── Sheen ────────────────────────────────────────────────────────────────
export function Sheen({ dark = false, className }: { dark?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -translate-x-[110%] transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%]",
        dark
          ? "bg-[linear-gradient(105deg,transparent_42%,hsl(var(--foreground)/0.04)_50%,transparent_58%)]"
          : "bg-[linear-gradient(105deg,transparent_42%,hsl(var(--background)/0.14)_50%,transparent_58%)]",
        className,
      )}
    />
  )
}

// ── Accent ───────────────────────────────────────────────────────────────
export function Accent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <em className={cn("font-semibold tracking-tight text-primary", className)}>{children}</em>
  )
}

// ── MonoLabel — professional small caps ─────────────────────────────────
export function MonoLabel({ children, className, tick = true }: { children: React.ReactNode; className?: string; tick?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground", className)}>
      {tick && <span aria-hidden className="inline-block size-1.5 rounded-full bg-primary/60" />}
      {children}
    </span>
  )
}

// ── SectionShell ─────────────────────────────────────────────────────────
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
  const padY = padding === "grand" ? "py-16 sm:py-20" : padding === "tight" ? "py-8 sm:py-10" : "py-10 sm:py-12 lg:py-14"
  const hair = ink ? "border-background/10" : "border-border/60"
  return (
    <section id={id} className={cn("relative isolate w-full overflow-hidden bg-background", ink && "bg-foreground", className)}>
      {grain && <Grain opacity={ink ? 0.03 : 0.015} />}
      {rails && (
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-y-0 left-1/2 hidden w-full max-w-[var(--shell-w)] -translate-x-1/2 border-x lg:block", hair)}
        />
      )}
      {(rule === "top" || rule === "both") && (
        <span aria-hidden className={cn("pointer-events-none absolute left-1/2 top-0 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-t", hair)} />
      )}
      {(rule === "bottom" || rule === "both") && (
        <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b", hair)} />
      )}
      <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", padY)} style={{ ["--shell-w" as string]: `${width}px`, maxWidth: width }}>
        {children}
      </div>
    </section>
  )
}

// ── SectionHead — clean professional header ──────────────────────────────
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
            "pointer-events-none absolute -top-6 right-0 select-none font-mono text-6xl font-bold tabular-nums opacity-[0.04] sm:text-7xl",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {index}
        </span>
      )}
      {eyebrow && (
        <MonoLabel className={cn("mb-3", ink ? "text-background/60" : "text-muted-foreground", align === "center" && "justify-center")}>
          {eyebrow}
        </MonoLabel>
      )}
      <h2 className={cn("text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-[30px]", ink ? "text-background" : "text-foreground")}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-2.5 text-sm leading-6", ink ? "text-background/60" : "text-muted-foreground", align === "left" && "max-w-xl")}>
          {subtitle}
        </p>
      )}
    </header>
  )
}

// ── Ordinal ──────────────────────────────────────────────────────────────
export function Ordinal({ n, total, className }: { n: number; total?: number; className?: string }) {
  return (
    <span className={cn("font-mono text-[11px] font-semibold tabular-nums tracking-wide text-muted-foreground", className)}>
      {String(n).padStart(2, "0")}
      {total ? <span className="opacity-40"> / {String(total).padStart(2, "0")}</span> : <span aria-hidden className="opacity-40"> /</span>}
    </span>
  )
}
