import * as React from "react"
import { motion, useMotionValue } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

export type DocSection = { id: string; label: string; body: [string, string] }

export type DocOutlineReaderProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  caption?: string
  tone?: "paper" | "ink"
  sections?: DocSection[]
  className?: string
}

const DEFAULT_SECTIONS: DocSection[] = [
  {
    id: "chairs",
    label: "Start with the chairs",
    body: [
      "A board is only as honest as the chairs it represents. At Quiet Times Studio we draw one column per chair — not per stylist — because a chair can be double-booked, a stylist cannot. Write the chair number in pencil first; pairs shift around more than people admit.",
      "Give every chair a fixed rhythm: cut, colour, wash, pause. When a chair's rhythm is visible from across the room, anyone can cover the front desk and still answer the only question that matters — who is free, and when.",
    ],
  },
  {
    id: "huddle",
    label: "The morning huddle",
    body: [
      "Ten minutes before the doors open, the whole floor gathers at the board. Yesterday's leftovers get a home first: the re-book, the waiting client, the colour that still needs a skin test. Nothing moves to tomorrow until it has a chair and a time.",
      "Keep the huddle standing. The moment chairs appear, the meeting doubles in length. One person reads the day aloud, top to bottom; two people correct. By the second read the day is already patched.",
    ],
  },
  {
    id: "colour",
    label: "Colour the day",
    body: [
      "Assign one colour to each kind of time: booked, blocking, and breathing room. Blocking time is the one studios skip — the ten minutes after a colour for the rinse, the fifteen before a wedding party. Put it on the board in the same ink as the booking.",
      "If the board needs a legend to read, it has too many colours. Three is the ceiling. A visiting stylist should understand the whole day in one glance, without asking a single question.",
    ],
  },
  {
    id: "walkins",
    label: "Room for walk-ins",
    body: [
      "Hold one chair loose every hour — the walk-in slot. It feels expensive on a busy Saturday, but it is the cheapest advertising the studio owns: a stranger who gets a chair within twenty minutes comes back with a story.",
      "Mark the held slot on the board like any other booking, with a question mark instead of a name. If the hour passes empty, erase it without ceremony; the slot did its job simply by existing.",
    ],
  },
  {
    id: "friday",
    label: "The Friday close-out",
    body: [
      "Friday afternoon, the board gets read backwards: what sold, what slipped, which chair ran hot and which ran cold. The numbers go into the ledger in kr, never in percentages — the team argues with kronor, never with percentages.",
      "End by writing next week's one fix on a sticky note and parking it on the board's top rail. One fix a week is fifty-two improvements a year; the board remembers even when the week forgets.",
    ],
  },
]

export function DocOutlineReader({
  eyebrow = "Field guide · No. 04",
  title = "Running the salon board.",
  subtitle = "How Quiet Times Studio keeps six chairs honest with one board, a ten-minute huddle, and a Friday ledger.",
  caption = "Quiet Times Studio · Jönköping",
  tone = "paper",
  sections = DEFAULT_SECTIONS,
  className,
}: DocOutlineReaderProps) {
  const idPrefix = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const idFor = (id: string) => `${idPrefix}-${id}`
  const [active, setActive] = React.useState<string | undefined>(() => (sections[0] ? idFor(sections[0].id) : undefined))
  const articleRef = React.useRef<HTMLDivElement>(null)
  const progress = useMotionValue(0)

  React.useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(idFor(s.id)))
      .filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [sections, idPrefix])

  React.useEffect(() => {
    const onScroll = () => {
      const el = articleRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = Math.max(el.offsetHeight - window.innerHeight, 1)
      progress.set(Math.min(Math.max(-rect.top / total, 0), 1))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [progress])

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={cn(className)}>
      <div aria-hidden className="sticky top-0 z-30 -mx-4 h-[3px] bg-border sm:-mx-6 lg:-mx-8">
        <motion.div className="h-full origin-left bg-primary" style={{ scaleX: progress }} />
      </div>

      <InView>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
        <nav aria-label="Sections" className="lg:hidden">
          <ul className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            {sections.map((s) => {
              const isActive = idFor(s.id) === active
              return (
                <li key={s.id}>
                  <a
                    href={`#${idFor(s.id)}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive ? "border-transparent bg-foreground text-background" : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <MonoLabel className="text-muted-foreground">On this page</MonoLabel>
            <ul className="mt-4">
              {sections.map((s, i) => {
                const isActive = idFor(s.id) === active
                return (
                  <li key={s.id}>
                    <a
                      href={`#${idFor(s.id)}`}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "flex items-baseline gap-2 border-l-2 py-2 pl-4 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive ? "border-primary font-bold text-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                      )}
                    >
                      <span className="font-mono text-[10px] font-bold tabular-nums opacity-60">{String(i + 1).padStart(2, "0")}</span>
                      {s.label}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        <div ref={articleRef} className="min-w-0">
          <article className="max-w-[62ch]">
            {sections.map((s) => (
              <section key={s.id} id={idFor(s.id)} className="scroll-mt-28 border-b border-border py-8 first:pt-0 last:border-b-0 last:pb-0">
                <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{s.label}</h3>
                <p className="mt-4 text-[15px] font-medium leading-[1.8] text-muted-foreground">{s.body[0]}</p>
                <p className="mt-4 text-[15px] font-medium leading-[1.8] text-muted-foreground">{s.body[1]}</p>
              </section>
            ))}
          </article>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </SectionShell>
  )
}
