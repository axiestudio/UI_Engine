import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Accordion media — large accordion rows with a synced media panel.
// ═══ EMOTION     Editorial rhythm with a visual reward.
// ═══ SIGNATURE   Big rows; the open one drives a media panel on the right.

export type AccMediaRow = { id: string; title: string; body?: string; src?: string }

export type InteractiveAccordionMediaProps = {
  eyebrow?: string
  title?: React.ReactNode
  rows: AccMediaRow[]
  className?: string
}

export function InteractiveAccordionMedia({ eyebrow = "KNOW", title = "Pick a chapter, see the frame.", rows, className }: InteractiveAccordionMediaProps) {
  const [openId, setOpenId] = React.useState(rows[0]?.id ?? "")
  const active = rows.find((r) => r.id === openId) ?? rows[0]
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="divide-y">
          {rows.map((r, i) => {
            const open = r.id === openId
            return (
              <button key={r.id} type="button" onClick={() => setOpenId(r.id)} className="block w-full py-4 text-left">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("font-display text-xl font-bold sm:text-2xl", open ? "text-foreground" : "text-muted-foreground")}>{r.title}</span>
                  </span>
                  <span className={cn("font-mono text-xl transition-transform", open ? "rotate-45 text-foreground" : "text-muted-foreground")}>+</span>
                </div>
                {open && r.body && <p className="mt-3 pl-8 text-sm font-medium leading-relaxed text-muted-foreground">{r.body}</p>}
              </button>
            )
          })}
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted">
          {rows.map((r) => (
            <motion.img key={r.id} src={r.src} alt={r.title}
              className="absolute inset-0 h-full w-full object-cover"
              initial={false} animate={{ opacity: r.id === openId ? 1 : 0, scale: r.id === openId ? 1 : 1.08 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
          ))}
          {active && <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{active.title}</span>}
        </div>
      </div>
    </SectionShell>
  )
}
