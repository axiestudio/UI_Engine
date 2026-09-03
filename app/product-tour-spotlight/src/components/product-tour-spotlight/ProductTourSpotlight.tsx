import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useFloating,
  useMergeRefs,
  type Placement,
  type ReferenceElement,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — onboarding that points at the REAL UI, not screenshots.
// JOB      teach the app inside the app
// SIGNATURE a hole is cut in the dim layer around the live element (the spot
//           target is the Floating UI reference; the hole re-measures through
//           autoUpdate so it springs as it hops between steps); the coach card
//           rides above/below by flip, welded to the target with an arrow.
// POSITIONING Floating UI only: useFloating on a virtual element that resolves
//           the live target rect, strategy absolute, middleware
//           [offset → flip → shift(8) → arrow → (hide tracked)], all clamped to
//           the preset root as boundary, whileElementsMounted: autoUpdate. The
//           target is scrolled into view before anchoring. No fixed-px offsets.
// ISOLATION the dim layer and coach card live inside the preset root
//           (absolute inset-0 within a positioned host — the engine showcase
//           supplies `relative isolate overflow-hidden`); the card is portaled
//           into that root, not document.body, so nothing escapes the content
//           pane. hole coords are converted to root-local.
// API      steps [{selector, title, body, placement?}] — host owns `step` or
//          use built-in next/skip. Re-measures on resize/scroll.
// A11Y     coach card is a labelled dialog; arrows navigate; Esc exits;
//          reduced motion snaps the hole + skips the smooth scroll.

export type TourStep = { selector: string; title: string; body: React.ReactNode; placement?: Placement }
export type ProductTourSpotlightProps = { steps: TourStep[]; step?: number; onStep?: (i: number) => void; onExit?: () => void; className?: string }

type Rect = { x: number; y: number; w: number; h: number }

const PAD = 8

export function ProductTourSpotlight({ steps, step: stepProp, onStep, onExit, className }: ProductTourSpotlightProps) {
  const [inner, setInner] = React.useState(0)
  const step = stepProp ?? inner
  const arrowRef = React.useRef<SVGSVGElement>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)
  const [rootNode, setRootNode] = React.useState<HTMLDivElement | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const go = (n: number) => { if (stepProp === undefined) setInner(n); onStep?.(n) }

  const active = step < steps.length ? steps[step] : undefined

  // live element rect (viewport coords), or null when the selector misses
  const liveRect = () => (active ? document.querySelector(active.selector)?.getBoundingClientRect() ?? null : null)

  // the spotlight target resolved as a Floating UI virtual element — reads the
  // live DOM rect on every positioning pass (autoUpdate drives it); it keeps
  // viewport semantics, the library converts to the absolute strategy itself
  const reference = React.useMemo<ReferenceElement>(() => ({
    getBoundingClientRect: () => {
      const r = liveRect()
      if (!r) { const s = 0; return { x: s, y: s, width: 0, height: 0, top: s, left: s, bottom: s, right: s } }
      return { x: r.x - PAD, y: r.y - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2, top: r.top - PAD, left: r.left - PAD, bottom: r.bottom + PAD, right: r.right + PAD }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [active])

  const { refs, floatingStyles, context, placement, middlewareData } = useFloating({
    open: !!active,
    strategy: "absolute",
    // the `elements` option is typed for real nodes; the cast to Element is
    // floating-ui's documented escape hatch for virtual references
    elements: { reference: reference as unknown as Element | null, floating: rootNode },
    placement: active?.placement ?? "bottom",
    middleware: [
      offset(12),
      flip({ padding: 8, boundary: rootNode ?? "clippingAncestors" }),
      shift({ padding: 8, boundary: rootNode ?? "clippingAncestors" }),
      arrow({ element: arrowRef }),
      hide({ boundary: rootNode ?? "clippingAncestors" }),
    ],
    whileElementsMounted: autoUpdate,
  })

  // the hole is re-measured on every render — and converted into the root's own
  // coordinate space, because the dim svg is a child of the root (positioned
  // absolute over it), not of the viewport. autoUpdate re-renders on each
  // positioning pass (scroll/resize/target change), so the hole stays welded to
  // the exact rect the engine positioned against.
  const hidden = !!middlewareData.hide?.referenceHidden
  const holeRect: Rect | null = (() => {
    const r = liveRect()
    if (!r || !rootNode) return null
    const o = rootNode.getBoundingClientRect()
    return { x: r.x - o.left - PAD, y: r.y - o.top - PAD, w: r.width + PAD * 2, h: r.height + PAD * 2 }
  })()

  // bring the target into view (the content pane is the nearest scrollable
  // ancestor inside the engine), then let autoUpdate weld the card on
  React.useEffect(() => {
    if (!active) return
    const el = document.querySelector(active.selector)
    el?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" })
  }, [active, reduce])

  React.useEffect(() => { dialogRef.current?.focus({ preventScroll: true }) }, [step])

  const setFloatingRef = useMergeRefs([refs.setFloating, dialogRef])

  if (!active || !holeRect) return null
  return (
    <div ref={setRootNode} className={cn("absolute inset-0 z-[115] isolate overflow-hidden", className)} role="presentation">
      <svg className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <mask id="tour-hole">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              rx={10}
              initial={false}
              animate={{ x: holeRect.x, y: holeRect.y, width: holeRect.w, height: holeRect.h }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 26 }}
              fill="black"
            />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.62)" mask="url(#tour-hole)" />
        <motion.rect
          rx={10}
          fill="none"
          stroke="hsl(var(--app-focus))"
          strokeWidth={2}
          initial={false}
          animate={{ x: holeRect.x, y: holeRect.y, width: holeRect.w, height: holeRect.h }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 210, damping: 26 }}
        />
      </svg>
      <FloatingPortal element={rootNode}>
        <div
          ref={setFloatingRef}
          role="dialog"
          aria-modal="false"
          aria-label={`Tour step ${step + 1} of ${steps.length}`}
          tabIndex={-1}
          onKeyDown={(e) => { if (e.key === "Escape") onExit?.(); if (e.key === "ArrowRight") go(Math.min(steps.length - 1, step + 1)); if (e.key === "ArrowLeft") go(Math.max(0, step - 1)) }}
          style={floatingStyles}
          className={cn("w-[min(92%,420px)] outline-none transition-opacity", hidden && "opacity-70")}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: placement.includes("bottom") ? 8 : -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              className="relative rounded-xl border border-border/70 bg-popover p-5 shadow-xl"
            >
              <FloatingArrow ref={arrowRef} context={context} fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={1} width={14} height={7} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Step {step + 1} / {steps.length}</p>
                  <h4 className="mt-1.5 font-display text-base font-semibold tracking-tight">{active.title}</h4>
                </div>
                <Button type="button" variant="ghost" aria-label="Exit tour" onClick={onExit} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"><X className="size-4" /></Button>
              </div>
              <div className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{active.body}</div>
              <div className="mt-5 flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => (step === steps.length - 1 ? onExit?.() : go(step + 1))} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm">{step === steps.length - 1 ? "Finish" : "Next"}</Button>
                {step > 0 && <Button type="button" variant="ghost" onClick={() => go(step - 1)} className="h-9 rounded-md border border-border/70 bg-background px-3 text-sm font-medium hover:bg-muted">Back</Button>}
                <Button type="button" variant="ghost" onClick={onExit} className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground">Skip tour</Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </FloatingPortal>
    </div>
  )
}
