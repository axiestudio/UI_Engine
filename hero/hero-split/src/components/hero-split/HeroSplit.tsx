import * as React from "react"
import { motion } from "motion/react"
import { ArrowRight, Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Split hero — content column beside a framed image.
// ═══ EMOTION     Editorial, confident.
// ═══ SIGNATURE   A 2-column hero with a rotated framed image and a mono eyebrow.

export type HeroSplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void; variant?: "default" | "outline" }[]
  points?: string[]
  image?: { src: string; alt?: string; caption?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function HeroSplit({
  eyebrow = "EST. 2026",
  title = "Built for the places that matter.",
  subtitle = "A token-first collection of sections for studios, agencies and brands — designed to look intentional, not assembled.",
  actions = [{ label: "Start a project", href: "#" }, { label: "See the work", variant: "outline", href: "#" }],
  points = ["Ship sections as tokens", "Accessible by default", "One signature move each"],
  image = { src: "/showcase/gallery-02.webp", alt: "Modern editorial workspace", caption: "ATELIER · DAYLIGHT" },
  tone = "paper",
  className,
}: HeroSplitProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
            <h1 className="mt-5 font-display text-[42px] font-black leading-[0.96] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className={cn("mt-6 max-w-xl text-base font-medium leading-relaxed sm:text-lg", ink ? "text-background/70" : "text-muted-foreground")}>
              {subtitle}
            </p>
            {points && (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {points.map((p) => (
                  <li key={p} className={cn("flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/60" : "text-muted-foreground")}>
                    <Check className="h-3.5 w-3.5 text-primary" /> {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {actions.map((a) => (
                <Button key={a.label} size="lg" variant={a.variant ?? "default"} onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </div>
        </InView>

        <InView once variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <figure className="relative">
            <div className="relative -rotate-[1.5deg] overflow-hidden rounded-[24px] border shadow-2xl">
              <img src={image.src} alt={image.alt} className="aspect-[4/5] w-full object-cover" />
              <span className="pointer-events-none absolute left-3 top-3 block size-3 border-l-2 border-t-2 border-background/80" />
              <span className="pointer-events-none absolute bottom-3 right-3 block size-3 border-b-2 border-r-2 border-background/80" />
            </div>
            {image.caption && <figcaption className="mt-3 text-right font-mono text-[10px] font-bold tracking-[0.3em] text-muted-foreground">{image.caption}</figcaption>}
          </figure>
        </InView>
      </div>
    </section>
  )
}
