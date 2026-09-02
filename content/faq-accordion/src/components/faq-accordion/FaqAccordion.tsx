import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/primitives/accordion"

import { cn } from "@/lib/utils"

// ═══ JOB         FAQ accordion — collapsible questions with motion layout.
// ═══ EMOTION     Clear, unhurried answers.
// ═══ SIGNATURE   motion accordion with a rotating plus trigger.

export type FaqItem = { id: string; question: string; answer?: React.ReactNode }

export type FaqAccordionProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items?: FaqItem[]
  tone?: "paper" | "ink"
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_FAQ_ACCORDION_ITEMS = [ { id: "q1", question: "Is it token-first?", answer: "Yes. Every section reads the engine's token surface." }, { id: "q2", question: "Does it work with my framework?", answer: "Yes — each preset is a standalone package." }, { id: "q3", question: "Are animations accessible?", answer: "Reduced-motion collapses every effect to a plain state." }, ]


export function FaqAccordion({ eyebrow = "FAQ", title = "Questions, answered.", subtitle = "The things people ask before they start.", items = DEMO_FAQ_ACCORDION_ITEMS, tone = "paper", className }: FaqAccordionProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <Accordion
          className={cn("mt-10 divide-y", ink ? "divide-background/15 border-background/15" : "divide-border border-border border rounded-xl")}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {items.map((q) => (
            <AccordionItem key={q.id} value={q.id}>
              <AccordionTrigger className="group flex w-full items-center justify-between gap-4 p-5 text-left">
                <span className={cn("font-display text-base font-bold sm:text-lg", ink ? "text-background" : "text-foreground")}>{q.question}</span>
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-lg font-medium transition-transform group-data-[expanded]:rotate-45", ink ? "border-background/25 text-background" : "border-border text-foreground")}>+</span>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <p className={cn("text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{q.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </InView>
    
  </div>
</section>
  )
}
