import * as React from "react"
import { motion } from "motion/react"
import { ArrowRight } from "lucide-react"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         3D tilt hero — a hero product card that tilts toward the cursor.
// ═══ EMOTION     Tangible, dimensional, playful.
// ═══ SIGNATURE   A hinged preview card (Tilt) beside a hedged headline.

export type HeroTiltCardProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  cta?: { label: string; href?: string }
  card?: { label: string; value: string; src?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function HeroTiltCard({
  eyebrow = "PHYSICAL",
  title = "A hero you can touch.",
  subtitle = "The product card tilts toward your cursor — a preview that feels like a physical object.",
  cta = { label: "Open the preview", href: "#" },
  card = { label: "SECTIONS", value: "100+" },
  tone = "paper",
  className,
}: HeroTiltCardProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-16 sm:py-24", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
          <h1 className="mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl">{title}</h1>
          <p className={cn("mt-5 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
          <div className="mt-7">
            <Button size="lg" onClick={() => { if (cta.href) window.location.href = cta.href }} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
              {cta.label} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </InView>

        <InView once variants={{ hidden: { opacity: 0, y: 24, rotateX: 8 }, visible: { opacity: 1, y: 0, rotateX: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <div className="grid [perspective:1200px]">
            <Tilt rotationFactor={8} className="will-change-transform">
              <div className={cn("relative overflow-hidden rounded-[28px] border p-8 shadow-2xl", ink ? "border-background/20 bg-background/5" : "border-border bg-card")} style={{ transformStyle: "preserve-3d" }}>
                <div className="flex items-center justify-between">
                  <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{card.label}</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">✦</span>
                </div>
                <p className="mt-8 font-display text-7xl font-black tracking-tight sm:text-8xl" style={{ transform: "translateZ(40px)" }}>{card.value}</p>
                <div className="mt-8 aspect-[16/10] overflow-hidden rounded-2xl bg-muted" style={{ transform: "translateZ(24px)" }}>
                  {card.src ? <img src={card.src} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </div>
                <div className="mt-6 flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span>drag-free</span><span>cursor-follow</span>
                </div>
              </div>
            </Tilt>
          </div>
        </InView>
      </div>
    </section>
  )
}
