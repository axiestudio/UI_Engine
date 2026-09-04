import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { MessageSquarePlus, X } from "lucide-react"
import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — review screens need to be POINTED AT.
// JOB      attach comments to a place, not a timestamp
// SIGNATURE pins cluster with COLLISION FANNING (same-spot pins spread on an
//           arc, count on the front pin); clicking a pin fans the group open
//           and the comment card is welded to that pin with Floating UI;
//           long-press canvas adds a pin.
// POSITIONING the note card is a useFloating surface anchored to the active
//           pin button: [offset → flip → shift(8) → arrow → hide],
//           whileElementsMounted: autoUpdate, plus useDismiss/useRole('dialog').
//           The pins themselves live in a % canvas layer (left/top %) — that is
//           the drawing, not a floating panel; it stays CSS-positioned.
// API      pins [{id, x, y (0..1), author, text}], onAddPin, onRemove, onResolve.
// A11Y     pins are buttons with full-text labels; card closes on Escape;
//          layer is inert to scroll.

export type Pin = { id: string; x: number; y: number; author: string; text: string }
export type AnnotationPinLayerProps = { canvas: React.ReactNode; pins: Pin[]; onAddPin?: (p: { x: number; y: number }) => void; onRemove?: (id: string) => void; onResolve?: (id: string) => void; author?: string; className?: string }

