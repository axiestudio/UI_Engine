import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


export type CohortWavesProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  cohorts?: string[]
  weeks?: number
  retention?: number[][]
  className?: string
}

const DEFAULT_COHORTS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"]
const DEFAULT_RETENTION = [
  [100, 64, 52, 47, 44, 42],
  [100, 68, 55, 50, 47, 0],
  [100, 71, 58, 53, 0, 0],
  [100, 66, 54, 0, 0, 0],
  [100, 74, 61, 0, 0, 0],
  [100, 70, 0, 0, 0, 0],
]

export function CohortWaves({
  eyebrow = "RETENTION · COHORT WAVES",
  title = "Cohort retention",
  subtitle = "Months are rows, weeks are columns. Darker stays longer.",
  cohorts = DEFAULT_COHORTS,
  weeks = 6,
  retention = DEFAULT_RETENTION,
  className,
}: CohortWavesProps) {
  const [hover, setHover] = React.useState<{ c: number; w: number } | null>(null)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
          <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="font-mono text-[11px] font-medium text-muted-foreground">Retention</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-6 rounded-sm border bg-foreground/10" />
            <span className="h-2 w-6 rounded-sm bg-foreground/35" />
            <span className="h-2 w-6 rounded-sm bg-foreground/75" />
          </span>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">0 → 100%</span>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0" onMouseLeave={() => setHover(null)}>
            <caption className="sr-only">Retention percentage by signup month and week since signup</caption>
            <thead>
              <tr className="bg-muted/40">
                <th scope="col" className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Cohort
                </th>
                {Array.from({ length: weeks }, (_, w) => (
                  <th
                    key={w}
                    scope="col"
                    className={cn(
                      "px-2 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
                      hover?.w === w ? "bg-foreground text-background" : "text-muted-foreground",
                    )}
                  >
                    W{w}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {cohorts.map((c, ci) => (
                <tr key={c} className={cn(hover?.c === ci && "bg-muted/30")}>
                  <th
                    scope="row"
                    className={cn(
                      "sticky left-0 z-10 whitespace-nowrap px-4 py-2 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors",
                      hover?.c === ci ? "bg-foreground text-background" : "bg-card text-muted-foreground",
                    )}
                  >
                    {c} ’26
                  </th>
                  {Array.from({ length: weeks }, (_, w) => {
                    const v = retention[ci]?.[w] ?? 0
                    const empty = v === 0
                    const isRow = hover?.c === ci
                    const isCol = hover?.w === w
                    const exact = hover?.c === ci && hover?.w === w
                    return (
                      <td key={w} className="p-1">
                        <Button type='button' aria-label={`${c} cohort, week ${w}: ${empty ? "no data" : `${v}% retained`}`} onMouseEnter={() => setHover({ c: ci, w })} onFocus={() => setHover({ c: ci, w })} style={
                            !empty
                              ? {
                                  backgroundColor: `hsl(var(--foreground) / ${exact ? 0.88 : isRow || isCol ? 0.22 + (v / 100) * 0.65 : 0.06 + (v / 100) * 0.42})`,
                                }
                              : undefined
                          } className={cn(
                            "relative flex h-9 w-full min-w-14 items-center justify-center rounded-md font-mono text-[11px] font-semibold tabular-nums ring-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                            empty
                              ? "border border-dashed border-border bg-transparent text-muted-foreground/30"
                              : exact
                                ? "text-background ring-2 ring-foreground ring-offset-1"
                                : isRow || isCol
                                  ? "text-background"
                                  : "text-foreground",
                          )} variant="default">
                          {empty ? "—" : `${v}%`}
                        </Button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2.5">
          <p aria-live="polite" className="font-mono text-[11px] font-medium tracking-wide text-muted-foreground">
            {hover ? `${cohorts[hover.c]} cohort · week ${hover.w} · ${retention[hover.c]?.[hover.w] ? `${retention[hover.c][hover.w]}% retained` : "no data"}` : "Hover or focus a cell to cross-highlight its cohort and week"}
          </p>
          <span className="hidden font-mono text-[11px] tabular-nums text-muted-foreground sm:block">{cohorts.length} × {weeks} cohorts</span>
        </div>
      </div>
    
  </div>
</section>
  )
}
