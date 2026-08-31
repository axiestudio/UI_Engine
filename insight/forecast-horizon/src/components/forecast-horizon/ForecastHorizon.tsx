import * as React from "react"
import { motion, useMotionTemplate, useMotionValue, useTransform } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      let stakeholders drag the future themselves
// ═══ EMOTION  agency over uncertainty — the forecast is a dial, not fate
// ═══ SIGNATURE solid history path flows into a dashed forecast path whose
//               confidence band breathes wider as you push months out
//   SITE      → traction pages, fundraising decks
//   APP       → planning tools; months + history are props
//   A11Y      real range input; readout aria-live; paths decorative

export type ForecastHorizonProps = {
  history?: number[]
  growth?: number
  unit?: string
  className?: string
}

export function ForecastHorizon({ history = [18, 22, 26, 25, 31, 38, 44], growth = 14, unit = "k MRR", className }: ForecastHorizonProps) {
  const [months, setMonths] = React.useState(6)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const W = 100, H = 100
  const all = [...history, ...Array.from({ length: months }, (_, i) => Math.round(history[history.length - 1] * Math.pow(1 + growth / 100, i + 1)))]
  const max = Math.max(...all), min = Math.min(...all)
  const xy = (v: number, i: number) => {
    const x = (i / (all.length - 1)) * W
    const y = H - ((v - min) / (max - min || 1)) * (H - 16) - 8
    return [x, y] as const
  }
  const histPath = history.map((v, i) => `${i === 0 ? "M" : "L"}${xy(v, i)[0].toFixed(2)} ${xy(v, i)[1].toFixed(2)}`).join(" ")
  const fcPath = [history[history.length - 1], ...Array.from({ length: months }, (_, i) => all[history.length + i])]
    .map((v, i) => `${i === 0 ? "M" : "L"}${xy(v, history.length - 1 + i)[0].toFixed(2)} ${xy(v, history.length - 1 + i)[1].toFixed(2)}`)
    .join(" ")
  const bandTop = fcPath.replace(/L([\d.]+) ([\d.]+)/g, (_m, x, y) => `L${x} ${Math.max(0, Number(y) - 4).toFixed(2)}`)
  const bandBottom = fcPath.replace(/M([\d.]+) ([\d.]+)/, "L$1 $2").replace(/L([\d.]+) ([\d.]+)/g, (_m, x, y) => `L${x} ${Math.min(100, Number(y) + 4).toFixed(2)}`)

  const progress = useMotionValue(0)
  const bandWidth = useTransform(progress, [0, 1], ["0%", "100%"])
  React.useEffect(() => { progress.set(1) }, [progress])
  const dashClip = useMotionTemplate`inset(0 ${bandWidth} 0 0)`

  return (
    <SectionShell width={920} className={className}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">FORECAST · DRAG THE HORIZON</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground">History is solid. The rest is yours.</h2>
        </div>
        <p aria-live="polite" className="text-right">
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">+{months} months out</span>
          <span className="font-display text-3xl font-black tabular-nums text-foreground">{all[all.length - 1]}<span className="text-sm font-bold text-muted-foreground"> {unit}</span></span>
        </p>
      </div>

      <div aria-hidden className="relative mt-8 h-60 rounded-2xl border bg-card px-4 py-4">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-4 inset-x-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]">
          {/* confidence band */}
          <motion.path d={`${bandTop} ${bandBottom.split(" ").reverse().join(" ").replace(/^L/, "L")} Z`} fill="currentColor" fillOpacity="0.08" className="text-foreground"
            style={reduce ? {} : { clipPath: dashClip }} />
          {/* history */}
          <path d={histPath} fill="none" stroke="currentColor" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" className="text-foreground" />
          {/* forecast dashed */}
          <motion.path d={fcPath} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" strokeLinecap="round" className="text-foreground"
            initial={reduce ? {} : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
          {/* seam node */}
          <circle cx={xy(history[history.length - 1], history.length - 1)[0]} cy={xy(history[history.length - 1], history.length - 1)[1]} r="2.4" fill="currentColor" className="text-foreground" />
        </svg>
        <span aria-hidden className="absolute inset-y-4 left-[52%] w-px border-l border-dashed border-border" />
        <span className="absolute bottom-2 left-[52%] -translate-x-1/2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">today</span>
      </div>

      <label className="mt-8 block">
        <span className="flex justify-between font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Horizon <output htmlFor="fc-months" className="text-foreground">{months} months</output>
        </span>
        <input id="fc-months" type="range" min={1} max={12} value={months} onChange={(e) => setMonths(Number(e.target.value))} className="mt-3 w-full accent-foreground" />
      </label>
      <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">model · {growth}% compounding · dashed = assumption, not promise</p>
    </SectionShell>
  )
}
