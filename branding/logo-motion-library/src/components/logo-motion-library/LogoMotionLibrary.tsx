import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Pause, Play, RotateCcw, Clapperboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ═══ JOB      document the logo's motion like a choreography score
// ═══ EMOTION  rehearsal-room precision — every frame is intentional
// ═══ SIGNATURE a two-pane score sheet: the move list on the left (specs in
//               mono), the stage on the right with a ticking frame ruler;
//               transport row replays takes, and a speed rail scrubs
//               0.5× / 1× / 2× through the same choreography
//   SITE      → brand guidelines "motion" chapter
//   APP       → animation pickers; onMoveChange emits move id
//   BUILD     shadcn Button/Badge transport + motion keyframe playback;
//             every spec on screen is the spec actually animating
//   A11Y      controls are real buttons with focus rings and aria-pressed;
//             reduced motion shows the end state and a note, never a loop

export type LogoMove = "intro" | "loop" | "exit"

export type LogoMotionLibraryProps = {
  className?: string
  onMoveChange?: (m: LogoMove) => void
}

const MOVES: { id: LogoMove; label: string; spec: string; duration: number }[] = [
  { id: "intro", label: "Intro — First Light", spec: "scale 0.92→1 · blur 8→0 · 1100ms · easeOut", duration: 1.1 },
  { id: "loop", label: "Loop — Idle Breathing", spec: "glow 1→1.04→1 · 3200ms · easeInOut · ∞", duration: 3.2 },
  { id: "exit", label: "Exit — Curtain", spec: "y 0→−14 · opacity 1→0 · 800ms · easeIn", duration: 0.8 },
]

const SPEEDS = [0.5, 1, 2] as const

function Stage({ move, playing, runId, speed, reduced }: { move: LogoMove; playing: boolean; runId: number; speed: number; reduced: boolean }) {
  const current = MOVES.find((m) => m.id === move)!
  const dur = current.duration / speed
  const frozen = !playing || reduced

  return (
    <div className="relative grid h-56 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-background">
      <motion.svg
        key={`${move}-${runId}-${speed}`}
        width="120" height="120" viewBox="0 0 48 48" fill="none" aria-hidden className="text-foreground"
        initial={frozen ? false : move === "intro" ? { opacity: 0, scale: 0.92, filter: "blur(8px)" } : move === "exit" ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1 }}
        animate={
          frozen
            ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
            : move === "intro"
              ? { opacity: 1, scale: 1, filter: "blur(0px)" }
              : move === "loop"
                ? { scale: [1, 1.04, 1] }
                : { opacity: 0, y: -14 }
        }
        transition={
          move === "loop" && !frozen
            ? { duration: dur, repeat: Infinity, ease: "easeInOut" }
            : { duration: dur, ease: move === "exit" ? "easeIn" : "easeOut" }
        }
      >
        <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="2.6" />
        <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>

      {/* frame ruler — ticks light in sequence with the take */}
      <div aria-hidden className="absolute inset-x-8 bottom-3 flex justify-between">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={playing && !reduced ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.25 }}
            transition={{ duration: dur / 2, repeat: playing && !reduced ? Infinity : 0, delay: (i * 0.06) / speed }}
            className={cn("w-px bg-foreground", i % 3 === 0 ? "h-3" : "h-1.5")}
          />
        ))}
      </div>

      {reduced && (
        <span className="absolute right-3 top-3">
          <Badge variant="secondary" className="font-mono text-[9px] font-bold uppercase tracking-[0.14em]">reduced motion · end state</Badge>
        </span>
      )}
      {frozen && !reduced && (
        <span className="absolute left-3 top-3">
          <Badge variant="outline" className="border-dashed font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">paused</Badge>
        </span>
      )}
    </div>
  )
}

export function LogoMotionLibrary({ className, onMoveChange }: LogoMotionLibraryProps) {
  const reduced = useReducedMotion() ?? false
  const [move, setMove] = React.useState<LogoMove>("intro")
  const [playing, setPlaying] = React.useState(true)
  const [speed, setSpeed] = React.useState<(typeof SPEEDS)[number]>(1)
  const [runId, setRunId] = React.useState(0)
  const current = MOVES.find((m) => m.id === move)!

  const pick = (m: LogoMove) => {
    setMove(m)
    setPlaying(!reduced)
    setRunId((r) => r + 1)
    onMoveChange?.(m)
  }

  return (
    <section className="relative isolate overflow-hidden w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <header className="">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">LOGO MOTION · THE SCORE</span>
        <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Three moves. Nothing improvised.</h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">What you see running is written down exactly as it runs.</p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-2" role="group" aria-label="Logo moves">
          {MOVES.map((m) => {
            const isActive = move === m.id
            return (
              <Button
                key={m.id}
                type="button"
                variant="outline"
                aria-pressed={isActive}
                onClick={() => pick(m.id)}
                className={cn(
                  "h-auto flex-col items-start gap-1 rounded-xl p-4 text-left transition-colors",
                  isActive && "border-foreground bg-foreground text-background shadow-[4px_4px_0_0_hsl(var(--border))] hover:bg-foreground hover:text-background"
                )}
              >
                <span className={cn("font-display text-sm font-bold", isActive ? "text-background" : "text-foreground")}>{m.label}</span>
                <span className={cn("block max-w-full whitespace-normal font-mono text-[10px] leading-relaxed", isActive ? "text-background/70" : "text-muted-foreground")}>{m.spec}</span>
              </Button>
            )
          })}
        </div>

        <div className="rounded-2xl border bg-card p-6 sm:p-8">
          <Stage move={move} playing={playing} runId={runId} speed={speed} reduced={reduced} />

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" size="sm" aria-pressed={playing} disabled={reduced} onClick={() => setPlaying((p) => !p)} className="gap-2 rounded-full font-mono text-[10px] font-black uppercase tracking-[0.16em]">
              {playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />} {playing ? "Pause" : "Play"}
            </Button>
            <Button type="button" variant="default" size="sm" onClick={() => { setRunId((r) => r + 1); setPlaying(true) }} disabled={reduced} className="gap-2 rounded-full font-mono text-[10px] font-black uppercase tracking-[0.16em]">
              <RotateCcw className="size-3.5" aria-hidden /> Replay
            </Button>

            {/* speed rail */}
            <div role="group" aria-label="Playback speed" className="inline-flex overflow-hidden rounded-full border">
              {SPEEDS.map((s) => (
                <Button key={s} type="button" size="xs" variant={speed === s ? "secondary" : "ghost"} aria-pressed={speed === s} onClick={() => setSpeed(s)} className="h-7 rounded-none font-mono text-[9px] font-black tabular-nums tracking-[0.08em]">
                  {s}×
                </Button>
              ))}
            </div>

            <InView once className="ml-auto hidden items-center gap-2 sm:flex">
              <Clapperboard className="size-3.5 text-muted-foreground" aria-hidden />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                take {String(runId + 1).padStart(3, "0")} · {current.label.split(" — ")[1]}
              </span>
            </InView>
          </div>

          <p aria-live="polite" className="sr-only">{`Move ${move}, take ${runId + 1}, ${playing ? "playing" : "paused"} at ${speed} times speed.`}</p>
        </div>
      </div>
    </div>
    </section>
  )
}
