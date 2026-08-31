import * as React from "react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      make a headline feel like LIVE DATA (what's on / what's new)
// ═══ EMOTION  the hush of a departures hall — information as theatre
// ═══ SIGNATURE split-flap scramble: every char tumbles through randoms and
//               settles left→right per row; re-scrambles when `items` change
//   SITE  → program / specials / price board section
//   APP   → release feed, order queue, kiosk status header (pass new items)
//   A11Y  tiles aria-hidden; real text in an sr-only line; motion is on
//         mount/update only, never loops; reduced-motion settles instantly

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:&./-"
const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

export type DepartureItem = { zone?: string; label: string; value: string; note?: string; tone?: "default" | "now" | "off" }

export type DepartureBoardProps = {
  eyebrow?: string
  title?: React.ReactNode
  items: DepartureItem[]
  /** ms per char flip step */
  speed?: number
  /** ms between rows settling */
  rowStagger?: number
  className?: string
}

export function DepartureBoard({
  eyebrow = "LIVE BOARD",
  title,
  items,
  speed = 42,
  rowStagger = 160,
  className,
}: DepartureBoardProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const signature = items.map((i) => `${i.label}|${i.value}`).join(";")

  // settled[i] = number of chars finalized in row i (-sim => not started)
  const [, tick] = React.useReducer((n: number) => n + 1, 0)
  const settledRef = React.useRef<number[]>([])
  React.useEffect(() => {
    if (reduce) {
      settledRef.current = items.map(() => 99)
      tick()
      return
    }
    const started = performance.now() + 260
    const total = items.reduce((m, i) => Math.max(m, i.value.length), 0)
    let raf = 0
    const loop = () => {
      const t = performance.now() - started
      settledRef.current = items.map((it, r) => {
        const rowT = t - r * rowStagger - Math.max(0, it.label.length - it.value.length) * 12
        return Math.floor(rowT / speed) - 4
      })
      tick()
      if (t < items.length * rowStagger + total * speed + 400) raf = requestAnimationFrame(loop)
      else {
        settledRef.current = items.map((i) => i.value.length)
        tick()
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, reduce])

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--solari-panel))] font-mono text-[hsl(var(--solari-ink))] px-[clamp(16px,4vw,48px)] py-[clamp(32px,6vw,64px)]", className)}>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <MonoLabel className="text-[hsl(var(--solari))]">{eyebrow}</MonoLabel>
        {title && <span className="font-sans text-[11px] font-bold uppercase tracking-[0.22em] text-white/45">{title}</span>}
      </div>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {items.map((it, r) => (
          <li key={`${r}-${it.value}`} className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1 py-2.5 sm:grid-cols-[7ch_18ch_1fr_auto]">
            {it.zone && <span className="order-1 text-[13px] font-bold text-white/40">{it.zone}</span>}
            <span className="order-2 col-span-2 truncate text-[13px] font-bold uppercase tracking-[0.06em] text-white/80 sm:order-2 sm:col-span-1">
              {it.label}
              <span className="sr-only">: {it.value}</span>
            </span>
            <FlapWord value={it.value} settled={settledRef.current[r] ?? -1} tone={it.tone} aria-hidden className="order-4 col-span-2 justify-self-start sm:order-3 sm:col-span-1" />
            {it.note && <span className={cn("order-5 hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block", it.tone === "now" ? "text-[hsl(var(--solari))] animate-pulse" : "text-white/35")}>{it.note}</span>}
          </li>
        ))}
      </ul>
      <p className="sr-only">{items.map((i) => `${i.label}: ${i.value}${i.note ? ` (${i.note})` : ""}`).join(". ")}</p>
    </section>
  )
}

function FlapWord({ value, settled, tone, className }: { value: string; settled: number; tone?: DepartureItem["tone"]; className?: string }) {
  const chars = value.toUpperCase().split("")
  return (
    <span className={cn("flex gap-[3px]", className)} aria-hidden>
      {chars.map((ch, i) => {
        const done = i < settled
        const shown = done || ch === " " ? ch : rand()
        return (
          <span
            key={i}
            className={cn(
              "relative inline-block min-w-[1.35ch] rounded-[3px] bg-[#101014] px-[4px] py-[3px] text-center text-[15px] font-bold leading-[1.25] tabular-nums transition-colors",
              done ? (tone === "now" ? "text-[hsl(var(--solari))]" : "text-[hsl(var(--solari-ink))]") : "text-[hsl(var(--solari))]/70",
            )}
            style={{ transform: done ? undefined : `translateY(${i % 2 ? 0.5 : -0.5}px)` }}
          >
            {shown || "\u00A0"}
            {/* flap split hairline */}
            <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/60" />
          </span>
        )
      })}
    </span>
  )
}
