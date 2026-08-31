import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
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
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
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
    </SectionShell>
  )
}
