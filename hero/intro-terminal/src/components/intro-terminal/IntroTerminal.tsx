import * as React from "react"
import { motion, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import { useCurtainGate } from "@/lib/curtain"
import { Button } from "@/components/ui/button"

// ═══ JOB         Boot-sequence terminal intro.
// ═══ EMOTION     "the machine is waking up"
// ═══ SIGNATURE   Mono lines type in sequence; the last line opens the gate.
// ═══ ISOLATION   root-scoped: `absolute inset-0` inside `relative isolate overflow-hidden` — never `fixed`.

export type IntroTerminalProps = {
  mode?: "overlay" | "stage"
  range?: number
  lockScroll?: boolean
  skipOnReducedMotion?: boolean
  stageHeight?: string
  /** The boot log lines, typed one char at a time. */
  lines?: string[]
  title?: React.ReactNode
  description?: React.ReactNode
  onOpen?: () => void
  overlayClassName?: string
  className?: string
}

const DEFAULT_LINES = [
  "> boot ui.engine --collection=40+",
  "> resolving tokens ......... ok",
  "> mounting motion primitives .......... ok",
  "> revealing stage",
]

export function IntroTerminal({
  mode = "stage",
  range = 900,
  lockScroll = true,
  skipOnReducedMotion = true,
  stageHeight = "240vh",
  lines = DEFAULT_LINES,
  title = "ENGINE",
  description = "Scroll — the terminal boots, then the page opens.",
  onOpen,
  overlayClassName,
  className,
}: IntroTerminalProps) {
  const gate = useCurtainGate({ mode, range, lockScroll, skipOnReducedMotion, stageHeight, onOpen })
  const { reduce, progress, done, stageRef, enterSite } = gate

  if (mode === "overlay" && done) return null

  return (
    <div
      ref={mode === "stage" ? stageRef : undefined}
      className={cn("relative isolate w-full", mode === "overlay" && "min-h-[60vh]", className)}
      style={mode === "stage" ? { height: stageHeight } : undefined}
    >
      <div
        className={cn(mode === "stage" ? "sticky top-0 h-screen w-full overflow-hidden" : "absolute inset-0", overlayClassName)}
        role={mode === "overlay" ? "presentation" : undefined}
        aria-label={mode === "overlay" ? "Intro terminal" : undefined}
      >
        <TerminalScene
          progress={progress}
          reduce={reduce}
          lines={lines}
          title={title}
          description={description}
          onEnter={() => enterSite()}
        />
      </div>
    </div>
  )
}

function TerminalScene({
  progress,
  reduce,
  lines,
  title,
  description,
  onEnter,
}: {
  progress: MotionValue<number>
  reduce: boolean
  lines: string[]
  title: React.ReactNode
  description: React.ReactNode
  onEnter: () => void
}) {
  const coverOpacity = useTransform(progress, [0.4, 0.85], [1, 0])
  const coverY = useTransform(progress, [0.4, 1], [0, -40])
  const lineCount = Math.max(lines.length, 1)

  return (
    <motion.div style={{ opacity: coverOpacity, y: coverY }} className="absolute inset-0 overflow-hidden bg-[hsl(var(--curtain))]">
      <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 50% 0%, hsl(var(--curtain-lit)) 0%, transparent 55%)` }} />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[hsl(var(--curtain-shade))] ring-1 ring-[hsl(var(--curtain-glow)/0.3)]" />
            <span className="h-3 w-3 rounded-full bg-[hsl(var(--curtain-shade))] ring-1 ring-[hsl(var(--curtain-glow)/0.3)]" />
            <span className="h-3 w-3 rounded-full bg-[hsl(var(--curtain-glow)/0.3)]" />
            <span className="ml-3 font-mono text-[11px] font-bold tracking-[0.3em] text-[hsl(var(--curtain-text)/0.5)]">UI·ENGINE — TTY</span>
          </div>
          <div className="font-mono text-sm font-medium leading-relaxed text-[hsl(var(--curtain-text)/0.85)] sm:text-base">
            {lines.map((line, i) => (
              <TypedLine key={i} text={line} progress={progress} lineCount={lineCount} index={i} reduce={reduce} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="font-mono text-[11px] font-bold tracking-widest text-[hsl(var(--curtain-text)/0.5)]">{description}</p>
            <Button
              type="button"
              onClick={onEnter}
              variant="outline"
              size="sm"
              className="rounded-full border border-[hsl(var(--curtain-glow)/0.25)] bg-[hsl(var(--curtain-glow)/0.06)] px-5 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[hsl(var(--curtain-text))] hover:border-[hsl(var(--curtain-glow)/0.5)] hover:bg-[hsl(var(--curtain-glow)/0.14)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--curtain-glow)/0.7)]"
            >
              {title} →
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function TypedLine({
  text,
  progress,
  lineCount,
  index,
  reduce,
}: {
  text: string
  progress: MotionValue<number>
  lineCount: number
  index: number
  reduce: boolean
}) {
  // each line becomes fully typed in its own slice of the progress range
  const chars = useTransform(progress, [index / lineCount, (index + 0.9) / lineCount], [0, text.length])
  const [shown, setShown] = React.useState(reduce ? text.length : 0)
  React.useEffect(() => {
    if (reduce) { setShown(text.length); return }
    return chars.on("change", (v) => setShown(Math.floor(v)))
  }, [chars, reduce, text.length])

  return (
    <div className="whitespace-pre-wrap">
      {text.slice(0, shown)}
      {shown < text.length && <span className="animate-pulse text-[hsl(var(--curtain-glow)/0.8)]">▌</span>}
    </div>
  )
}
