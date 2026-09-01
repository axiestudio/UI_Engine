import * as React from "react"
import { motion } from "motion/react"
import { TrendingDown, TrendingUp } from "lucide-react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const REVEAL = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type SeriesKey = "bookings" | "walkins"

type SeriesDef = {
  key: SeriesKey
  label: string
  points: string
  last: { x: number; y: number }
  value: string
  delta: string
  up: boolean
}

const SERIES: SeriesDef[] = [
  {
    key: "bookings",
    label: "Bookings",
    points: "30,86 70,78 110,82 150,66 190,60 230,50 270,42 310,28",
    last: { x: 310, y: 28 },
    value: "46",
    delta: "▲ 12%",
    up: true,
  },
  {
    key: "walkins",
    label: "Walk-ins",
    points: "30,96 70,92 110,94 150,88 190,80 230,84 270,76 310,72",
    last: { x: 310, y: 72 },
    value: "18",
    delta: "▼ 4%",
    up: false,
  },
]

const X_TICKS = [30, 70, 110, 150, 190, 230, 270, 310]
const WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]

function seriesColor(key: SeriesKey): string {
  return key === "bookings" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"
}

function LegendChip({
  series,
  hidden,
  onToggle,
}: {
  series: SeriesDef
  hidden: boolean
  onToggle: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const reduced = React.useMemo(prefersReducedMotion, [])

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ])

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        onClick={onToggle}
        aria-pressed={!hidden}
        aria-haspopup="dialog"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          hidden && "border-dashed text-muted-foreground",
        )}
      >
        <span
          aria-hidden
          className={cn("size-1.5 rounded-full", hidden && "opacity-40")}
          style={{ backgroundColor: seriesColor(series.key) }}
        />
        {series.label}
      </button>
      {open && (
        <FloatingPortal>
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            initial={reduced ? false : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="z-50 w-56 rounded-xl border bg-card p-3.5 shadow-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{series.label}</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-mono text-[10px] font-bold",
                  series.up ? "text-primary" : "text-muted-foreground",
                )}
              >
                {series.up ? (
                  <TrendingUp className="size-3" aria-hidden />
                ) : (
                  <TrendingDown className="size-3" aria-hidden />
                )}
                {series.delta}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {series.value}
              <span className="ml-1.5 text-[11px] font-medium text-muted-foreground">this week</span>
            </p>
            <p className="mt-1.5 border-t border-border pt-2 font-mono text-[10px] leading-4 text-muted-foreground">
              Trailing eight weeks · Quiet Times Studio floor count
            </p>
          </motion.div>
        </FloatingPortal>
      )}
    </>
  )
}

export type FloatingChartLegendProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FloatingChartLegend({
  eyebrow = "Insight · Bookings",
  title = "This week, at a glance",
  subtitle = "Bookings hold steady while walk-ins taper off — click a chip to isolate a series, hover it for the latest numbers.",
  caption = "Quiet Times Studio — floor counts, weeks 24–31",
  tone = "paper",
  className,
}: FloatingChartLegendProps) {
  const [hidden, setHidden] = React.useState<Record<SeriesKey, boolean>>({
    bookings: false,
    walkins: false,
  })

  function toggle(key: SeriesKey) {
    setHidden((h) => ({ ...h, [key]: !h[key] }))
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={REVEAL} transition={{ duration: 0.8, ease: EASE }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <div className="mt-10 rounded-2xl border bg-card p-5 shadow-sm sm:max-w-md">
        <div className="flex items-center justify-between">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />Floor activity</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Trailing 8 weeks
          </span>
        </div>
        <svg
          viewBox="0 0 320 120"
          role="img"
          aria-label="Bookings versus walk-ins, trailing eight weeks"
          className="mt-4 h-auto w-full"
        >
          {[100, 70, 40, 10].map((y) => (
            <line
              key={y}
              x1={30}
              x2={310}
              y1={y}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={1}
              strokeDasharray={y === 100 ? undefined : "3 4"}
            />
          ))}
          {X_TICKS.map((x) => (
            <line key={x} x1={x} x2={x} y1={100} y2={104} stroke="hsl(var(--border))" strokeWidth={1} />
          ))}
          {[
            { y: 100, t: "0" },
            { y: 70, t: "30" },
            { y: 40, t: "60" },
            { y: 10, t: "90" },
          ].map((l) => (
            <text
              key={l.t}
              x={24}
              y={l.y + 2.5}
              textAnchor="end"
              fontSize={7}
              fill="hsl(var(--muted-foreground))"
              className="font-mono"
            >
              {l.t}
            </text>
          ))}
          {X_TICKS.map((x, i) => (
            <text
              key={x}
              x={x}
              y={114}
              textAnchor="middle"
              fontSize={7}
              fill="hsl(var(--muted-foreground))"
              className="font-mono"
            >
              {WEEKS[i]}
            </text>
          ))}
          {SERIES.map((s) => (
            <g key={s.key} className={cn("transition-opacity", hidden[s.key] && "opacity-15")}>
              <polyline
                points={s.points}
                fill="none"
                stroke={seriesColor(s.key)}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.key === "walkins" ? "5 5" : undefined}
              />
              <circle
                cx={s.last.x}
                cy={s.last.y}
                r={3}
                fill={seriesColor(s.key)}
                stroke="hsl(var(--background))"
                strokeWidth={1.5}
              />
            </g>
          ))}
        </svg>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {SERIES.map((s) => (
            <LegendChip key={s.key} series={s} hidden={hidden[s.key]} onToggle={() => toggle(s.key)} />
          ))}
        </div>
      </div>
      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    
  </div>
</section>
  )
}
