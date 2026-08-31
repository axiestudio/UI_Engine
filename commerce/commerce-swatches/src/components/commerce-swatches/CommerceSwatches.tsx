import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Swatches — a colorway picker that retints a live preview.
// ═══ EMOTION     Choose the finish.
// ═══ SIGNATURE   Swatch buttons + a preview surface that animates to the chosen color.

export type SwatchOption = { id: string; label: string; color: string; price?: number }

export type CommerceSwatchesProps = {
  eyebrow?: string
  name?: string
  basePrice?: number
  swatches: SwatchOption[]
  className?: string
}

export function CommerceSwatches({ eyebrow = "FINISH", name = "The Lamp, No. 2", basePrice = 240, swatches, className }: CommerceSwatchesProps) {
  const [sel, setSel] = React.useState(0)
  const s = swatches[sel]
  const price = basePrice + (s?.price ?? 0)
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <div className="grid gap-10 sm:grid-cols-2 sm:items-center">
        <InView once variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div className="aspect-square rounded-xl border shadow-2xl" animate={{ backgroundColor: s?.color }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <div className="grid h-full place-items-center">
              <span className="font-display text-6xl font-semibold text-white/25">✦</span>
            </div>
          </motion.div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em]">{name}</h2>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums">€{price}</p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">Pick a finish — the preview retints live.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {swatches.map((sw, i) => (
                <button key={sw.id} type="button" onClick={() => setSel(i)} aria-label={sw.label}
                  className={cn("relative h-11 w-11 rounded-full border ring-offset-2 transition-all", sel === i ? "ring-2 ring-foreground" : "hover:scale-105")}
                  style={{ background: sw.color }} />
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{s?.label}{s?.price ? ` +€${s.price}` : ""}</p>
            <Button size="lg" className="mt-6 h-11 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Add to bag</Button>
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
