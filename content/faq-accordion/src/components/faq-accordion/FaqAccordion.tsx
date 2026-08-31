import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/primitives/accordion"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         FAQ accordion — collapsible questions with motion layout.
// ═══ EMOTION     Clear, unhurried answers.
// ═══ SIGNATURE   motion accordion with a rotating plus trigger.

export type FaqItem = { id: string; question: string; answer?: React.ReactNode }

export type FaqAccordionProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items: FaqItem[]
  tone?: "paper" | "ink"
  className?: string
}

export function FaqAccordion({ eyebrow = "FAQ", title = "Questions, answered.", subtitle = "The things people ask before they start.", items, tone = "paper", className }: FaqAccordionProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
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
    </SectionShell>
  )
}
