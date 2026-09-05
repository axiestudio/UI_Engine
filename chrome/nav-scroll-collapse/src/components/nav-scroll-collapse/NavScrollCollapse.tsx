import * as React from "react"
import { useScroll, useMotionValueEvent } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ═══ JOB         Scroll collapse — a tall header that condenses into a slim bar on scroll.
// ═══ EMOTION     Get out of the way.
// ═══ SIGNATURE   The header shrinks, tightens spacing and dims once you scroll.

export type NavScrollCollapseProps = {
  brand?: string
  links?: { id: string; label: string }[]
  className?: string
}

export function NavScrollCollapse({ brand = "STUDIO", links = [{ id: "a", label: "Work" }, { id: "b", label: "Studio" }, { id: "c", label: "Journal" }], className }: NavScrollCollapseProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => setCollapsed(y > 60))
  return (
    <div className={cn("relative isolate overflow-hidden min-h-[320px] w-full", className)}>
      <header className={cn("sticky top-0 z-40 border-b transition-all duration-300", collapsed ? "border-border bg-background/85 py-2 " : "border-transparent py-6")}>
        <div className="relative isolate overflow-hidden mx-auto flex max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <span className={cn("font-display font-black tracking-tight transition-all", collapsed ? "text-base" : "text-2xl")}>{brand}</span>
          <nav className="flex items-center gap-5">
            {links.map((l) => <a key={l.id} href="#" className={cn("font-mono font-bold uppercase tracking-widest transition-all", collapsed ? "text-[10px]" : "text-[11px]", "text-muted-foreground hover:text-foreground")}>{l.label}</a>)}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-16 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <h1 className="font-display text-4xl font-black">Scroll and the header folds.</h1>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">The wordmark shrinks, the bar slims, and the whole thing gains a blur backdrop.</p>
        </InView>
        {[
          "Keep scrolling \u2014 the header above condenses as you descend.",
          "The wordmark shrinks first, then the bar slims around it.",
          "Links tighten their spacing to fit the smaller frame.",
          "A blur backdrop fades in so content slides quietly underneath.",
          "Scroll back up and everything restores to full height.",
          "Small on the way down, generous at the top. That's the rule.",
        ].map((line, i) => <p key={i} className="text-sm font-medium leading-relaxed text-muted-foreground">{line}</p>)}
      </div>
    </div>
  )
}
