import * as React from "react"
import { motion } from "motion/react"
import { ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type SpecRow = { term: string; value: string; hint?: string }

export type SpecGroup = { id: string; label: string; summary: string; rows: SpecRow[] }

export type SpecSheetProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  caption?: string
  tone?: "paper" | "ink"
  groups?: SpecGroup[]
  className?: string
}

const DEFAULT_GROUPS: SpecGroup[] = [
  {
    id: "light",
    label: "Light",
    summary: "390 lm · 2700 K · CRI 96",
    rows: [
      { term: "Flux", value: "390 lm", hint: "lumens" },
      { term: "Colour temperature", value: "2700 K", hint: "kelvin" },
      { term: "Colour rendering", value: "CRI 96" },
    ],
  },
  {
    id: "body",
    label: "Body",
    summary: "oak + steel · 1.4 kg",
    rows: [
      { term: "Materials", value: "oak + steel" },
      { term: "Weight", value: "1.4 kg" },
    ],
  },
  {
    id: "power",
    label: "Power",
    summary: "USB-C · 8 W",
    rows: [
      { term: "Connector", value: "USB-C" },
      { term: "Draw", value: "8 W" },
    ],
  },
  {
    id: "care",
    label: "Care",
    summary: "2 yr warranty",
    rows: [
      { term: "Warranty", value: "2 years, parts + labour" },
      { term: "Spares", value: "LED module replaceable" },
    ],
  },
]

export function SpecSheet({
  eyebrow = "Spec sheet · mk II",
  title = (
    <>
      The Reading Lamp, <em className={cn("font-serif italic font-medium tracking-normal")} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>mk II.</em>
    </>
  ),
  subtitle = "Four groups, one reading corner. The second revision: warmer light, less weight, USB-C. Hover the info marks for units.",
  caption = "Quiet Times Studio · Jönköping",
  tone = "paper",
  groups = DEFAULT_GROUPS,
  className,
}: SpecSheetProps) {
  const [open, setOpen] = React.useState<Record<string, boolean>>(() => Object.fromEntries(groups.map((g) => [g.id, true])))
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const toggleGroup = (id: string) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", cn(className))}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView once className="mt-10">
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {groups.map((g, gi) => {
            const isOpen = open[g.id] ?? true
            return (
              <div key={g.id} className="border-b border-border last:border-b-0">
                <h3>
                  <Button type="button" aria expanded={isOpen} controls={`spec-${g.id}`} onClick={() => toggleGroup(g.id)} variant="default" className={flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset}>
                    <span className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.2em] opacity-60", "text-muted-foreground")}>gi + 1<span aria-hidden> /</span></span>
                    <span className="min-w-0 flex-1 truncate font-display text-lg font-bold tracking-tight text-foreground">{g.label}</span>
                    <span className={cn("hidden font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground transition-opacity duration-200 sm:inline", isOpen && "opacity-0")}>
                      {g.summary}
                    </span>
                    <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
                  
                </h3>
                <motion.div
                  id={`spec-${g.id}`}
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0 }}
                  transition={reduce ? { duration: 0 } : { duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <dl className="border-t border-border px-5 py-2">
                    {g.rows.map((r) => (
                      <div key={r.term} className="flex items-baseline gap-3 py-2.5">
                        <dt className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                          {r.term}
                          {r.hint && (
                            <Button type="button" title={r.hint} aria label={`${r.term} is measured in ${r.hint}`} variant="default" className={grid size-4 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring}>
                              <Info className="size-3" aria-hidden />
                            
                          )}
                        </dt>
                        <span aria-hidden className="mx-1 flex-1 -translate-y-1 border-b border-dotted border-border" />
                        <dd className="text-sm font-medium text-foreground">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </div>
            )
          })}
        </div>
      </InView>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    
  </div>
</section>
  )
}
