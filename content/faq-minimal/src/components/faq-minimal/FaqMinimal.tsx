import * as React from "react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         FAQ minimal — plain rows that expand, no chevron chrome.
// ═══ EMOTION     Quiet, direct answers.
// ═══ SIGNATURE   A hairline list where rows fold open inline (no accordion primitive).

export type FaqMinimalItem = { id: string; question: string; answer?: React.ReactNode }

export type FaqMinimalProps = {
  eyebrow?: string
  title?: React.ReactNode
  items?: FaqMinimalItem[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_FAQ_MINIMAL_ITEMS = [{id:"q1",question:"Is it token-first?",answer:"Yes."},{id:"q2",question:"Does it re-theme?",answer:"Yep."}]


export function FaqMinimal({ eyebrow = "FAQ", title = "Quick answers.", items = DEMO_FAQ_MINIMAL_ITEMS, tone = "paper", className }: FaqMinimalProps) {
  const ink = tone === "ink"
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id ?? null)
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (760), ["--shell-w" as string]: `${(760)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className={cn("mt-8 divide-y", ink ? "divide-background/15" : "divide-border")}>
          {items.map((q) => {
            const open = openId === q.id
            return (
              <div key={q.id}>
                <Button type='button' onClick={() => setOpenId(open ? null : q.id)} aria-expanded={open} className="flex h-auto w-full items-baseline justify-between py-4 text-left" variant="default">
                  <span className={cn("font-display text-base font-bold", ink ? "text-background" : "text-foreground")}>{q.question}</span>
                  <span className={cn("ml-4 font-mono text-sm", ink ? "text-background/50" : "text-muted-foreground")}>{open ? "–" : "+"}</span>
                </Button>
                <div className={cn("overflow-hidden transition-[height] duration-300", open ? "max-h-40 pb-4" : "max-h-0")}>
                  <p className={cn("text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{q.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </InView>
    
  </div>
</section>
  )
}
