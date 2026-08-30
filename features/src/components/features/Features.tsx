import * as React from "react"
import { Check } from "lucide-react"
import { Spotlight } from "@/components/primitives/spotlight"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type FeatureItem = {
  id?: string
  icon?: React.ElementType
  title: string
  description?: string
  /** Short benefit lines with check glyphs. */
  bullets?: string[]
  /** Corner chip, e.g. "Most booked". */
  badge?: string
  action?: { label: string; href?: string; onClick?: () => void }
}

export type FeaturesProps = {
  eyebrow?: string
  /** When provided, the grid renders as a section with a heading. */
  title?: string
  subtitle?: string
  items: FeatureItem[]
  /** Grid columns on lg. Default 3 (clamped to item count). */
  columns?: 2 | 3 | 4
  /** Cursor-following spotlight glow on cards. Default true. */
  spotlight?: boolean
  /** Inverts the section into a dark band; every token follows automatically. Default false. */
  tone?: "paper" | "ink"
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function FeatureCard({ f, glow }: { f: FeatureItem; glow: boolean }) {
  const Icon = f.icon
  const card = (
    <div
      id={f.id}
      className={cn(
        "group relative flex h-full scroll-mt-24 flex-col overflow-hidden rounded-[24px] p-6 transition-shadow",
        glow ? "border border-border/70" : "border border-transparent"
      )}
    >
      {f.badge && (
        <span className="absolute right-4 top-4 rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {f.badge}
        </span>
      )}
      {Icon && (
        <span className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background shadow-xs">
          <Icon className="h-5 w-5 stroke-[2]" />
        </span>
      )}
      <h3 className="mt-5 font-display text-lg font-extrabold leading-snug tracking-tight">{f.title}</h3>
      {f.description && <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{f.description}</p>}
      {f.bullets && f.bullets.length > 0 && (
        <ul className="mt-4 flex flex-col gap-1.5">
          {f.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm font-medium">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {f.action && (
        <a
          href={f.action.href ?? "#"}
          onClick={f.action.onClick}
          className="mt-auto inline-flex w-fit items-center pt-5 text-sm font-bold underline-offset-4 hover:underline"
        >
          {f.action.label}
          <span aria-hidden className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      )}
    </div>
  )

  if (!glow) return card
  return (
    <div className="relative h-full overflow-hidden rounded-[24px] border border-border/70 bg-card transition-shadow hover:shadow-md">
      <Spotlight size={420} springOptions={{ stiffness: 200, damping: 20 }} />
      {card}
    </div>
  )
}

// ── Features ─────────────────────────────────────────────────────────────────

export function Features({ eyebrow, title, subtitle, items, columns = 3, spotlight = true, tone = "paper", className }: FeaturesProps) {
  if (!items.length) return null
  const cols = Math.min(columns, Math.max(1, items.length))
  const ink = tone === "ink"

  return (
    <section className={cn("w-full text-foreground", ink ? "bg-foreground text-background" : "bg-background", className)} aria-label={title ?? "Features"}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {(title || eyebrow) && (
          <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
            <header className="mb-10 max-w-2xl">
              {eyebrow && <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</p>}
              {title && <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
              {subtitle && <p className={cn("mt-3 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>}
            </header>
          </InView>
        )}

        <div className={cn("grid gap-3 sm:grid-cols-2", cols === 3 && "lg:grid-cols-3", cols === 4 && "lg:grid-cols-2 xl:grid-cols-4", cols === 2 && "lg:grid-cols-2")}>
          {items.map((f, i) => (
            <InView
              key={f.id ?? f.title}
              as="div"
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-40px" }}
            >
              <FeatureCard f={f} glow={spotlight} />
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
