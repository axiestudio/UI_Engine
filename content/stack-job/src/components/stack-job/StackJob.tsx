import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// The layer components — head band, meta chips, text sections (repeat), base.
import { JobHead } from "./layers/JobHead"
import { JobMeta } from "./layers/JobMeta"
import { JobSection } from "./layers/JobSection"
import { JobBase } from "./layers/JobBase"

// ═══ JOB         Give the role a page worth working at.
// ═══ EMOTION     "I could see myself here" — concrete, honest, paid.
// ═══ SIGNATURE   The sections are the fillings: About / You'll / We offer
//                 slide in one per beat, each a component you can reorder or
//                 drop. Salary sits in the head band — nothing hidden.

export type StackJobProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  head?: { title: string; salary?: string; team?: string }
  meta?: { chips?: string[] }
  sections?: { heading: string; body: React.ReactNode }[]
  cta?: string
  deadline?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackJob({
  eyebrow = "STACK · JOB",
  title = "A role, told in layers.",
  subtitle = "Title band, meta chips, text sections and apply base are separate components — sections repeat like fillings, so the posting reads like you write, not like a template.",
  head = { title: "Front of house — the calm kind", salary: "42 000 – 51 000 kr / month", team: "The Floor Team" },
  meta = { chips: ["Jönköping", "Hybrid · 2 days remote", "Full time"] },
  sections = [
    {
      heading: "About the role",
      body: "You are the first face and the last handshake. You run the board, greet the walk-ins, and keep chair three on time without ever sounding like a clock.",
    },
    {
      heading: "You'll fit if",
      body: "You have two years in a busy salon, spa or shop floor. You'd rather fix the double-booking than explain it. You write like a human.",
    },
    {
      heading: "We offer",
      body: "A board that respects your lunch, a team that covers honestly, payroll on the 25th sharp — and a training budget you don't have to beg for.",
    },
  ],
  cta = "Apply for this role",
  deadline = "Applies by Oct 12",
  caption = "FOUR LAYER COMPONENTS · REPEATABLE SECTIONS",
  tone = "paper",
  className,
}: StackJobProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <div className="mx-auto max-w-[560px]">
            <div
              className={cn(
                "overflow-hidden rounded-[18px] border bg-card shadow-[0_26px_56px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <JobHead title={head.title} salary={head.salary} team={head.team} />
              <JobMeta chips={meta.chips} />

              <div>
                {sections.map((section, i) => (
                  <motion.div
                    key={section.heading}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.09 }}
                  >
                    <JobSection heading={section.heading}>{section.body}</JobSection>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              >
                <JobBase cta={cta} deadline={deadline} />
              </motion.div>
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[560px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
