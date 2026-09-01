import * as React from "react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import SplitFlapText from "@/components/reactbits/SplitFlapText"

// ═══ JOB      make a headline feel like LIVE DATA (what's on / what's new)
// ═══ EMOTION  the hush of a departures hall — information as theatre
// ═══ SIGNATURE split-flap scramble: every char tumbles through the alphabet
//               and settles left→right — the flip engine is React Bits'
//               SplitFlapText (vendored registry piece, reduced-motion aware),
//               never a hand-rolled rAF simulation; rows arm in a wave (design),
//               the board layout and Solari tokens are ours
//   SITE  → program / specials / price board section
//   APP   → release feed, order queue, kiosk status header (pass new items)
//   A11Y  tiles aria-hidden; real text in an sr-only line; motion is on
//         mount/update only, never loops; reduced-motion settles instantly

export type DepartureItem = { zone?: string; label: string; value: string; note?: string; tone?: "default" | "now" | "off" }

export type DepartureBoardProps = {
  eyebrow?: string
  title?: React.ReactNode
  items: DepartureItem[]
  /** ms between rows arming their flip */
  rowStagger?: number
  className?: string
}

export function DepartureBoard({
  eyebrow = "LIVE BOARD",
  title,
  items,
  rowStagger = 160,
  className,
}: DepartureBoardProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const signature = items.map((i) => `${i.label}|${i.value}`).join(";")

  // row r arms after r * rowStagger — a one-shot wave, not an engine loop
  const [armed, setArmed] = React.useState<number[]>(reduce ? items.map((_, i) => i) : [])
  React.useEffect(() => {
    if (reduce) {
      setArmed(items.map((_, i) => i))
      return
    }
    const timers = items.map((_, i) => window.setTimeout(() => setArmed((a) => (a.includes(i) ? a : [...a, i])), 260 + i * rowStagger))
    return () => timers.forEach((t) => window.clearTimeout(t))
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
            <span className="order-4 col-span-2 justify-self-start sm:order-3 sm:col-span-1" aria-hidden>
              {armed.includes(r) && (
                <FlapWord value={it.value} tone={it.tone} />
              )}
            </span>
            {it.note && <span className={cn("order-5 hidden text-[10px] font-bold uppercase tracking-[0.18em] sm:block", it.tone === "now" ? "text-[hsl(var(--solari))] animate-pulse" : "text-white/35")}>{it.note}</span>}
          </li>
        ))}
      </ul>
      <p className="sr-only">{items.map((i) => `${i.label}: ${i.value}${i.note ? ` (${i.note})` : ""}`).join(". ")}</p>
    </section>
  )
}

function FlapWord({ value, tone }: { value: string; tone?: DepartureItem["tone"] }) {
  return (
    <SplitFlapText
      text={value.toUpperCase()}
      flipDuration={42}
      stagger={28}
      loop={false}
      charset="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:&./-"
      fontSize={15}
      tileRadius={3}
      gap="3px"
      tileColor="#101014"
      textColor={tone === "now" ? "hsl(var(--solari))" : "hsl(var(--solari-ink))"}
      className="w-fit"
    />
  )
}
