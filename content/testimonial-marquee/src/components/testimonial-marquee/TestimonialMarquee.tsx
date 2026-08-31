import * as React from "react"
import { Star } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
