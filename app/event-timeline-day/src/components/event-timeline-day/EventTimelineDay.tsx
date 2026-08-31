import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — activity feeds with day gravity.
// JOB      scan what happened across days without infinite scrolling guilt
// SIGNATURE rail stitches day groups (stitched `— · —— ·` hairline with day
//           medallions); each event CARD slides in on view with left accent by
//           kind; hovering lifts the card, holds the rail dot.
// API      events [{id, at, actor?, kind, text}] — groupByDay done for you.
// A11Y     ol[aria-label] + time elements; kinds announced in text.

export type TimelineEvent = { id: string; at: string | number | Date; actor?: string; kind: "create" | "edit" | "comment" | "alert" | "deploy"; text: string }
export type EventTimelineDayProps = { events: TimelineEvent[]; groupBy?: (e: TimelineEvent) => string; className?: string }

const KIND_COLOR: Record<TimelineEvent["kind"], string> = { create: "hsl(var(--ok))", edit: "hsl(var(--info))", comment: "hsl(var(--pinned))", alert: "hsl(var(--err))", deploy: "hsl(var(--warn))" }

const dayKey = (at: TimelineEvent["at"]) => { const d = new Date(at); return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) }
const defaultGroup = (e: TimelineEvent) => dayKey(e.at)

export function EventTimelineDay({ events, groupBy = defaultGroup, className }: EventTimelineDayProps) {
  const groups: [string, TimelineEvent[]][] = []
  for (const e of [...events].sort((a, b) => +new Date(b.at) - +new Date(a.at))) {
    const k = groupBy(e)
    const g = groups.find((x) => x[0] === k)
    g ? g[1].push(e) : groups.push([k, [e]])
  }
  return (
    <ol className={cn("space-y-7 font-sans", className)} aria-label="Activity timeline">
      {groups.map(([day, evs]) => (
        <li key={day}>
          <div className="mb-3 flex items-center gap-3">
            <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full border bg-background text-xs font-semibold text-muted-foreground">{evs.length}</span>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</p>
            <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-border via-border/40 to-transparent" />
          </div>
          <ul className="relative ml-[13px] space-y-2 border-l-2 border-dashed border-border pl-4">
            {evs.map((e, i) => (
              <motion.li key={e.id} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-20px" }} transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }} className="group relative">
                <span aria-hidden className="absolute -left-[22px] top-3.5 size-2.5 rounded-full border-2 border-background transition-transform group-hover:scale-125" style={{ background: KIND_COLOR[e.kind] }} />
                <div className="rounded-lg border bg-card px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow group-hover:shadow-md">
                  <p className="text-[13px] font-medium leading-snug">
                    {e.actor && <strong className="font-semibold">{e.actor} </strong>}<span className="rounded px-1 font-mono text-[10px] font-medium uppercase tracking-wide" style={{ color: KIND_COLOR[e.kind], background: `color-mix(in srgb, ${KIND_COLOR[e.kind]} 12%, transparent)` }}>{e.kind}</span> {e.text}
                  </p>
                  <time className="mt-1 block font-mono text-[11px] text-muted-foreground" dateTime={new Date(e.at).toISOString()}>{new Date(e.at).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
              </motion.li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  )
}
