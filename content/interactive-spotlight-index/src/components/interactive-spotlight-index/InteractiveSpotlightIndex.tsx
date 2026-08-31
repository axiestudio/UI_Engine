import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
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
              <button key={e.id} type="button" onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                className={cn("rounded-full border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", i === active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent")}>
                {e.label}
              </button>
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
    </SectionShell>
  )
}
