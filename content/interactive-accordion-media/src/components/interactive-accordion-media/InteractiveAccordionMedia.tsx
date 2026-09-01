import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

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

const DEFAULT_ROWS = [
  { id: "a1", title: "Where the wood comes from", body: "Two sawmills, both within a day's drive. We visit.", src: "/showcase/content/content-05-workshop.webp" },
  { id: "a2", title: "How finishes are chosen", body: "Oiled first, lacquered only where hands land.", src: "/showcase/gallery-02.webp" },
  { id: "a3", title: "What we will not build", body: "Anything we couldn't stand behind in ten years.", src: "/showcase/content/content-03-product.webp" },
]
export function InteractiveAccordionMedia({ eyebrow = "KNOW", title = "Pick a chapter, see the frame.", rows = DEFAULT_ROWS, className }: InteractiveAccordionMediaProps) {
  const [openId, setOpenId] = React.useState(rows[0]?.id ?? "")
  const active = rows.find((r) => r.id === openId) ?? rows[0]
  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", false ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="divide-y">
          {rows.map((r, i) => {
            const open = r.id === openId
            return (
              <Button type="button" key={r.id} onClick={() => setOpenId(r.id)} variant="default" className={block w-full py-4 text-left}>
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className={cn("font-display text-xl font-bold sm:text-2xl", open ? "text-foreground" : "text-muted-foreground")}>{r.title}</span>
                  </span>
                  <span className={cn("font-mono text-xl transition-transform", open ? "rotate-45 text-foreground" : "text-muted-foreground")}>+</span>
                </div>
                {open && r.body && <p className="mt-3 pl-8 text-sm font-medium leading-relaxed text-muted-foreground">{r.body}</p>}
              
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
    
  </div>
</section>
  )
}
