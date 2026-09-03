import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"


export type ActivityNode = { city: string; x: number; y: number; count: number }

export type ActivityConstellationProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  nodes?: ActivityNode[]
  className?: string
}

const DEFAULT_NODES: ActivityNode[] = [
  { city: "Berlin", x: 52, y: 30, count: 412 },
  { city: "London", x: 47, y: 28, count: 388 },
  { city: "New York", x: 25, y: 36, count: 511 },
  { city: "São Paulo", x: 34, y: 70, count: 190 },
  { city: "Nairobi", x: 56, y: 58, count: 96 },
  { city: "Bengaluru", x: 67, y: 50, count: 301 },
  { city: "Tokyo", x: 84, y: 36, count: 274 },
  { city: "Sydney", x: 86, y: 76, count: 88 },
  { city: "Toronto", x: 27, y: 30, count: 205 },
]

function ContinentDots() {
  const dots: { x: number; y: number }[] = []
  for (let gy = 0; gy < 18; gy++) {
    for (let gx = 0; gx < 36; gx++) {
      const x = (gx / 36) * 100
      const y = (gy / 18) * 100
      const on =
        (x > 12 && x < 30 && y > 22 && y < 48) ||
        (x > 24 && x < 38 && y > 50 && y < 84) ||
        (x > 43 && x < 56 && y > 22 && y < 40) ||
        (x > 44 && x < 62 && y > 42 && y < 62) ||
        (x > 56 && x < 86 && y > 24 && y < 56) ||
        (x > 80 && x < 92 && y > 68 && y < 84)
      if (on) dots.push({ x, y })
    }
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="absolute inset-0 h-full w-full">
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="0.42" fill="currentColor" className="text-background" opacity="0.18" />
      ))}
    </svg>
  )
}

export function ActivityConstellation({
  eyebrow = "ACTIVITY · GLOBAL",
  title = "Global active sessions",
  subtitle = "Dots are cities. Hourly samples, weekly totals.",
  nodes = DEFAULT_NODES,
  className,
}: ActivityConstellationProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const total = React.useMemo(() => nodes.reduce((s, n) => s + n.count, 0), [nodes])

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-foreground text-background", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-background/60")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] sm:text-[34px]">{title}</h2>
          <p className="mt-2 text-[13px] leading-6 text-background/65">{subtitle}</p>
        </div>
        <div className="shrink-0 rounded-full border border-background/15 bg-background/90 px-3.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground">
          {nodes.length} cities · {total.toLocaleString()} sessions / week
        </div>
      </div>

      <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-xl border border-background/15 bg-background/[0.04]">
        <ContinentDots />

        {/* subtle grid */}
        <div aria-hidden className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(to right, hsl(var(--background)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--background)) 1px, transparent 1px)", backgroundSize: "10% 12.5%" }} />

        {/* soft radar — static conically shaded, not spinning infinitely */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse 90% 85% at 50% 50%, transparent 45%, hsl(var(--background) / 0.06) 100%)" }}
        />

        {/* nodes */}
        {nodes.map((n, i) => (
          <motion.button
            key={n.city}
            type="button"
            aria-label={`${n.city}: ${n.count} weekly sessions`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 + i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ left: `${n.x}%`, top: `${n.y}%` }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="relative grid place-items-center">
              {!reduce && (
                <span
                  aria-hidden
                  className={cn("absolute size-6 rounded-full border border-background/30", hover === i ? "opacity-60" : "opacity-0")}
                  style={{ transition: "opacity 200ms" }}
                />
              )}
              <span
                className={cn(
                  "size-2.5 rounded-full bg-background ring-1 ring-background/20 transition-transform",
                  hover === i && "scale-[1.35]",
                )}
              />
            </span>
            {hover === i && (
              <motion.span
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="pointer-events-none absolute -top-10 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-foreground shadow-sm"
              >
                {n.city} · {n.count.toLocaleString()}
              </motion.span>
            )}
          </motion.button>
        ))}

        {/* legend */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
          <span className="size-2 rounded-full bg-foreground" aria-hidden /> Active presence
        </div>
      </div>

      {/* fallback list for AT */}
      <ul className="sr-only">
        {nodes.map((n) => (
          <li key={n.city}>{n.city}: {n.count} weekly sessions</li>
        ))}
      </ul>

      <p className="mt-3 font-mono text-[11px] font-medium tracking-wide text-background/55">Map is decorative · All data available as a table to assistive tech.</p>
    
  </div>
</section>
  )
}
