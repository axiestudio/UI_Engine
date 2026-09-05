import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TransitionPanel } from "@/components/primitives/transition-panel"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Tabbed hero — swap the same canvas between a few statements.
// ═══ EMOTION     A hero that cycles.
// ═══ SIGNATURE   TransitionPanel statements + tab controls + a fixed canvas.

export type HeroTabsTab = { id: string; label: string; title: React.ReactNode; description?: React.ReactNode; action?: { label: string; href?: string } }

export type HeroTabsProps = {
  eyebrow?: string
  tabs: HeroTabsTab[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HERO_TABS_EYEBROW = "Four ways"
const DEMO_HERO_TABS: HeroTabsTab[] = [
  { id: "a", label: "Design", title: "Designed, not decorated.", description: "Every section is drawn by hand, not split from a template.", action: { label: "See the craft", href: "#" } },
  { id: "b", label: "Motion", title: "Motion with intent.", description: "One signature move per section \u2014 never noise.", action: { label: "See the motion", href: "#" } },
  { id: "c", label: "Tokens", title: "Tokens everywhere.", description: "Re-theme the whole library from one surface.", action: { label: "See the tokens", href: "#" } },
  { id: "d", label: "Access", title: "Accessible by default.", description: "Reduced-motion and screen-reader aware from day one.", action: { label: "See the a11y", href: "#" } },
]

export function HeroTabs({ eyebrow = DEMO_HERO_TABS_EYEBROW, tabs = DEMO_HERO_TABS, tone = "paper", className }: HeroTabsProps) {
  const ink = tone === "ink"
  const [active, setActive] = React.useState(0)
  const shown = tabs[Math.min(active, Math.max(tabs.length - 1, 0))]
  return (
    <section className={cn("relative isolate overflow-hidden", ink && "bg-foreground text-background", className)}>
      <Grain opacity={ink ? 0.07 : 0.04} />
      <div className="mx-auto max-w-3xl px-5 pb-20 pt-16 text-center sm:px-8 lg:pt-24">
        <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={cn(ink ? "text-background/55" : "text-muted-foreground", "justify-center")}>{eyebrow}</MonoLabel>
        </InView>

        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {tabs.map((t, i) => (
              <Button
                key={t.id}
                type="button"
                onClick={() => setActive(i)}
                variant={i === active ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-11 rounded-full font-mono text-[11px] font-bold uppercase tracking-widest",
                  i === active
                    ? "bg-foreground text-background"
                    : ink
                      ? "text-background/55 hover:bg-background/10"
                      : "text-muted-foreground hover:bg-accent",
                )}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </InView>

        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}>
          <div className="relative mt-8 min-h-[320px]">
            <TransitionPanel
              activeIndex={active}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
              variants={{
                enter: { opacity: 0, y: 24 },
                center: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -24 },
              }}
            >
              {tabs.map((t) => (
                <div key={t.id} className="flex flex-col items-center">
                  <h1 className="font-display text-4xl font-black leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">{t.title}</h1>
                  {t.description && <p className={cn("mt-5 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{t.description}</p>}
                  {t.action && (
                    <Button size="lg" onClick={() => { if (t.action?.href) window.location.href = t.action.href }} className="mt-7 h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
                      {t.action.label}
                    </Button>
                  )}
                </div>
              ))}
            </TransitionPanel>
          </div>
        </InView>
      </div>
    </section>
  )
}
