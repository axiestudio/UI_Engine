import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Download, ArrowUpRight, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

import { SlidingNumber } from "@/components/primitives/sliding-number"
import { Button } from "@/components/ui/button"

export type ReportStat = { value: number; suffix?: string; label: string }

export type ReportUnfoldProps = {
  eyebrow?: string
  year?: string
  title?: string
  subtitle?: string
  stats?: ReportStat[]
  hrefPdf?: string
  hrefWeb?: string
  className?: string
}

const DEFAULT_STATS: ReportStat[] = [
  { value: 48, suffix: "%", label: "YoY revenue growth" },
  { value: 12, suffix: "k", label: "Teams onboarded" },
  { value: 97, suffix: "%", label: "Renewal rate" },
]

export function ReportUnfold({
  eyebrow,
  year = "2026",
  title = "The Honest Ledger",
  subtitle = "Highlights from the full 32-page report. Open the cover to see the numbers.",
  stats = DEFAULT_STATS,
  hrefPdf = "#",
  hrefWeb = "#",
  className,
}: ReportUnfoldProps) {
  const [open, setOpen] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const labelEyebrow = eyebrow ?? `ANNUAL REPORT · ${year}`

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <div className="mx-auto max-w-2xl text-center">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "justify-center text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{labelEyebrow}</span>
        <h2 className="mt-3 font-display text-[28px] font-semibold leading-[1.05] tracking-[-0.022em] text-foreground sm:text-[34px]">{title}</h2>
        <p className="mx-auto mt-2 max-w-[46ch] text-[13px] leading-6 text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative mx-auto mt-8 max-w-[640px]">
        {/* cover */}
        <AnimatePresence initial={false}>
          {!open ? (
            <motion.div
              key="cover"
              initial={reduce ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-xl border bg-foreground p-6 text-background shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-md border border-background/15 bg-background/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-background/80">
                  Confidential · v1
                </span>
                <FileText className="size-4 text-background/40" aria-hidden />
              </div>

              <div className="mt-10">
                <span className="font-display text-[56px] font-semibold leading-none tracking-[-0.04em] sm:text-[68px]">{year}</span>
                <span className="mt-2 block font-display text-[18px] font-medium italic tracking-[-0.01em] text-background/80">{title}</span>
                <span className="mt-1 block font-mono text-[11px] font-medium tracking-wide text-background/55">32 pages · audited</span>
              </div>

              <Button type='button' onClick={() => setOpen(true)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background focus-visible:ring-offset-2 focus-visible:ring-offset-foreground" variant="default">
                Open the report <ArrowUpRight className="size-3.5" aria-hidden />
              </Button>

              <p className="mt-4 font-mono text-[11px] font-medium tracking-wide text-background/45">Tap to reveal highlights — no scroll trick, works with keyboard.</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* inside spread — always in DOM for a11y, but hidden when cover present via AnimatePresence? Keep separate */}
        <motion.div
          key="inside"
          initial={false}
          animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className={cn("rounded-xl border bg-card p-6 shadow-sm sm:p-8", !open && "pointer-events-none absolute inset-0 -z-10 opacity-0")}
          aria-hidden={!open}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-display text-[18px] font-semibold tracking-[-0.015em] text-foreground">{title} · {year}</span>
            <span className="rounded-md border bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">32 pages</span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={reduce ? undefined : { opacity: 0, y: 8 }}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.35, delay: open ? 0.08 + i * 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-xl border bg-muted/30 p-4"
              >
                <span className="flex items-baseline gap-1 font-display text-[28px] font-semibold tabular-nums leading-none tracking-[-0.02em] text-foreground">
                  <SlidingNumber value={s.value} />
                  <span className="text-[16px] font-medium text-muted-foreground">{s.suffix}</span>
                </span>
                <p className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href={hrefPdf} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-background shadow-sm transition-colors hover:bg-foreground/90">
              <Download className="size-3.5" aria-hidden /> PDF · 4.2 MB
            </a>
            <a href={hrefWeb} className="group inline-flex items-center gap-1.5 rounded-full border bg-background px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm transition-colors hover:bg-muted">
              Web version <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </a>
            <Button type='button' onClick={() => setOpen(false)} className="ml-auto rounded-full border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:bg-muted" variant="default">
              Back to cover
            </Button>
          </div>
        </motion.div>
      </div>

      {!open ? (
        <p className="mt-4 text-center font-mono text-[11px] font-medium tracking-wide text-muted-foreground">A button — not a scroll trap. Works the same on mobile and with reduced-motion.</p>
      ) : null}
    
  </div>
</section>
  )
}
