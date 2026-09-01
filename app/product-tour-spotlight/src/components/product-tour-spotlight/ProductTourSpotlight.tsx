import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — onboarding that points at the REAL UI, not screenshots.
// JOB      teach the app inside the app
// SIGNATURE a hole is cut in the dim layer around the live element (measured
//           rect, spring-eased as it hops between steps); the coach card rides
//           below/above depending on space.
// API      steps [{selector, title, body, placement?}] — host owns `step` or
//          use built-in next/skip. Re-measures on resize/scroll.
// A11Y     coach card is a labelled dialog; arrows navigate; Esc exits;
//          reduced motion snaps the hole instead of springing.

export type TourStep = { selector: string; title: string; body: React.ReactNode }
export type ProductTourSpotlightProps = { steps: TourStep[]; step?: number; onStep?: (i: number) => void; onExit?: () => void; className?: string }

type Rect = { x: number; y: number; w: number; h: number }

export function ProductTourSpotlight({ steps, step: stepProp, onStep, onExit, className }: ProductTourSpotlightProps) {
  const [inner, setInner] = React.useState(0)
  const step = stepProp ?? inner
  const [rect, setRect] = React.useState<Rect | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const go = (n: number) => { if (stepProp === undefined) setInner(n); onStep?.(n) }
  React.useEffect(() => {
    const measure = () => { const el = steps[step] && document.querySelector(steps[step].selector); if (!el) { setRect(null); return } const r = el.getBoundingClientRect(); setRect({ x: r.x - 8, y: r.y - 8, w: r.width + 16, h: r.height + 16 }) }
    measure()
    window.addEventListener("resize", measure); window.addEventListener("scroll", measure, true)
    return () => { window.removeEventListener("resize", measure); window.removeEventListener("scroll", measure, true) }
  }, [step, steps])
  if (step >= steps.length || !rect) return null
  const below = rect.y + rect.h + 240 < window.innerHeight
  return (
    <div className={cn("fixed inset-0 z-[115]", className)} role="dialog" aria-modal="true" aria-label={`Tour step ${step + 1} of ${steps.length}`} tabIndex={-1} onKeyDown={(e) => { if (e.key === "Escape") onExit?.(); if (e.key === "ArrowRight") go(Math.min(steps.length - 1, step + 1)); if (e.key === "ArrowLeft") go(Math.max(0, step - 1)) }}>
      <svg className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <mask id="tour-hole">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect rx={10} initial={false} animate={{ x: rect.x, y: rect.y, width: rect.w, height: rect.h }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 26 }} fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#tour-hole)" />
        <motion.rect rx={10} fill="none" stroke="hsl(var(--app-focus))" strokeWidth={2} initial={false} animate={{ x: rect.x, y: rect.y, width: rect.w, height: rect.h }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 26 }} />
      </svg>
      <div className="fixed left-1/2 w-[min(92vw,420px)] -translate-x-1/2" style={{ top: below ? Math.min(window.innerHeight - 220, rect.y + rect.h + 14) : undefined, bottom: below ? undefined : Math.max(16, window.innerHeight - (rect.y - 14) - 220) }}>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: below ? 8 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.25 }} className="rounded-xl border border-border/70 bg-popover p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Step {step + 1} / {steps.length}</p>
                <h4 className="mt-1.5 font-display text-base font-semibold tracking-tight">{steps[step].title}</h4>
              </div>
              <Button type="button" variant="ghost" aria-label="Exit tour" onClick={onExit} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"><X className="size-4" /></Button>
            </div>
            <div className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{steps[step].body}</div>
            <div className="mt-5 flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => (step === steps.length - 1 ? onExit?.() : go(step + 1))} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm">{step === steps.length - 1 ? "Finish" : "Next"}</Button>
              {step > 0 && <Button type="button" variant="ghost" onClick={() => go(step - 1)} className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm font-medium hover:bg-muted">Back</Button>}
              <Button type="button" variant="ghost" onClick={onExit} className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground">Skip tour</Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
