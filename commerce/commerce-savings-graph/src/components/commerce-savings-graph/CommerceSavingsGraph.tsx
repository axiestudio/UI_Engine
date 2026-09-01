import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { BarChart } from "@/components/charts/bar-chart"
import { Bar } from "@/components/charts/bar"
import { BarXAxis } from "@/components/charts/bar-x-axis"
import { BarYAxis } from "@/components/charts/bar-y-axis"
import { Grid } from "@/components/charts/grid"
import { ChartTooltip } from "@/components/charts/tooltip"

// ═══ JOB         Savings graph — an animated bar chart of cost savings over time.
// ═══ EMOTION     See the value.
// ═══ SIGNATURE   A Bklit bar chart that grows into view — scales, axes,
//                 hover physics and the reveal animation belong to the vendored
//                 chart system; which figure gets the highlighted base case is ours.

export type SavingBar = { id: string; label: string; value: number; highlight?: boolean }

export type CommerceSavingsGraphProps = {
  eyebrow?: string
  title?: React.ReactNode
  bars: SavingBar[]
  caption?: string
  className?: string
}

const DEFAULT_BARS = [
  { id: "b1", label: "Jan", value: 42 },
  { id: "b2", label: "Feb", value: 58 },
  { id: "b3", label: "Mar", value: 51 },
  { id: "b4", label: "Apr", value: 74, highlight: true },
  { id: "b5", label: "May", value: 69 },
  { id: "b6", label: "Jun", value: 88 },
]

type Datum = { label: string; standard: number | null; featured: number | null }

export function CommerceSavingsGraph({ eyebrow = "SAVE", title = "The math adds up.", bars = DEFAULT_BARS, caption = "Monthly savings · thousands", className }: CommerceSavingsGraphProps) {
  const data: Datum[] = bars.map((b) => ({
    label: b.label,
    standard: b.highlight ? null : b.value,
    featured: b.highlight ? b.value : null,
  }))
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className="mt-10 rounded-2xl border p-6" role="figure" aria-label={caption || "Savings per month"}>
          <BarChart data={data} xDataKey="label" aspectRatio="16 / 7" barGap={0.45}>
            <Grid horizontal />
            <Bar dataKey="standard" fill="var(--chart-line-secondary)" lineCap={6} />
            <Bar dataKey="featured" fill="var(--chart-line-primary)" lineCap={6} />
            <BarXAxis />
            <BarYAxis />
            <ChartTooltip />
          </BarChart>
        </div>
        {caption && <p className="mt-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{caption}</p>}
      </InView>
    </SectionShell>
  )
}
