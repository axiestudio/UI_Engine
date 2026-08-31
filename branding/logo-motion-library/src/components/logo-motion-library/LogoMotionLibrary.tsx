import * as React from "react"
import { motion } from "motion/react"
import { Pause, Play, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      document the logo's motion like a choreography score
// ═══ EMOTION  rehearsal-room precision — every frame is intentional
// ═══ SIGNATURE three replayable "moves" (intro / loop / exit) with a
//               playback plate: play/pause/replay and a frame ruler
//   SITE      → brand guidelines "motion" chapter
//   APP       → lottie/animation pickers; onMove emits move id
//   A11Y      buttons labeled; reduce-motion shows end state

export type LogoMove = "intro" | "loop" | "exit"

export type LogoMotionLibraryProps = {
  className?: string
  onMoveChange?: (m: LogoMove) => void
}

const MOVES: { id: LogoMove; label: string; spec: string; duration: number }[] = [
  { id: "intro", label: "Intro — First Light", spec: "scale 0.92→1 · blur 8→0 · 600ms · easeOut", duration: 1.1 },
  { id: "loop", label: "Loop — Idle Breathing", spec: "glow 0→0.18→0 · 3.2s · easeInOut · ∞", duration: 3.2 },
  { id: "exit", label: "Exit — Curtain", spec: "y 0→-14 · opacity 1→0 · 420ms · easeIn", duration: 0.8 },
]

export function LogoMotionLibrary({ className, onMoveChange }: LogoMotionLibraryProps) {
  const [move, setMove] = React.useState<LogoMove>("intro")
  const [playing, setPlaying] = React.useState(true)
  const [runId, setRunId] = React.useState(0)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const current = MOVES.find((m) => m.id === move)!
  const pick = (m: LogoMove) => { setMove(m); setPlaying(true); setRunId((r) => r + 1); onMoveChange?.(m) }

  return (
    <SectionShell width={920} rails className={className}>
      <MonoLabel className="text-muted-foreground">LOGO MOTION · THE SCORE</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Three moves. Nothing improvised.</h2>

      <div className="mt-10 grid gap-10 lg:grid-cols-[300px_1fr]">
        <div role="radiogroup" aria-label="Logo moves" className="flex flex-col gap-2">
          {MOVES.map((m) => (
            <button key={m.id} role="radio" aria-checked={move === m.id} onClick={() => pick(m)}
              className={cn("rounded-xl border p-4 text-left transition-colors",
                move === m.id ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:border-foreground/40")}>
              <span className="font-display text-sm font-bold">{m.label}</span>
              <span className={cn("mt-1 block font-mono text-[10px] leading-relaxed", move === m.id ? "text-background/70" : "text-muted-foreground")}>{m.spec}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-8">
          {/* stage */}
          <div className="relative grid h-56 place-items-center overflow-hidden rounded-xl border border-dashed border-border bg-background">
            <motion.svg
              key={`${move}-${runId}`}
              width="120" height="120" viewBox="0 0 48 48" fill="none" aria-hidden
              initial={reduce || !playing ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" } : move === "intro" ? { opacity: 0, scale: 0.92, filter: "blur(8px)" } : move === "exit" ? { opacity: 1, scale: 1, y: 0 } : {}}
              animate={
                reduce || !playing
                  ? { opacity: 1, scale: 1, y: 0 }
                  : move === "intro"
                    ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                    : move === "loop"
                      ? { opacity: [1, 1, 1], scale: [1, 1.04, 1] }
                      : { opacity: 0, y: -14 }
              }
              transition={move === "loop" ? { duration: current.duration, repeat: Infinity, ease: "easeInOut" } : { duration: current.duration, ease: move === "exit" ? "easeIn" : "easeOut" }}
              className="text-foreground"
            >
              <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="2.6" />
              <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
            {/* frame ruler */}
            <div aria-hidden className="absolute inset-x-8 bottom-3 flex justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.span key={i} initial={false} animate={playing && !reduce ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.25 }}
                  transition={{ duration: current.duration / 2, repeat: playing && !reduce ? Infinity : 0, delay: i * 0.06 }}
                  className={cn("w-px bg-foreground", i % 3 === 0 ? "h-3" : "h-1.5")} />
              ))}
            </div>
          </div>

          {/* transport */}
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-foreground hover:bg-foreground hover:text-background">
              {playing ? <Pause className="size-3.5" aria-hidden /> : <Play className="size-3.5" aria-hidden />} {playing ? "Pause" : "Play"}
            </button>
            <button type="button" onClick={() => { setRunId((r) => r + 1); setPlaying(true) }}
              className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-foreground hover:bg-foreground hover:text-background">
              <RotateCcw className="size-3.5" aria-hidden /> Replay
            </button>
            <InView once className="ml-auto hidden sm:block">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">take {String(runId + 1).padStart(3, "0")}</span>
            </InView>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}
