import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// The layer components — head, meta band, agenda rows (repeat freely), base.
import { EventHead } from "./layers/EventHead"
import { EventMeta } from "./layers/EventMeta"
import { EventTalk } from "./layers/EventTalk"
import { EventBase } from "./layers/EventBase"

// ═══ JOB         Make one evening impossible to skip.
// ═══ EMOTION     "Save the date" energy — concrete, close, countable.
// ═══ SIGNATURE   The agenda is the filling: each talk row slides in on its
//                 own beat, and the RSVP base confirms into primary ink when
//                 you commit. Head, meta, talks and base are separate imports.

export type EventTalkDef = { at?: string; title: string; speaker?: string }

export type StackEventProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  head?: { day?: string; month?: string; title: string; kind?: string }
  meta?: { venue?: string; time?: string; seats?: string }
  talks?: EventTalkDef[]
  cta?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackEvent({
  eyebrow = "STACK · EVENT",
  title = "An evening, stacked.",
  subtitle = "Date band, venue meta, agenda rows and RSVP base are separate components — the talks repeat like fillings. Commit and the base confirms.",
  head = { day: "24", month: "SEP", title: "The Board Session — live teardown", kind: "Evening talk" },
  meta = { venue: "South House, Studio Floor", time: "18:00 – 21:00", seats: "40 seats" },
  talks = [
    { at: "18:15", title: "Why paper diaries still win on trust", speaker: "Klara Lindqvist" },
    { at: "19:00", title: "The board rebuild — a live teardown", speaker: "Oskar Berg" },
    { at: "19:45", title: "Open chair: your worst no-show story", speaker: "Floor mic" },
  ],
  cta = "Save my seat",
  caption = "FOUR LAYER COMPONENTS · REPEATABLE AGENDA",
  tone = "paper",
  className,
}: StackEventProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const [confirmed, setConfirmed] = React.useState(false)

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
          <div className="mx-auto max-w-[520px]">
            <div
              className={cn(
                "overflow-hidden rounded-[18px] border bg-card shadow-[0_26px_56px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <EventHead day={head.day} month={head.month} title={head.title} kind={head.kind} />
              <EventMeta venue={meta.venue} time={meta.time} seats={meta.seats} />

              {/* agenda — the repeatable fillings */}
              <div role="list" aria-label="Agenda">
                {talks.map((talk, i) => (
                  <motion.div
                    key={talk.title}
                    role="listitem"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.09 }}
                  >
                    <EventTalk at={talk.at} title={talk.title} speaker={talk.speaker} />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              >
                <EventBase cta={cta} confirmed={confirmed} onRsvp={() => setConfirmed(true)} />
              </motion.div>
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[520px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
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
