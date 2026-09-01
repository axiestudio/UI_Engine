import * as React from "react"
import { Star } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Testimonial marquee — scrolling rows of testimonial cards.
// ═══ EMOTION     Social proof in motion.
// ═══ SIGNATURE   Two opposing rows of testimonial cards in an auto-scroll marquee.

export type TestimonialMarqueeProps = {
  eyebrow?: string
  title?: React.ReactNode
  items?: { quote?: string; name?: string; role?: string; rating?: number }[]
  tone?: "paper" | "ink"
  className?: string
}

const scrollKeyframes = (dir: string) =>
  dir === "left"
    ? { animation: "marqueeL 40s linear infinite" }
    : { animation: "marqueeR 42s linear infinite" }

export function TestimonialMarquee({ eyebrow = "KIND WORDS", title = "What people say.", items = [
  { quote: "The motion is so restrained it feels expensive.", name: "Mia", role: "Founder", rating: 5 },
  { quote: "We shipped a site in two days.", name: "Jon", role: "Designer", rating: 5 },
  { quote: "Finally, sections that look designed.", name: "Priya", role: "Mktg", rating: 5 },
  { quote: "Tokens made our brand rollout painless.", name: "Leo", role: "Dev", rating: 5 },
], tone = "paper", className }: TestimonialMarqueeProps) {
  const ink = tone === "ink"
  const half = Math.ceil(items.length / 2)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1280), ["--shell-w" as string]: `${(1280)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <style>{`@keyframes marqueeL { from { transform: translateX(0) } to { transform: translateX(-50%) } } @keyframes marqueeR { from { transform: translateX(-50%) } to { transform: translateX(0) } }`}</style>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
        <div className="mt-10 space-y-4 overflow-hidden">
          {[items.slice(0, half), items.slice(half)].map((row, ri) => (
            <div key={ri} className="flex w-max gap-4 hover:[animation-play-state:paused]" style={scrollKeyframes(ri % 2 ? "right" : "left")}>
              {[...row, ...row].map((t, i) => (
                <div key={i} className={cn("w-[320px] shrink-0 rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
                  <div className="flex gap-0.5 text-amber-400">{Array.from({ length: t.rating ?? 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5 fill-current" />)}</div>
                  <p className={cn("mt-3 text-sm font-medium leading-relaxed", ink ? "text-background/80" : "text-foreground")}>{t.quote}</p>
                  <p className={cn("mt-4 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>{t.name} · {t.role}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </InView>
    
  </div>
</section>
  )
}
