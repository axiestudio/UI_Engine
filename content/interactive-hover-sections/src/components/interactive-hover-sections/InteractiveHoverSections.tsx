import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Hover-sections — hovering a title swaps the media on the right.
// ═══ EMOTION     A nimble index.
// ═══ SIGNATURE   A list of section titles; the hovered one drives a crossfading image.

export type HoverSectionRow = { id: string; title: string; body?: string; src?: string; stat?: string }

export type InteractiveHoverSectionsProps = {
  eyebrow?: string
  rows: HoverSectionRow[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ROWS = [
  { id: "h1", title: "Full-scale drawings", body: "Taped out on the floor before the first cut.", src: "/showcase/content/content-04-architecture.webp", stat: "1:1" },
  { id: "h2", title: "One maker per piece", body: "The same hands from lumber to sign-off.", src: "/showcase/content/content-02-team.webp", stat: "1:1" },
  { id: "h3", title: "Ten-year promise", body: "Joints, finishes, hardware — all of it.", src: "/showcase/gallery-04.webp", stat: "10 yr" },
]
export function InteractiveHoverSections({ eyebrow = "INDEX", rows = DEFAULT_ROWS, tone = "paper", className }: InteractiveHoverSectionsProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState(0)
  const a = rows[active]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <div className={cn("flex flex-col gap-8", ink ? "text-background" : "")}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div className="space-y-2">
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
            {rows.map((r, i) => (
              <Button type='button' key={r.id} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className={cn("block h-auto w-full border-b py-4 text-left transition-all", i === active ? "opacity-100" : ink ? "opacity-40" : "opacity-50")} variant="ghost">
                <span className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-2xl font-bold sm:text-3xl">{r.title}</span>
                </span>
                {i === active && r.body && <span className={cn("mt-2 block pl-7 text-sm font-medium", ink ? "text-background/70" : "text-muted-foreground")}>{r.body}</span>}
              </Button>
            ))}
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-xl border bg-muted">
            {rows.map((r, i) => (
              <motion.img
                key={r.id}
                src={r.src}
                alt={r.title}
                className="absolute inset-0 h-full w-full object-cover"
                initial={false}
                animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.06 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
            {a?.stat && <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/60 px-3 py-1 font-mono text-[11px] font-bold text-white">{a.stat}</span>}
          </div>
        </div>
      </div>
    
  </div>
</section>
  )
}
