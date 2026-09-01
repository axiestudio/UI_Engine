import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Spotlight index — a list where the hovered entry lights a spotlight over an image.
// ═══ EMOTION     Focused, indexical.
// ═══ SIGNATURE   A list that reveals a highlighted slice of an image per hover.

export type SpotlightEntry = { id: string; label: string; body?: string; x?: number; y?: number }

export type InteractiveSpotlightIndexProps = {
  eyebrow?: string
  title?: React.ReactNode
  image?: string
  entries: SpotlightEntry[]
  className?: string
}

const DEFAULT_ENTRIES = [
  { id: "e1", label: "Oak", body: "Quarter-sawn, kilned slow." },
  { id: "e2", label: "Brass", body: "Left to darken with use." },
  { id: "e3", label: "Felt", body: "Wool, where wood meets wood." },
]
export function InteractiveSpotlightIndex({ eyebrow = "INDEX", title = "Point to a part.", image = "/showcase/content/content-01-office.webp", entries = DEFAULT_ENTRIES, className }: InteractiveSpotlightIndexProps) {
  const [active, setActive] = React.useState(0)
  const cur = entries[active]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative overflow-hidden rounded-xl border bg-foreground">
          <img src={image} alt="" className="aspect-[4/3] w-full object-cover opacity-80" />
          <AnimatePresence>
            {cur && (
              <motion.span
                key={cur.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${cur.x ?? 50}%`, top: `${cur.y ?? 50}%` }}
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="block h-40 w-40 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.7), transparent 65%)" }} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            {entries.map((e, i) => (
              <Button type='button' key={e.id} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} className={cn("rounded-full border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent")} variant="default">
                {e.label}
              </Button>
            ))}
          </div>
          <div className="mt-6 min-h-[80px]">
            <AnimatePresence mode="wait">
              {cur && <motion.div key={cur.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <h3 className="font-display text-xl font-bold">{cur.label}</h3>
                {cur.body && <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{cur.body}</p>}
              </motion.div>}
            </AnimatePresence>
          </div>
          <Button className="mt-6 rounded-full font-mono text-[11px] font-bold uppercase tracking-widest">Explore</Button>
        </div>
      </div>
    
  </div>
</section>
  )
}
