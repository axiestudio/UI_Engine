import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Hero with an animated background — drifting gradient orbs.
// ═══ EMOTION     Alive, ambient.
// ═══ SIGNATURE   Two (or three) blurred light orbs that drift on a slow loop.

export type HeroAnimatedBgProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void; variant?: "default" | "outline" }[]
  reducedMotion?: boolean
  className?: string
}

export function HeroAnimatedBg({
  eyebrow = "MOTION",
  title = "A hero that breathes.",
  subtitle = "The background drifts slowly behind the copy — ambient, never busy.",
  actions = [{ label: "Get started", href: "#" }, { label: "Explore", variant: "outline", href: "#" }],
  reducedMotion = false,
  className,
}: HeroAnimatedBgProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-background", className)}>
      <AnimatedOrbs reduced={reducedMotion} />
      <Grain opacity={0.04} />
      <div className="relative z-10 mx-auto max-w-3xl px-5 pb-28 pt-24 text-center sm:px-8 lg:pt-32">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.95] tracking-[-0.035em] sm:text-7xl">{title}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {actions.map((a) => (
              <Button key={a.label} size="lg" variant={a.variant ?? "default"} onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
              </Button>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}

function AnimatedOrbs({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      <motion.span
        animate={reduced ? undefined : { x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--site-accent)/0.35), transparent 70%)" }}
      />
      <motion.span
        animate={reduced ? undefined : { x: [0, -70, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[6%] bottom-[8%] h-80 w-80 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--site-accent-2)/0.32), transparent 70%)" }}
      />
      <motion.span
        animate={reduced ? undefined : { x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[45%] top-[55%] h-64 w-64 rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--site-accent)/0.2), transparent 70%)" }}
      />
    </div>
  )
}
