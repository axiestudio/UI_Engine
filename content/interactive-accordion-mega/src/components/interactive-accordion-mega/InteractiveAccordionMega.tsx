import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Mega accordion — large expandable rows with inline media.
// ═══ EMOTION     Editorial + a media reward.
// ═══ SIGNATURE   Big rows that expand to reveal an image + copy; open row auto-collapses.

export type MegaRow = { id: string; title: string; body?: string; src?: string; meta?: string }

export type InteractiveAccordionMegaProps = {
  eyebrow?: string
  title?: React.ReactNode
  rows: MegaRow[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ROWS = [
  { id: "m1", title: "Design", body: "Drawn full-scale before anything is cut.", src: "/showcase/content/content-04-architecture.webp", meta: "chapter 01" },
  { id: "m2", title: "Build", body: "One maker per piece, start to finish.", src: "/showcase/content/content-05-workshop.webp", meta: "chapter 02" },
  { id: "m3", title: "Care", body: "Annual check-up included, forever.", src: "/showcase/gallery-06.webp", meta: "chapter 03" },
]
export function InteractiveAccordionMega({ eyebrow = "MEGA", title = "Rows worth opening.", rows = DEFAULT_ROWS, tone = "paper", className }: InteractiveAccordionMegaProps) {
  const ink = tone === "ink"
  const [openId, setOpenId] = React.useState<string | null>(rows[0]?.id ?? null)
  const active = rows.find((r) => r.id === openId)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className="mt-10 space-y-3">
          {rows.map((r) => {
            const open = r.id === openId
            return (
              <div key={r.id} className={cn("overflow-hidden rounded-xl border transition-colors", open && (ink ? "border-background/30 bg-background/5" : "border-foreground bg-card"))}>
                <button type="button" onClick={() => setOpenId(open ? null : r.id)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 p-6 text-left">
                  <div className="flex items-baseline gap-4">
                    <span className={cn("font-mono text-[11px] font-bold tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground")}>{r.meta ?? "0" + (rows.indexOf(r) + 1)}</span>
                    <h3 className="font-display text-2xl font-bold sm:text-3xl">{r.title}</h3>
                  </div>
                  <span className={cn("shrink-0 font-mono text-xl", open ? "rotate-45" : "", ink ? "text-background/60" : "text-muted-foreground")}>+</span>
                </button>
                <div className={cn("grid transition-[grid-template-rows] duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <div className="grid gap-4 px-6 pb-6 sm:grid-cols-[1fr_auto]">
                      {r.body && <p className={cn("max-w-lg text-sm font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{r.body}</p>}
                      {r.src && <img src={r.src} alt="" className="aspect-[16/9] w-full max-w-[220px] rounded-xl object-cover" loading="lazy" />}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          {active && null}
        </div>
      </InView>
    
  </div>
</section>
  )
}
