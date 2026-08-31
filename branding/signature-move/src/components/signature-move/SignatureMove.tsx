import * as React from "react"
import { motion } from "motion/react"
import { MousePointer2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { Cursor } from "@/components/primitives/cursor"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      codify the one gesture everyone copies
// ═══ EMOTION  signature in the literal sense — a move with your name on it
// ═══ SIGNATURE a live demo stage where a custom cursor performs the move
//               (press→bloom→settle) on loop; spec table beside it
//   SITE      → brand guidelines interaction chapter
//   APP       → design-system docs; move params are data
//   A11Y      stage decorative; spec table readable; reduce-motion = static

export type SignatureMoveProps = { className?: string }

const SPEC = [
  { k: "trigger", v: "pointerdown" },
  { k: "bloom", v: "scale 1 → 1.35 · 180ms" },
  { k: "settle", v: "scale → 1 · 420ms · spring" },
  { k: "ink", v: "ring 2px · fades 400ms" },
  { k: "sound", v: "optional · 40ms tick" },
]

export function SignatureMove({ className }: SignatureMoveProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [pressed, setPressed] = React.useState(false)

  React.useEffect(() => {
    if (reduce) return
    let alive = true
    const loop = () => {
      if (!alive) return
      setPressed(true)
      window.setTimeout(() => alive && setPressed(false), 240)
      window.setTimeout(loop, 2200)
    }
    const t = window.setTimeout(loop, 600)
    return () => { alive = false; window.clearTimeout(t) }
  }, [reduce])

  return (
    <SectionShell width={1120} className={className}>
      <MonoLabel className="text-muted-foreground">SIGNATURE MOVE · THE GESTURE</MonoLabel>
      <h2 className="mt-2 max-w-xl font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        One move people <em className="font-serif italic font-medium">steal.</em>
      </h2>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="relative grid min-h-[320px] place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20">
          <Cursor className="[&>div]:hidden" attachToParent>
            <motion.div
              aria-hidden
              animate={{ scale: pressed ? 1.5 : 1, opacity: pressed ? 1 : 0.85 }}
              transition={pressed ? { duration: 0.18 } : { type: "spring", stiffness: 300, damping: 18 }}
              className="grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-foreground bg-background/80 text-foreground"
            >
              <MousePointer2 className="size-4" />
            </motion.div>
          </Cursor>
          <motion.span
            aria-hidden
            animate={{ scale: pressed ? 2.2 : 0, opacity: pressed ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute size-24 rounded-full border-2 border-foreground/40"
          />
          <p className="mt-40 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">press anywhere · it blooms, it settles</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">SPEC · V2</span>
          <dl className="mt-4 divide-y divide-border">
            {SPEC.map((s) => (
              <div key={s.k} className="flex items-baseline justify-between gap-3 py-2.5">
                <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-foreground">{s.k}</dt>
                <dd className="text-right font-mono text-[11px] text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
          <InView once className="mt-4 block border-t border-dashed pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            patent pending on the feeling only
          </InView>
        </div>
      </div>
    </SectionShell>
  )
}
