import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Split-stack hero — two stacked halves that offset column-wise.
// ═══ EMOTION     Layered, architectural.
// ═══ SIGNATURE   A two-tier hero where the copy and media columns offset vertically.

export type HeroSplitStackProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  media?: { src?: string; alt?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function HeroSplitStack({
  eyebrow = "Stack",
  title = "Two halves, offset.",
  subtitle = "A split hero where the column heights stagger — the media half sits a beat lower than the copy.",
  actions = [{ label: "More", href: "#" }],
  media = { src: "/showcase/gallery-02.webp", alt: "Editorial workspace" },
  tone = "paper",
  className,
}: HeroSplitStackProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate overflow-hidden py-16 sm:py-20", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-0">
        <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className={cn("pr-0 lg:pr-16", ink ? "text-background" : "")}>
            <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
            <h1 className="mt-4 font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">{title}</h1>
            <p className={cn("mt-5 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {actions.map((a) => (
                <Button key={a.label} size="lg" onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
          <div className={cn("lg:mt-16", ink ? "text-background" : "")}>
            <div className="img-hover-wash aspect-[4/5] overflow-hidden rounded-[24px] border">
              {media.src ? <img src={media.src} alt={media.alt ?? ""} className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}
