import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         FAQ minimal — plain rows that expand, no chevron chrome.
// ═══ EMOTION     Quiet, direct answers.
// ═══ SIGNATURE   A hairline list where rows fold open inline (no accordion primitive).

export type FaqMinimalItem = { id: string; question: string; answer?: React.ReactNode }

export type FaqMinimalProps = {
  eyebrow?: string
  title?: React.ReactNode
  items: FaqMinimalItem[]
  tone?: "paper" | "ink"
  className?: string
}

export function FaqMinimal({ eyebrow = "FAQ", title = "Quick answers.", items, tone = "paper", className }: FaqMinimalProps) {
  const ink = tone === "ink"
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id ?? null)
  return (
    <SectionShell tone={tone} width={760} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.06 }}>
        <div className={cn("mt-8 divide-y", ink ? "divide-background/15" : "divide-border")}>
          {items.map((q) => {
            const open = openId === q.id
            return (
              <div key={q.id}>
                <button type="button" onClick={() => setOpenId(open ? null : q.id)} aria-expanded={open} className="flex w-full items-baseline justify-between py-4 text-left">
                  <span className={cn("font-display text-base font-bold", ink ? "text-background" : "text-foreground")}>{q.question}</span>
                  <span className={cn("ml-4 font-mono text-sm", ink ? "text-background/50" : "text-muted-foreground")}>{open ? "–" : "+"}</span>
                </button>
                <div className={cn("overflow-hidden transition-[height] duration-300", open ? "max-h-40 pb-4" : "max-h-0")}>
                  <p className={cn("text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{q.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </InView>
    </SectionShell>
  )
}