export function AnnotationPinLayer({ canvas, pins, onAddPin, onRemove, onResolve, author = "you", className }: AnnotationPinLayerProps) {
  const [selId, setSelId] = React.useState<string | null>(null)
  const sel = pins.find((p) => p.id === selId) ?? null
  const host = React.useRef<HTMLDivElement>(null)
  const pinEls = React.useRef(new Map<string, HTMLElement>())
  const arrowRef = React.useRef<SVGSVGElement>(null)
  const [adding, setAdding] = React.useState(false)
  const lpTimer = React.useRef<number | undefined>(undefined)
  const lpStart = React.useRef<{ x: number; y: number } | null>(null)

  const atPercent = (x0: number, y0: number) => {
    const r = host.current!.getBoundingClientRect()
    return { x: (x0 - r.left) / r.width, y: (y0 - r.top) / r.height }
  }
  const cancelLongPress = () => { window.clearTimeout(lpTimer.current); lpTimer.current = undefined; lpStart.current = null }

  const { refs, floatingStyles, context } = useFloating({
    open: !!sel,
    onOpenChange: (v) => { if (!v) setSelId(null) },
    elements: { reference: sel ? (pinEls.current.get(sel.id) ?? null) : null },
    placement: "bottom",
    middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 }), arrow({ element: arrowRef }), hide()],
    whileElementsMounted: autoUpdate,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "dialog" })
  const { getFloatingProps } = useInteractions([dismiss, role])

  const groups: { key: string; items: Pin[] }[] = []
  for (const p of pins) {
    const k = `${Math.round(p.x * 20)}:${Math.round(p.y * 20)}`
    const g = groups.find((x) => x.key === k)
    g ? g.items.push(p) : groups.push({ key: k, items: [p] })
  }
  return (
    <div className={cn("relative isolate flex min-h-[420px] w-full flex-col overflow-hidden font-sans", className)}>
      <MotionConfig reducedMotion="user">
      <div className="pointer-events-none relative min-h-[320px] flex-1">
        <div className="opacity-100 [&_*]:pointer-events-auto">{canvas}      
          
    </div>
      </div>
      <div ref={host} className={cn("absolute inset-0", adding && "cursor-crosshair")} onKeyDown={(e) => { if (e.key === "Escape" && adding) setAdding(false) }} onClick={(e) => {
        if (!adding || !onAddPin) return
        onAddPin(atPercent(e.clientX, e.clientY))
        setAdding(false)
      }} onPointerDown={(e) => {
        if (!onAddPin || adding || e.target !== e.currentTarget || e.button !== 0) return
        cancelLongPress()
        lpStart.current = { x: e.clientX, y: e.clientY }
        lpTimer.current = window.setTimeout(() => {
          const s = lpStart.current
          cancelLongPress()
          if (s) onAddPin(atPercent(s.x, s.y))
        }, 520)
      }} onPointerMove={(e) => {
        if (!lpStart.current) return
        if (Math.hypot(e.clientX - lpStart.current.x, e.clientY - lpStart.current.y) > 7) cancelLongPress()
      }} onPointerUp={cancelLongPress} onPointerCancel={cancelLongPress}>
        {groups.map((g) => {
          const n = g.items.length
          const fanOpen = sel && g.items.some((p) => p.id === sel.id) && n > 1
          return g.items.map((p, i) => {
            const ang = fanOpen ? (i / n) * Math.PI * 2 : 0
            const rr = fanOpen ? 34 : 0
            return (
              <Button
                asChild
                key={p.id}
                type="button"
                variant="ghost"
                aria-label={`Annotation by ${p.author}: ${p.text}`}
                className={cn(
                  "absolute z-[5] -ml-3 -mt-7 grid size-7 place-items-center rounded-full rounded-bl-none p-0 text-[11px] font-semibold shadow-lg ring-2 ring-background",
                  n > 1 && !fanOpen && i > 0 && "hidden",
                  fanOpen ? "bg-foreground text-background hover:bg-foreground hover:text-background" : i === 0 ? "bg-[hsl(var(--warn))] text-primary-foreground hover:bg-[hsl(var(--warn))]" : "",
                )}
              >
                <motion.button
                  ref={(el) => { if (el) pinEls.current.set(p.id, el); else pinEls.current.delete(p.id) }}
                  onClick={(e) => { e.stopPropagation(); setSelId(sel?.id === p.id ? null : p.id) }}
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, x: Math.cos(ang) * rr, y: Math.sin(ang) * rr }}
                  transition={{ type: "spring", stiffness: 360, damping: 22, delay: i * 0.04 }}
                  style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                  className="cursor-pointer"
                >
                  {i === 0 && n > 1 ? n : "▪"}
                </motion.button>
              </Button>
            )
          })
        })}
        <AnimatePresence>
          {sel && (
            <FloatingPortal>
              <motion.div
                ref={refs.setFloating}
                key={sel.id}
                style={{ ...floatingStyles, width: 256 }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="relative z-[6] rounded-xl border bg-popover p-3 text-popover-foreground shadow-2xl"
                {...getFloatingProps()}
              >
                <FloatingArrow ref={arrowRef} context={context} fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={1} width={14} height={7} />
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[12px] leading-snug">{sel.text}</p>
                  <Button type="button" variant="ghost" aria-label="Close annotation" onClick={() => setSelId(null)} className="grid size-5 shrink-0 place-items-center rounded p-0 hover:bg-muted"><X className="size-3" /></Button>
                </div>
                <p className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  {sel.author}
                  <span className="flex items-center gap-2">
                    {onResolve && <Button type="button" variant="ghost" onClick={() => { onResolve(sel.id); setSelId(null) }} className="font-medium hover:underline hover:bg-muted">resolve</Button>}
                    {onRemove && <Button type="button" variant="ghost" onClick={() => { onRemove(sel.id); setSelId(null) }} className="font-medium text-[hsl(var(--err))] hover:underline hover:bg-muted">delete</Button>}
                  </span>
                </p>
              </motion.div>
            </FloatingPortal>
          )}
        </AnimatePresence>
      </div>
      {onAddPin && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] z-[7] flex justify-end px-4">
        <Button type="button" variant="ghost" onClick={() => setAdding((a) => !a)} aria-pressed={adding} className={cn("pointer-events-auto flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium shadow-lg transition-colors", adding ? "bg-[hsl(var(--err))] text-primary-foreground hover:bg-[hsl(var(--err))] hover:text-primary-foreground" : "bg-foreground text-background hover:bg-foreground/90 hover:text-background")}>
          <MessageSquarePlus className="size-4" /> {adding ? "click where · esc" : "annotate"}
        </Button>
        </div>
      )}
          </MotionConfig>
    </div>
  )
}
