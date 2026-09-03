import * as React from "react"
import { motion } from "motion/react"
import { Scissors } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

// ═══ JOB      present a running order with typographic authority
// ═══ EMOTION  the quiet pride of holding yesterday's programme
// ═══ SIGNATURE printed playbill furniture: folio rule, act ordinals, column
//               credits, and a perforated TICKET STUB footer that is the CTA
//   SITE     → venues, launches, conference agenda masthead band
//   APP      → itinerary screen (events app, tour planner) with stub as
//             "add to calendar"
//   A11Y     real lists/headings; stub is a real button; motion = quiet fades

export type ProgrammeAct = { no: number; title: string; time?: string; desc?: string; who?: string[] }

export type ProgrammeProps = {
  house: string
  season?: string
  acts: ProgrammeAct[]
  credits?: { role: string; name: string }[]
  stub?: { label: string; sub?: string; href?: string; onClick?: () => void }
  className?: string
}

export function Programme({ house, season, acts, credits, stub, className }: ProgrammeProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--paper))] px-4 py-20 text-[hsl(var(--playbill-ink))] sm:px-6 lg:px-8", className)}>
      <InView as="div" once variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.6 }}>
        <div className="mx-auto w-full max-w-[880px] border-y-4 border-double border-[hsl(var(--playbill-ink))]/60 py-8" style={{ borderColor: "currentColor" }}>
          <div className="flex items-baseline justify-between gap-6 border-b border-[hsl(var(--playbill-ink))]/25 pb-3">
            <h2 className="font-serif text-2xl font-black italic tracking-tight sm:text-3xl">{house}</h2>
            {season && <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{season}</p>}
          </div>
          <p className="mt-1 text-center font-mono text-[9px] font-bold uppercase tracking-[0.5em] opacity-50">Programme · Printed by the house</p>
        </div>
        <ol className="mx-auto mt-10 w-full max-w-[880px] space-y-8">
          {acts.map((a, i) => (
            <motion.li key={a.title} initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.05 }} className="grid gap-2 sm:grid-cols-[64px_1fr_auto] sm:items-start sm:gap-6">
              <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[hsl(var(--playbill-accent))]">Act {String(a.no).padStart(2, "0")}</span>
              <div>
                <h3 className="font-serif text-xl font-bold leading-tight sm:text-[22px]">{a.title}</h3>
                {a.desc && <p className="mt-1 text-[14px] leading-relaxed opacity-70">{a.desc}</p>}
                {a.who && <p className="mt-1.5 text-[12px] font-semibold italic opacity-60">{a.who.join(" · ")}</p>}
              </div>
              {a.time && <time className="font-mono text-[12px] font-bold tracking-[0.1em] tabular-nums opacity-60">{a.time}</time>}
            </motion.li>
          ))}
        </ol>
        {credits?.length ? (
          <div className="mx-auto mt-10 grid w-full max-w-[880px] gap-x-8 gap-y-1 border-t border-[hsl(var(--playbill-ink))]/30 pt-6 text-center font-serif text-[13px] sm:grid-cols-2">
            {credits.map((c) => (
              <p key={c.role} className="flex justify-between gap-3 py-0.5"><span className="[font-variant:small-caps] tracking-[0.08em] opacity-70">{c.role}</span><span className="font-semibold">{c.name}</span></p>
            ))}
          </div>
        ) : null}

        {/* perforated ticket-stub footer — the CTA */}
        {stub && (
          <div className="relative mx-auto mt-12 w-full max-w-[520px]">
            <div aria-hidden className="absolute inset-x-0 top-[-14px] flex justify-between">
              {[0, 1].map((s) => <span key={s} className={cn("size-7 -translate-y-1/2 rounded-full", s ? "-right-3.5" : "-left-3.5")} style={{ background: "hsl(var(--background)/transparent)" }} />)}
            </div>
            <Button
              type="button"
              onClick={stub.onClick}
              variant="outline"
              className="group relative h-auto w-full overflow-hidden border-[3px] border-dashed border-[hsl(var(--playbill-ink))]/50 bg-[hsl(var(--paper-deep))] px-6 py-4 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--playbill-accent))]"
            >
              <Scissors aria-hidden className="absolute -left-2 -top-3 size-4 rotate-90 opacity-40 transition-transform duration-500 group-hover:-translate-y-6 group-hover:rotate-[160deg]" />
              <span className="block font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[hsl(var(--playbill-accent))]">{stub.label}</span>
              {stub.sub && <span className="mt-1 block font-serif text-[15px] italic">{stub.sub}</span>}
            </Button>
            <span aria-hidden className="pointer-events-none absolute -bottom-2 left-1/2 h-px w-[92%] -translate-x-1/2 rotate-[0.4deg] border-b border-dotted border-[hsl(var(--playbill-ink))]/40" />
          </div>
        )}
      </InView>
    </section>
  )
}
