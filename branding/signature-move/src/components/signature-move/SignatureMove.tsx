import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Fingerprint, MousePointer2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Cursor } from "@/components/primitives/cursor"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// ═══ JOB      codify the one gesture everyone copies
// ═══ EMOTION  signature in the literal sense — a move with your name on it
// ═══ SIGNATURE a live sandbox, not a loop: your cursor is replaced inside the
//               stage by the brand marker; every press blooms an ink ring at
//               the exact touch point (recorded, not centered) and settles on
//               a spring. The spec plate states the real numbers the code uses
//   SITE      → brand guidelines interaction chapter
//   APP       → design-system docs; params are data
//   BUILD     vendored Cursor (fixed: the marker actually renders now);
//             press state lives in one reducer — bloom position + key
//   A11Y      stage is a labelled group; pointer demo is aria-hidden; the
//             spec dl is the readable truth; reduced-motion = still marker,
//             clicks still register visibly via the badge

export type SignatureMoveProps = { className?: string }

const BLOOM_MS = 180
const SETTLE = { type: "spring", stiffness: 300, damping: 18 } as const

const SPEC: { k: string; v: string }[] = [
  { k: "trigger", v: "pointerdown" },
  { k: "bloom", v: `scale 1 → 1.35 · ${BLOOM_MS}ms` },
  { k: "settle", v: "scale → 1 · 420ms · spring 300/18" },
  { k: "ink", v: "ring 2px · fades 400ms" },
  { k: "scope", v: "stage only · cursor restored on leave" },
]

type Press = { x: number; y: number; key: number }

export function SignatureMove({ className }: SignatureMoveProps) {
  const reduced = useReducedMotion()
  const [down, setDown] = React.useState(false)
  const [presses, setPresses] = React.useState(0)
  const [bloom, setBloom] = React.useState<Press | null>(null)
  const stage = React.useRef<HTMLDivElement>(null)

  const handleDown = (e: React.PointerEvent) => {
    const rect = stage.current?.getBoundingClientRect()
    if (!rect) return
    setDown(true)
    setPresses((p) => p + 1)
    setBloom({ x: e.clientX - rect.left, y: e.clientY - rect.top, key: performance.now() })
  }

  return (
    <section className={cn("bg-background text-foreground", className)>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <header className="">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">SIGNATURE MOVE · THE GESTURE</span>
        <h2 className="mt-2 tracking-tight text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{<>One move people <em className="font-serif italic font-medium">steal.</em></>}</h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">Press inside the stage — the marker blooms where you touch and springs back. Below is the exact score it plays.</p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* sandbox stage */}
        <div
          ref={stage}
          role="group"
          aria-label="Signature move demo: press inside the stage to bloom the marker"
          onPointerDown={handleDown}
          onPointerUp={() => setDown(false)}
          onPointerLeave={() => setDown(false)}
          className="relative grid min-h-[340px] touch-none select-none place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20"
        >
          <Fingerprint aria-hidden className="size-16 text-foreground/10" strokeWidth={1.2} />

          <motion.span
            aria-hidden
            key={bloom?.key ?? "idle"}
            initial={false}
            animate={bloom ? { scale: down ? 2.2 : 1.6, opacity: down ? 0.9 : 0 } : { scale: 0, opacity: 0 }}
            transition={down ? { duration: BLOOM_MS / 1000 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={bloom ? { left: bloom.x, top: bloom.y } : undefined}
            className={cn("pointer-events-none absolute size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-foreground/40", !bloom && "left-1/2 top-1/2")}
          />

          {/* brand marker rides the real cursor inside the stage */}
          <Cursor attachToParent springConfig={{ stiffness: 800, damping: 40 }}>
            <motion.span
              aria-hidden
              animate={reduced ? {} : { scale: down ? 1.35 : 1 }}
              transition={down ? { duration: BLOOM_MS / 1000 } : SETTLE}
              className="grid size-9 place-items-center rounded-full border-2 border-foreground bg-background/90 text-foreground shadow-[0_6px_18px_-6px_hsl(var(--foreground)/0.4)]"
            >
              <MousePointer2 className="size-3.5" />
            </motion.span>
          </Cursor>

          <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            press anywhere · it blooms, it settles
          </p>
        </div>

        {/* spec plate */}
        <Card>
          <CardContent>
            <Badge variant="outline" className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Spec · V2 · ratified
            </Badge>
            <dl className="mt-4 divide-y divide-border">
              {SPEC.map((s) => (
                <div key={s.k} className="flex items-baseline justify-between gap-3 py-2.5">
                  <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">{s.k}</dt>
                  <dd className="text-right font-mono text-[11px] text-muted-foreground">{s.v}</dd>
                </div>
              ))}
            </dl>
            <InView once as="p" className="mt-4 border-t border-dashed pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {presses > 0 ? `${presses} press${presses === 1 ? "" : "es"} registered · feeling still unpatentable` : "patent pending on the feeling only"}
            </InView>
          </CardContent>
        </Card>
      </div>
    </div>
    </section>
  )
}
