import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// The layer components — head band, quote, metrics, person, base.
import { ProofHead } from "./layers/ProofHead"
import { ProofQuote } from "./layers/ProofQuote"
import { ProofMetrics } from "./layers/ProofMetrics"
import { ProofPerson } from "./layers/ProofPerson"
import { ProofBase } from "./layers/ProofBase"

// ═══ JOB         Assemble one unignorable proof object.
// ═══ EMOTION     Conviction — the quote, the numbers and the human in one grip.
// ═══ SIGNATURE   The alternating stack: each layer slides in from its own
//                 side (head left, quote right, metrics left, person right)
//                 and the whole object settles like a deck being squared.

export type StackProofProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  brand?: string
  quote?: React.ReactNode
  metrics?: { value: string; label: string }[]
  person?: { name: string; role: string }
  source?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackProof({
  eyebrow = "STACK · PROOF",
  title = "Quote, numbers, human — one object.",
  subtitle = "Head band, quote, metric band, person and sign-off are separate components imported into one stack. Reorder them, drop one, or reuse them across the page — the layers hold together.",
  brand = "Northline Atelier",
  quote = "We replaced three tools and a paper diary with the engine. Onboarding took an afternoon, and the board has not lied to us once since.",
  metrics = [
    { value: "18%", label: "more chair-hours booked" },
    { value: "3 wk", label: "to full adoption" },
    { value: "0", label: "double-bookings since" },
  ],
  person = { name: "Elin Sandberg", role: "Founder · Northline" },
  source = "Verified engagement · Q2",
  caption = "FIVE LAYER COMPONENTS · ONE STACK",
  tone = "paper",
  className,
}: StackProofProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const slide = (dir: -1 | 1) => (reduce ? { opacity: 0 } : { opacity: 0, x: 34 * dir })
  const ease = [0.16, 1, 0.3, 1] as const

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease }}
      >
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease, delay: 0.1 }}
      >
        <figure className="mt-10">
          <div
            className={cn(
              "overflow-hidden rounded-[18px] border bg-card shadow-[0_24px_56px_-30px_hsl(var(--foreground)/0.45)]",
              ink ? "border-background/15" : "border-border",
            )}
          >
            <motion.div initial={slide(-1)} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.15 }}>
              <ProofHead brand={brand} />
            </motion.div>
            <motion.div initial={slide(1)} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.3 }}>
              <ProofQuote>{quote}</ProofQuote>
            </motion.div>
            <motion.div initial={slide(-1)} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.45 }}>
              <ProofMetrics items={metrics} />
            </motion.div>
            <motion.div initial={slide(1)} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.6 }}>
              <ProofPerson name={person.name} role={person.role} />
            </motion.div>
            <motion.div initial={slide(-1)} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease, delay: 0.75 }}>
              <ProofBase source={source} />
            </motion.div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mt-6 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    
  </div>
</section>
  )
}
