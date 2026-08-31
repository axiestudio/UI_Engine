import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Imagery hero — a full-bleed imagery strip leads the page.
// ═══ EMOTION     Immersive, show-first.
// ═══ SIGNATURE   A tiling image band behind a rimmed caption strip.

export type HeroImageryProps = {
  eyebrow?: string
  title?: React.ReactNode
  actions?: { label: string; href?: string; onClick?: () => void }[]
  images?: { src?: string; alt?: string }[]
  caption?: string
  className?: string
}

export function HeroImagery({
  eyebrow = "STILLS",
  title = "Show it, then say it.",
  actions = [{ label: "See the full series", href: "#" }],
  images = [
    { src: "/showcase/gallery-01.webp", alt: "Object study — matte ceramic and metal" },
    { src: "/showcase/gallery-03.webp", alt: "Abstract architectural detail" },
    { src: "/showcase/gallery-05.webp", alt: "Precision design tools flat lay" },
  ],
  caption = "SELECTED STILLS — 01 / 03",
  className,
}: HeroImageryProps) {
  return (
    <section className={cn("relative isolate overflow-hidden bg-foreground text-background", className)}>
      <Grain opacity={0.07} />
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-20">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="flex items-end justify-between">
            <div>
              <MonoLabel className="text-background/60">{eyebrow}</MonoLabel>
              <h1 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] sm:text-5xl">{title}</h1>
            </div>
            <div className="hidden sm:block">
              {actions.map((a) => (
                <Button key={a.label} onClick={a.onClick} asChild={!a.onClick && !!a.href} className="h-11 rounded-full bg-background px-6 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">
                  {a.onClick || !a.href ? a.label : <a href={a.href}>{a.label}</a>}
                </Button>
              ))}
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
            {images.map((img, i) => (
              <div key={i} className="img-hover-wash aspect-[3/4] overflow-hidden rounded-xl border border-background/10">
                {img.src ? <img src={img.src} alt={img.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-background/20 to-transparent" />}
              </div>
            ))}
          </div>
        </InView>
        {caption && (
          <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
            <p className="mt-3 text-right font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-background/50">{caption}</p>
          </InView>
        )}
      </div>
    </section>
  )
}
