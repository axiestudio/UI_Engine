import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Hover swap — hovering a row swaps a full-width media backdrop.
// ═══ EMOTION     A fast, tactile index.
// ═══ SIGNATURE   A list; hovering a title reveals its image full-bleed behind.

export type HoverSwapRow = { id: string; title: string; body?: string; src?: string }

export type InteractiveHoverSwapProps = {
  eyebrow?: string
  rows: HoverSwapRow[]
  className?: string
}

export function InteractiveHoverSwap({ eyebrow = "INDEX", rows, className }: InteractiveHoverSwapProps) {
  const [active, setActive] = React.useState(0)
  const a = rows[active]
  return (
    <SectionShell width={1280} grain rule="bottom" className={className}>
      <div className="relative overflow-hidden rounded-2xl border">
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
              <button key={r.id} type="button"
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}
                className="group flex w-full items-center gap-4 border-t border-foreground/10 px-6 py-5 text-left">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <h3 className={cn("flex-1 font-display text-3xl font-black tracking-[-0.02em] transition-colors sm:text-5xl", i === active ? "text-foreground" : "text-muted-foreground")}>{r.title}</h3>
                <span className={cn("shrink-0 font-mono text-[11px] font-bold uppercase tracking-widest transition-opacity", i === active ? "opacity-100" : "opacity-0")}>{r.body ?? "View"}</span>
              </button>
            ))}
          </div>
          <div className="px-6 py-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{a.title} — {String(active + 1).padStart(2, "0")}</p>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
