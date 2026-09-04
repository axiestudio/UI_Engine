import * as React from "react"
import { ArrowRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Footer CTA — a single bold closing call to action.
// ═══ EMOTION     End on a lift.
// ═══ SIGNATURE   A final full-width CTA band with one headline + CTA.

export type FooterCtaProps = {
  eyebrow?: string
  title?: React.ReactNode
  sub?: React.ReactNode
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FooterCta({ eyebrow = "ONE MORE THING", title = "Let's build yours.", sub = "Start with a section. Ship the whole site.", cta = "Get in touch", tone = "paper", className }: FooterCtaProps) {
  const ink = tone === "ink"
  return (
    <footer className={cn("relative isolate w-full overflow-hidden", ink && "bg-foreground text-background", className)}>
      <div className={cn("mx-auto max-w-[1280px] px-5 py-20 text-center sm:px-8")}>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-black tracking-[-0.03em] sm:text-6xl">{title}</h2>
          {sub && <p className={cn("mx-auto mt-4 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{sub}</p>}
          <div className="mt-8">
            <Button size="lg" className="h-12 rounded-full px-8 font-mono text-[11px] font-bold uppercase tracking-widest">
              {cta} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </InView>
      </div>
    </footer>
  )
}
