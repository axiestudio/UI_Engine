import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Hover swap — hovering a row swaps a full-width media backdrop.
// ═══ EMOTION     A fast, tactile index.
// ═══ SIGNATURE   A list; hovering a title reveals its image full-bleed behind.

export type HoverSwapRow = { id: string; title: string; body?: string; src?: string }

export type InteractiveHoverSwapProps = {
  eyebrow?: string
  rows: HoverSwapRow[]
  className?: string
}

const DEFAULT_ROWS = [
  { id: "s1", title: "Morning bench", body: "Tools laid out the night before.", src: "/showcase/content/content-05-workshop.webp" },
  { id: "s2", title: "The glue-up", body: "Clamps, cauls, and a steady clock.", src: "/showcase/gallery-03.webp" },
  { id: "s3", title: "Sign-off", body: "Initials pencilled inside the back panel.", src: "/showcase/gallery-05.webp" },
]
export function InteractiveHoverSwap({ eyebrow = "INDEX", rows = DEFAULT_ROWS, className }: InteractiveHoverSwapProps) {
  const [active, setActive] = React.useState(0)
  const a = rows[active]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <div className="relative overflow-hidden rounded-xl border">
        {/* backdrop swaps */}
        {rows.map((r, i) => (
          <motion.img key={r.id} src={r.src} alt=""
            className="absolute inset-0 h-full w-full object-cover"
            initial={false} animate={{ opacity: i === active ? 0.24 : 0, scale: i === active ? 1 : 1.06 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
        ))}
        <div className="relative z-10">
          <p className="px-6 pt-6 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
          <div className="mt-4">
            {rows.map((r, i) => (
              <Button type='button' key={r.id} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className="group flex w-full items-center gap-4 border-t border-foreground/10 px-6 py-5 text-left" variant="default">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={cn("flex-1 font-display text-3xl font-bold tracking-[-0.02em] transition-colors sm:text-5xl", i === active ? "text-foreground" : "text-muted-foreground")}>{r.title}</h3>
                <span className={cn("shrink-0 font-mono text-[11px] font-bold uppercase tracking-widest transition-opacity", i === active ? "opacity-100" : "opacity-0")}>{r.body ?? "View"}</span>
              </Button>
            ))}
          </div>
          <div className="px-6 py-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{a.title} — {String(active + 1).padStart(2, "0")}</p>
          </div>
        </div>
      </div>
    
  </div>
</section>
  )
}
