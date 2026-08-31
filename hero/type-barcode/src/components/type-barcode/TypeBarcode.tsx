import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Barcode type — a headline rendered like a scanned barcode.
// ═══ EMOTION     Industrial, machined.
// ═══ SIGNATURE   Vertical bars of variable width that resolve into a title, plus a code line.

export type TypeBarcodeProps = {
  eyebrow?: string
  word?: string
  code?: string
  className?: string
}

export function TypeBarcode({ eyebrow = "SCAN", word = "INDUSTRIAL", code = "0·4·1·2·9·9", className }: TypeBarcodeProps) {
  const bars = React.useMemo(() => Array.from({ length: 42 }).map(() => 1 + Math.floor(Math.random() * 5)), [])
  return (
    <section className={cn("relative isolate overflow-hidden py-24 sm:py-32", className)}>
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="mt-8 flex h-24 items-stretch gap-[3px] sm:h-32">
            {bars.map((w, i) => (
              <motion.span key={i} className="h-full bg-foreground"
                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                transition={{ duration: 0.5, delay: i * 0.012, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: w * 3, transformOrigin: "bottom" }} />
            ))}
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}>
          <h1 className="mt-6 font-display text-5xl font-black uppercase tracking-[-0.03em] sm:text-7xl">{word}</h1>
          <p className="mt-4 font-mono text-sm font-bold tracking-[0.4em] text-muted-foreground">{code}</p>
        </InView>
      </div>
    </section>
  )
}
