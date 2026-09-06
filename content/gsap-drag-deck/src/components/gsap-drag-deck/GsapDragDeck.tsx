import * as React from "react"
import gsap from "gsap"
import { Draggable } from "gsap/Draggable"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(Draggable, InertiaPlugin)

// ═══ JOB         Let the front desk deal the day like a hand of cards.
// ═══ EMOTION     Flick the top client and the deck reshuffles itself.
// ═══ SIGNATURE   Inertia Draggable on the top card only — throw past 120px
//                 and it sails off, re-stacks to the back with a reset
//                 transform; let go early and it springs home, elastic.

const CLIENTS = [
  { name: "Ingrid Sollén", treatment: "Cut & finish", time: "Tue 09:30", price: "620 kr" },
  { name: "Per-Arne Lind", treatment: "Beard sculpt", time: "Tue 11:00", price: "340 kr" },
  { name: "Maja Kvist", treatment: "Keratin smooth", time: "Wed 14:15", price: "1 290 kr" },
  { name: "Jonas Ek", treatment: "Silver blend", time: "Thu 10:45", price: "880 kr" },
  { name: "Astrid Holm", treatment: "Bridal updo", time: "Fri 13:00", price: "1 450 kr" },
]

const BASE_ROT = [-3.5, 2.5, -1.5, 4, -2]
const BASE_Y = [0, 4, -3, 8, -6]
const THROWN_AT = 120

export type GsapDragDeckProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapDragDeck({
  eyebrow = "GSAP · DRAG DECK",
  title = "Deal the day.",
  subtitle = "Five clients, one stack. Fling the top card and the deck reshuffles itself; let it go early and it springs back home.",
  caption = "DRAGGABLE · INERTIA · 5 CARDS",
  className,
}: GsapDragDeckProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const [order, setOrder] = React.useState<number[]>(() => CLIENTS.map((_, i) => i))
  const [dealt, setDealt] = React.useState(0)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  // resting poses for the messy stack
  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { x: 0, y: BASE_Y[i], rotation: BASE_ROT[i] })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // drag lives on the top card only — re-created after every shuffle
  React.useEffect(() => {
    if (reduce) return
    const top = order[0]
    const el = cardRefs.current[top]
    if (!el) return
    let moved = false
    const springBack = () => {
      gsap.to(el, { x: 0, y: BASE_Y[top], rotation: BASE_ROT[top], scale: 1, duration: 0.6, ease: "elastic.out(1, 0.5)", overwrite: "auto" })
    }
    const [drag] = Draggable.create(el, {
      type: "x,y",
      inertia: true,
      edgeResistance: 0.8,
      zIndexBoost: false,
      onPress(this: Draggable) {
        gsap.to(el, { rotation: 0, scale: 1.03, duration: 0.25, ease: "power2.out", overwrite: "auto" })
      },
      onDragStart() {
        moved = true
      },
      onRelease() {
        if (!moved) springBack()
      },
      onDragEnd(this: Draggable) {
        const wasMoved = moved
        moved = false
        if (!wasMoved) return
        const thrown = Math.abs(this.x) > THROWN_AT || Math.abs(this.y) > THROWN_AT
        if (!thrown) {
          springBack()
          return
        }
        const dir = (this.x || this.y) >= 0 ? 1 : -1
        gsap.to(el, {
          x: dir * 460,
          y: this.y - 70,
          rotation: dir * 16,
          opacity: 0,
          duration: 0.45,
          ease: "power3.in",
          overwrite: "auto",
          onStart: () => {
            gsap.set(el, { pointerEvents: "none" })
          },
          onComplete: () => {
            setOrder((prev) => [...prev.slice(1), prev[0]])
            setDealt((n) => Math.min(n + 1, CLIENTS.length))
            gsap.set(el, { x: 0, y: BASE_Y[top], rotation: BASE_ROT[top], opacity: 1, zIndex: 1, pointerEvents: "auto" })
          },
        })
      },
    })
    return () => {
      drag.kill()
    }
  }, [order, reduce])

  const resetDeck = React.useCallback(() => {
    setOrder(CLIENTS.map((_, i) => i))
    setDealt(0)
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      gsap.to(el, {
        x: 0,
        y: BASE_Y[i],
        rotation: BASE_ROT[i],
        scale: 1,
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
        delay: i * 0.05,
      })
    })
  }, [])

  return (
    <section className={cn("relative isolate w-full overflow-x-clip bg-background", className)}>
      <div className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6 sm:py-14">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">{eyebrow}</span>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
        </InView>

        <div className="mt-10 flex justify-center">
          <div ref={rootRef} className="relative h-[320px] w-[280px]" style={{ touchAction: "none" }}>
            {CLIENTS.map((client, i) => {
              const pos = order.indexOf(i)
              return (
                <div
                  key={client.name}
                  ref={(el) => {
                    cardRefs.current[i] = el
                  }}
                  className={cn(
                    "absolute inset-0 flex flex-col rounded-[16px] border border-border bg-card p-4",
                    "shadow-[0_24px_48px_-32px_hsl(var(--foreground)/0.5)]",
                    !reduce && "cursor-grab active:cursor-grabbing",
                  )}
                  style={{ zIndex: CLIENTS.length - pos }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">Client {String(i + 1).padStart(2, "0")}</span>
                    <span className="font-mono text-[11px] font-bold tabular-nums text-muted-foreground">{client.price}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold tracking-tight text-foreground">{client.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{client.treatment}</p>
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-3.5" aria-hidden />
                    {client.time}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                    {pos === 0 && (
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                        {reduce ? "Static stack" : "Drag to deal"}
                      </span>
                    )}
                    {pos === 0 && (
                      <span aria-hidden className="font-mono text-[10px] font-bold text-primary">
                        →
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mx-auto mt-6 flex w-[280px] items-center justify-between">
          <span aria-live="polite" className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="text-primary">{String(Math.min(dealt, CLIENTS.length)).padStart(2, "0")}</span> /{" "}
            {String(CLIENTS.length).padStart(2, "0")} dealt
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={resetDeck}
            disabled={reduce || dealt === 0}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground",
              "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </Button>
        </div>

        <p className="mx-auto mt-8 flex w-[280px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span>{caption}</span>
          <span aria-hidden>●</span>
        </p>
      </div>
    </section>
  )
}
