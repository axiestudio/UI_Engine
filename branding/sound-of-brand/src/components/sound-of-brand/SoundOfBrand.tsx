import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Music2, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, CornerTicks } from "@/components/primitives/handcraft"
import { TextShimmerWave } from "@/components/primitives/text-shimmer-wave"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ═══ JOB      give the brand a sound — and let people hear it
// ═══ EMOTION  hum in the air — the motif you can almost hear, now audible
// ═══ SIGNATURE a waveform wall where each bar is a real pitch of the motif;
//               hovering previews the note through WebAudio, clicking pins it,
//               and "Play motif" runs the full arpeggio with the bars lighting
//               in sequence. Sound is opt-in; nothing plays without a gesture.
//   SITE      → brand guideline "sonic identity" chapter
//   APP       → notification-sound pickers; notes are data
//   BUILD     real AudioContext oscillator per note (created lazily on first
//             gesture — never on mount, never autoplay). Reduced motion keeps
//             audio but drops the height/glow animation.
//   A11Y      bars are real buttons with note labels + aria-pressed; the
//             sequence is announced via aria-live; keyboard Tab+Enter previews

export type BrandNote = { note: string; hz: number; weight: number }

export type SoundOfBrandProps = {
  tagline?: string
  notes?: BrandNote[]
  /** Seconds between notes when the motif plays through. */
  step?: number
  eyebrow?: string
  className?: string
  onNote?: (n: BrandNote) => void
}

const DEFAULT_NOTES: BrandNote[] = [
  { note: "C3", hz: 130.8, weight: 60 },
  { note: "E3", hz: 164.8, weight: 45 },
  { note: "G3", hz: 196.0, weight: 80 },
  { note: "B3", hz: 246.9, weight: 35 },
  { note: "C4", hz: 261.6, weight: 100 },
  { note: "B3", hz: 246.9, weight: 55 },
  { note: "G3", hz: 196.0, weight: 70 },
  { note: "E3", hz: 164.8, weight: 40 },
]

/** Lazily-created shared AudioContext (one per module, opened on gesture). */
let audio: AudioContext | null = null
function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null
  try {
    if (!audio) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      audio = new AC()
    }
    if (audio.state === "suspended") void audio.resume()
    return audio
  } catch {
    return null
  }
}

/** One short, quiet, plucked tone at `hz`. */
function ping(hz: number, dur = 0.45) {
  const ac = ctx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = "triangle"
  osc.frequency.value = hz
  const t = ac.currentTime
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export function SoundOfBrand({
  tagline = "You'll know us in three notes.",
  notes = DEFAULT_NOTES,
  step = 0.32,
  eyebrow = "SONIC IDENTITY · MOTIF",
  className,
  onNote,
}: SoundOfBrandProps) {
  const reduced = useReducedMotion()
  const [active, setActive] = React.useState<number | null>(null)
  const [playing, setPlaying] = React.useState(false)
  const [lastHeard, setLastHeard] = React.useState<string | null>(null)
  const timers = React.useRef<number[]>([])

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), [])

  const light = (i: number) => setActive(i)

  const strike = (i: number) => {
    const n = notes[i]
    if (!n) return
    setActive(i)
    ping(n.hz)
    setLastHeard(n.note)
    onNote?.(n)
  }

  const playMotif = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setPlaying(true)
    notes.forEach((_, i) => {
      const t = window.setTimeout(() => {
        strike(i)
        if (i === notes.length - 1) window.setTimeout(() => { setPlaying(false); setActive(null) }, step * 1000)
      }, i * step * 1000)
      timers.current.push(t)
    })
  }

  return (
    <SectionShell width={920} tone="ink" grain className={cn("text-background", className)}>
      <CornerTicks className="text-background/40" />
      <div className="text-center">
        <MonoLabel className="justify-center text-background/55">{eyebrow}</MonoLabel>
        <TextShimmerWave duration={1.6} className="mt-4 font-display text-3xl font-black tracking-tight sm:text-4xl">
          {tagline}
        </TextShimmerWave>
        <p className="mx-auto mt-3 max-w-sm text-[13px] font-medium text-background/60">
          Hover to spotlight a bar — click (or Enter) to sound its note.
        </p>
      </div>

      <div role="group" aria-label="Brand motif notes" className="mt-14 flex h-48 items-end justify-center gap-2 sm:gap-3">
        {notes.map((n, i) => (
          <motion.button
            key={`${n.note}-${i}`}
            type="button"
            aria-label={`Play ${n.note}, ${Math.round(n.hz)} hertz. Press to sound it.`}
            aria-pressed={active === i}
            onMouseEnter={() => !playing && light(i)}
            onMouseLeave={() => !playing && setActive(null)}
            onClick={() => !playing && strike(i)}
            animate={reduced ? {} : { scaleY: active === i ? 1.06 : 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: `${n.weight}%`, transformOrigin: "bottom" }}
            className={cn(
              "relative w-6 rounded-t-md border border-background/25 bg-background/15 outline-none transition-colors duration-200 sm:w-9",
              "hover:bg-background/35 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-background/60",
              active === i && "bg-background/40"
            )}
          >
            {active === i && !reduced && (
              <motion.span aria-hidden layoutId="snd-glow" transition={{ duration: 0.3 }} className="absolute inset-x-0 -top-2 h-2 rounded-t-full bg-background/80 shadow-[0_0_14px_hsl(var(--background)/0.5)]" />
            )}
            <span className="absolute -bottom-6 inset-x-0 text-center font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-background/50">{n.note}</span>
          </motion.button>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
        <Button
          type="button"
          onClick={playMotif}
          disabled={playing}
          className="gap-2 rounded-full bg-background font-mono text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-background/90 focus-visible:ring-background/60"
        >
          <Music2 className="size-3.5" aria-hidden /> {playing ? "Playing motif…" : <><Play className="size-3.5" aria-hidden /> Play the motif</>}
        </Button>
        <Badge variant="outline" className="rounded-full border-background/30 bg-transparent font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-background/60">
          {notes.length} notes · C–E–G triad · square of {notes[0]?.note}–{notes[4]?.note}
        </Badge>
      </div>

      <p aria-live="polite" className="sr-only">
        {lastHeard ? `Heard ${lastHeard}.` : ""}
      </p>
    </SectionShell>
  )
}
