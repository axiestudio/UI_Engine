import * as React from "react"
import { animate, useReducedMotion, useMotionValue, useTransform, motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      state beliefs so they can't be skimmed away
// ═══ EMOTION  someone at the keys, right now, for you
// ═══ SIGNATURE the machine types the manifest at 220wpm, one line at a
//               time, with a block caret that keeps blinking after the set —
//               the character pump is the motion engine (animate + MotionValue,
//               like the registry's vendored typewriters), never a hand-rolled
//               setTimeout state machine; React re-renders once per line.
//   SITE     → values/about band on dark or paper
//   APP      → agent/console "live log" surface — pass streamed `lines`
//             (new lines type as they arrive — this is the same mechanic)
//   A11Y     finished text is a real list (aria-live only while typing);
//            reduced motion = all set instantly

export type TypewriterManifestoProps = {
  eyebrow?: string
  title?: React.ReactNode
  lines: React.ReactNode[]
  speed?: number
  /** App/console mode: wrap in screen chrome (bezel + header lamp). */
  screen?: boolean
  className?: string
}

/** One typed line — text is sliced off a MotionValue tweened by the motion
 * engine, so no per-character React renders. Calls onDone after the typed
 * beat (420ms), sequenced by the engine's onComplete, not a state machine. */
function TypedLine({ text, speed, onDone }: { text: string; speed: number; onDone: () => void }) {
  const count = useMotionValue(0)
  const shown = useTransform(count, (v) => text.slice(0, Math.round(v)))
  React.useEffect(() => {
    const controls = animate(count, text.length, {
      duration: text.length / speed,
      ease: "linear",
      onComplete: () => {
        const t = window.setTimeout(onDone, 420)
        return () => window.clearTimeout(t)
      },
    })
    return () => controls.stop()
  }, [count, text, speed, onDone])
  return <motion.span>{shown}</motion.span>
}

export function TypewriterManifesto({ eyebrow = "TRANSMISSION", title, lines, speed = 22, screen = false, className }: TypewriterManifestoProps) {
  const reduceMotion = useReducedMotion()
  const reduce = !!reduceMotion
  const [typedCount, setTypedCount] = React.useState(reduce ? lines.length : 0)

  // Reset when the manifest changes or reduced-motion flips (SSR-safe)
  React.useEffect(() => {
    setTypedCount(reduce ? lines.length : 0)
  }, [reduce, lines])

  const text = typeof lines[typedCount] === "string" ? (lines[typedCount] as string) : null
  const done = typedCount >= lines.length

  const onLineDone = React.useCallback(() => {
    setTypedCount((v) => v + 1)
  }, [])

  const Body = (
    <div className={cn("relative mx-auto w-full max-w-[720px]", screen && "mx-0")}>
      <ul
        className="space-y-2.5 font-mono text-[13px] leading-relaxed sm:text-[15px]"
        aria-label={typeof title === "string" ? title : "Manifest"}
        aria-live={reduce ? "off" : "polite"}
        aria-busy={!done && !reduce}
      >
        {lines.slice(0, typedCount).map((l, i) => (
          <li key={i} className="flex gap-3">
            <span aria-hidden className="select-none tabular-nums opacity-40">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{l}</span>
          </li>
        ))}
        {text && !done && !reduce && (
          <li className="flex gap-3" aria-hidden>
            <span className="select-none tabular-nums opacity-40">{String(typedCount + 1).padStart(2, "0")}</span>
            <span>
              <TypedLine text={text} speed={speed} onDone={onLineDone} />
              <span className="ml-0.5 inline-block h-[1.05em] w-[0.6ch] translate-y-[3px] bg-current animate-[blink_1s_steps(2)_infinite]" aria-hidden />
            </span>
          </li>
        )}
      </ul>
      <span className="sr-only" aria-live={reduce ? "off" : "polite"}>
        {reduce ? lines.filter((l) => typeof l === "string").join(". ") : done ? "Transmission complete." : `Line ${typedCount + 1} of ${lines.length}`}
      </span>
      <style>{`@keyframes blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }`}</style>
    </div>
  )

  if (!screen) {
    return (
      <section className={cn("relative isolate w-full overflow-hidden bg-background px-4 py-20 text-foreground sm:px-6 lg:px-8", className)}>
        <div className="mx-auto w-full max-w-[720px]">
          <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
          {title && <h2 className="mb-8 mt-3 font-display text-3xl font-black tracking-tight sm:text-[40px]">{title}</h2>}
          {Body}
        </div>
      </section>
    )
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background px-4 py-14 sm:px-6", className)}>
      <div className="mx-auto w-full max-w-[760px] overflow-hidden rounded-xl border-[6px] border-[hsl(var(--screen))] bg-[hsl(var(--screen))] p-5 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-7 text-[hsl(var(--screen-ink))]" style={{ background: "hsl(var(--screen))" }}>
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
          <span className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[hsl(var(--green))]"><span className={cn("size-1.5 rounded-full bg-[hsl(var(--green))]", !reduce && "animate-pulse")} />{eyebrow}</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--green-dim))]">220 wpm</span>
        </div>
        {title && <h2 className="mb-6 font-mono text-lg font-black text-[hsl(var(--green))]">{title}</h2>}
        {Body}
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(to_bottom,hsl(var(--screen)/0.35)_0_2px,transparent_2px_4px)] opacity-25" />
      </div>
    </section>
  )
}
