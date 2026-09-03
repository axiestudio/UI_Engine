import * as React from "react"
import { motion } from "motion/react"
import { Star, TrendingUp } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Hero with floating proof cards over the statement.
// ═══ EMOTION     Credible as well as confident.
// ═══ SIGNATURE   Two floating stat/review cards that drift beside the headline.

export type FloatingCard = { id: string; kind: "stat" | "review"; title: string; value?: string; body?: string }

export type HeroFloatingCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  cards?: FloatingCard[]
  reducedMotion?: boolean
  className?: string
}

export function HeroFloatingCards({
  eyebrow = "PROOF",
  title = "Trusted by real teams.",
  subtitle = "Floating proof cards drift beside the fold — social proof that feels alive.",
  actions = [{ label: "See what's possible", href: "#" }],
  cards = [
    { id: "a", kind: "stat", title: "4.9/5", value: "average rating" },
    { id: "b", kind: "review", title: "“Hands-down the fastest way we've shipped a site.”", body: "Studio North" },
  ],
  reducedMotion = false,
  className,
}: HeroFloatingCardsProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-background", className)}>
      <Grain opacity={0.04} />
      <div className="mx-auto max-w-[1280px] px-5 pb-24 pt-16 sm:px-8 lg:pt-24">
        <div className="relative z-10 max-w-2xl">
          <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
            <h1 className="mt-5 font-display text-[42px] font-black leading-[0.96] tracking-[-0.035em] sm:text-6xl lg:text-7xl">{title}</h1>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
            <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>
          </InView>
          <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {actions.map((a) => (
                <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </InView>
        </div>

        {/* floating cards */}
        <div className="relative mt-10 h-[280px] sm:ml-auto sm:mt-0 sm:h-[420px] sm:w-[46%] lg:h-[460px]">
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              animate={reducedMotion ? undefined : { y: [0, -12, 0], rotate: [i % 2 ? 0 : 0, i % 2 ? 0.4 : -0.4, 0] }}
              transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
              className={cn(
                "absolute rounded-2xl border bg-card p-5 shadow-xl",
                i === 0 ? "left-[4%] top-[12%] rotate-[-2deg]" : "right-[4%] bottom-[8%] rotate-[2deg]",
              )}
            >
              {card.kind === "stat" ? (
                <div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <p className="mt-2 font-display text-3xl font-black">{card.title}</p>
                  <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.value}</p>
                </div>
              ) : (
                <div className="max-w-[220px]">
                  <div className="flex gap-0.5 text-primary">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}</div>
                  <p className="mt-2 text-sm font-medium leading-relaxed">{card.title}</p>
                  <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{card.body}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
