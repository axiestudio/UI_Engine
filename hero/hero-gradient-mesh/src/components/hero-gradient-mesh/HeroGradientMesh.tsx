import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Gradient-mesh hero — a live, drifting mesh of color behind the type.
// ═══ EMOTION     Fluid, modern, continuous.
// ═══ SIGNATURE   Several blurred color blobs that drift on a slow loop.

export type HeroGradientMeshProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  cta?: { label: string; href?: string; variant?: "default" | "outline" }
  reducedMotion?: boolean
  className?: string
}

export function HeroGradientMesh({
  eyebrow = "FLUID",
  title = "A mesh that never settles.",
  subtitle = "Color drifts slowly behind the statement — a gradient canvas, not a flat fill.",
  cta = { label: "See it live", href: "#" },
  reducedMotion = false,
  className,
}: HeroGradientMeshProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-background", className)}>
      <Mesh reduced={reducedMotion} />
      <div className="relative z-10 mx-auto max-w-3xl px-5 pb-28 pt-24 text-center sm:px-8 lg:pt-32">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="justify-center text-muted-foreground">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.96] tracking-[-0.035em] sm:text-7xl">{title}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-muted-foreground">{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}>
          <div className="mt-8">
            <Button size="lg" variant={cta.variant ?? "default"} onClick={() => { if (cta.href) window.location.href = cta.href }} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
              {cta.label}
            </Button>
          </div>
        </InView>
      </div>
    </section>
  )
}

function Mesh({ reduced }: { reduced: boolean }) {
  const blobs = [
    { cls: "left-[8%] top-[15%] h-[420px] w-[420px]", ac: "var(--primary)", dur: 20, dx: 80, dy: -40 },
    { cls: "right-[6%] top-[20%] h-[380px] w-[380px]", ac: "var(--accent)", dur: 26, dx: -90, dy: 40 },
    { cls: "left-[42%] bottom-[6%] h-[440px] w-[440px]", ac: "var(--primary)", dur: 24, dx: 60, dy: -60 },
    { cls: "right-[28%] bottom-[10%] h-[300px] w-[300px]", ac: "var(--accent)", dur: 30, dx: -40, dy: 60 },
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {blobs.map((b, i) => (
        <motion.span
          key={i}
          animate={reduced ? undefined : { x: [0, b.dx, 0], y: [0, b.dy, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: b.dur, repeat: Infinity, ease: "easeInOut", delay: i * 1.3 }}
          className={cn("absolute rounded-full blur-3xl", b.cls)}
          style={{ background: `radial-gradient(circle, hsl(${b.ac} / 0.34), transparent 68%)` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/60" />
    </div>
  )
}
