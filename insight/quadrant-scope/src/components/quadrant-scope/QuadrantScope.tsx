import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


export type ScopeItem = { name: string; x: number; y: number }

export type QuadrantScopeProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  axes?: { x: [string, string]; y: [string, string] }
  items?: ScopeItem[]
  className?: string
}

const QUADRANTS = [
  { id: "q1", label: "Leaders", note: "High craft · High reach" },
  { id: "q2", label: "Craftists", note: "High craft · Narrow reach" },
  { id: "q3", label: "Niche", note: "Focused craft · Focused reach" },
  { id: "q4", label: "Bulldozers", note: "Broad reach · Lower craft" },
]

const DEFAULT_ITEMS: ScopeItem[] = [
  { name: "You", x: 72, y: 78 },
  { name: "Incumbent Co", x: 64, y: 62 },
  { name: "Studio B", x: 30, y: 70 },
  { name: "DIY tools", x: 22, y: 30 },
  { name: "Platform X", x: 76, y: 26 },
]

export function QuadrantScope({
  eyebrow = "POSITIONING · THE SCOPE",
  title = "Market positioning",
  subtitle = "Two axes: craft vs. reach. Hover a quadrant to isolate its players.",
  axes = { x: ["Craft", "Reach"], y: ["Low", "High"] },
  items = DEFAULT_ITEMS,
  className,
}: QuadrantScopeProps) {
  const [active, setActive] = React.useState<number | null>(null)
  const quadrantOf = (it: ScopeItem) => (it.x >= 50 && it.y >= 50 ? 0 : it.x < 50 && it.y >= 50 ? 1 : it.x < 50 && it.y < 50 ? 2 : 3)

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="max-w-xl">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
        <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
        <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_260px]">
        {/* map */}
        <div
          className="relative aspect-square w-full overflow-hidden rounded-xl border bg-card shadow-sm"
          onMouseLeave={() => setActive(null)}
          onBlur={() => setActive(null)}
        >
          {/* axes */}
          <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-border" />
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="absolute bottom-1 left-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{axes.x[0]}</span>
          <span className="absolute bottom-1 right-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{axes.x[1]} →</span>
          <span className="absolute left-1 top-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{axes.y[1]} ↑</span>
          <span className="absolute bottom-12 left-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">{axes.y[0]}</span>

          {/* quadrants */}
          {QUADRANTS.map((q, qi) => (
            <Button type='button' key={q.id} aria-label={`Quadrant ${q.label}: ${q.note}`} onMouseEnter={() => setActive(qi)} onFocus={() => setActive(qi)} onMouseLeave={() => setActive(null)} className={cn(
                "absolute grid h-1/2 w-1/2 place-items-start p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                qi === 0 && "right-0 top-0 rounded-tr-xl",
                qi === 1 && "left-0 top-0 rounded-tl-xl",
                qi === 2 && "bottom-0 left-0 rounded-bl-xl",
                qi === 3 && "bottom-0 right-0 rounded-br-xl",
                active === qi ? "bg-foreground/5" : "bg-transparent",
              )} variant="default">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] shadow-sm transition-colors",
                  active === qi ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground",
                )}
              >
                {q.label}
              </span>
            </Button>
          ))}

          {/* items */}
          {items.map((it) => {
            const qi = quadrantOf(it)
            const isActive = active === null || active === qi
            const isYou = it.name === "You"
            return (
              <motion.div
                key={it.name}
                animate={{ opacity: isActive ? 1 : 0.22, scale: active === qi ? 1.06 : 1 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ left: `${it.x}%`, top: `${100 - it.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span
                  className={cn(
                    "block size-3 rounded-full border-2 border-background shadow",
                    isYou ? "bg-foreground" : "bg-muted-foreground/50",
                    !isActive && "grayscale",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-md border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] shadow-sm",
                    isYou ? "border-foreground/20 text-foreground" : "border-border text-muted-foreground",
                  )}
                >
                  {it.name}
                </span>
                <span className="sr-only">{it.name} at {it.x}, {it.y}</span>
              </motion.div>
            )
          })}
        </div>

        {/* legend */}
        <div className="flex flex-col gap-3">
          {QUADRANTS.map((q, qi) => (
            <Button type='button' key={q.id} onMouseEnter={() => setActive(qi)} onFocus={() => setActive(qi)} onMouseLeave={() => setActive(null)} onBlur={() => setActive(null)} className={cn(
                "rounded-xl border p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === qi ? "border-foreground bg-foreground text-background" : "border-border bg-card hover:border-foreground/20",
              )} variant="default">
              <span className="font-display text-[13px] font-semibold uppercase tracking-[0.04em]">{q.label}</span>
              <span className={cn("mt-1 block font-mono text-[11px] font-medium", active === qi ? "text-background/70" : "text-muted-foreground")}>{q.note}</span>
              <span className={cn("mt-2 inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold tabular-nums", active === qi ? "bg-background/15 text-background" : "bg-muted text-muted-foreground")}>
                {items.filter((it) => quadrantOf(it) === qi).length} players
              </span>
            </Button>
          ))}
          <p className="px-1 font-mono text-[11px] font-medium leading-5 text-muted-foreground">Players are positioned 0–100 on each axis. “You” is pinned for reference.</p>
        </div>
      </div>
    
  </div>
</section>
  )
}
