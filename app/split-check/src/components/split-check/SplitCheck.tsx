import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB         Settle the bill at the counter — who owes what, no maths.
// ═══ EMOTION     The fairness of a napkin sketch, without the napkin.
// ═══ SIGNATURE   Every item carries a who-chip of initials: tap it and the
//                 charge cycles through the table, and the mono split rows
//                 re-tally live while the layout glides to its new truth.

export type SplitPerson = { id: string; name: string }
export type SplitItem = { id: string; name: string; amount: number; who: string | null }

export type SplitCheckProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  heading?: string
  people?: SplitPerson[]
  items?: SplitItem[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_PEOPLE: SplitPerson[] = [
  { id: "klara", name: "Klara" },
  { id: "oskar", name: "Oskar" },
  { id: "elin", name: "Elin" },
]

const DEFAULT_ITEMS: SplitItem[] = [
  { id: "cut", name: "Cut & finish", amount: 690, who: "klara" },
  { id: "beard", name: "Beard trim", amount: 320, who: "oskar" },
  { id: "gloss", name: "Toner + gloss", amount: 340, who: "elin" },
]

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?"

export function SplitCheck({
  eyebrow = "APP · SPLIT CHECK",
  title = "Who owes what?",
  subtitle = "Add the table, then tap the initials chip on any item to cycle who is charged. Totals re-tally live — uneven splits welcome, napkins optional.",
  heading = "Quiet Times Studio · front desk",
  people: initialPeople = DEFAULT_PEOPLE,
  items: initialItems = DEFAULT_ITEMS,
  caption = "TAP A CHIP TO REASSIGN · TOTALS FOLLOW LIVE",
  tone = "paper",
  className,
}: SplitCheckProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [people, setPeople] = React.useState<SplitPerson[]>(initialPeople)
  const [items, setItems] = React.useState<SplitItem[]>(initialItems)
  const [draft, setDraft] = React.useState("")
  const seq = React.useRef(0)

  const total = items.reduce((sum, it) => sum + it.amount, 0)
  const totals = people.map((p) => ({
    person: p,
    amount: items.filter((it) => it.who === p.id).reduce((sum, it) => sum + it.amount, 0),
  }))

  const addPerson = () => {
    const name = draft.trim()
    if (!name) return
    setDraft("")
    if (people.some((p) => p.name.toLowerCase() === name.toLowerCase())) return
    seq.current += 1
    setPeople((cur) => [...cur, { id: `guest-${seq.current}`, name }])
  }

  const removePerson = (id: string) => {
    setPeople((cur) => cur.filter((p) => p.id !== id))
    setItems((cur) => cur.map((it) => (it.who === id ? { ...it, who: null } : it)))
  }

  const cycleWho = (itemId: string) =>
    setItems((cur) => {
      const order: (string | null)[] = [null, ...people.map((p) => p.id)]
      return cur.map((it) => {
        if (it.id !== itemId) return it
        const next = order[(order.indexOf(it.who) + 1) % order.length]
        return { ...it, who: next }
      })
    })

  const hair = ink ? "border-background/15" : "border-border"

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
            <motion.div
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className={cn(
                "overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              {/* ── chrome ── */}
              <div className={cn("border-b px-6 pb-5 pt-6", hair)}>
                <MonoLabel className="text-muted-foreground">{heading}</MonoLabel>
                <h3 className="mt-3 font-display text-xl font-bold tracking-[-0.02em]">The check, settled</h3>
              </div>

              <div className="px-6 pb-6 pt-5">
                {/* ── people chips ── */}
                <MonoLabel className="text-muted-foreground">At the table</MonoLabel>
                <div className="mt-2 flex flex-wrap items-center gap-2" aria-live="polite">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {people.map((p) => (
                      <motion.span
                        layout={!reduce}
                        key={p.id}
                        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                        transition={{ type: "spring", stiffness: 420, damping: 28 }}
                        className="inline-flex items-center gap-1 rounded-full bg-muted py-1 pl-3 pr-1"
                      >
                        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em]">{p.name}</span>
                        <button
                          type="button"
                          aria-label={`Remove ${p.name} from the check`}
                          onClick={() => removePerson(p.id)}
                          className="grid size-5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <X className="size-3" aria-hidden />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {people.length === 0 && <span className="text-xs font-medium text-muted-foreground">Nobody yet — add the table below.</span>}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    addPerson()
                  }}
                  className="mt-3 flex gap-2"
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Name — e.g. Maja"
                    aria-label="Add a person to the check"
                    className="h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <button
                    type="submit"
                    aria-label="Add person"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Plus className="size-3.5" aria-hidden /> Add
                  </button>
                </form>

                {/* ── items with cycling who-chips ── */}
                <div className="mt-6">
                  <MonoLabel className="text-muted-foreground">The check</MonoLabel>
                  <ul className="mt-1">
                    {items.map((it) => {
                      const person = people.find((p) => p.id === it.who)
                      return (
                        <motion.li
                          layout={!reduce}
                          key={it.id}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          className="flex items-center gap-3 border-b border-border/70 py-2.5 last:border-b-0"
                        >
                          <span className="min-w-0 flex-1 truncate text-sm font-semibold">{it.name}</span>
                          <span className="shrink-0 font-mono text-[13px] tabular-nums text-muted-foreground">{kr(it.amount)}</span>
                          <button
                            type="button"
                            onClick={() => cycleWho(it.id)}
                            aria-label={`${it.name} is charged to ${person ? person.name : "no one"} — tap to cycle the assignment`}
                            title={person ? person.name : "Unassigned — tap to assign"}
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-full border font-mono text-[10px] font-bold uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              person
                                ? "border-transparent bg-muted text-foreground hover:bg-background"
                                : "border-dashed border-border text-muted-foreground hover:border-muted-foreground/60",
                            )}
                          >
                            {person ? initials(person.name) : "–"}
                          </button>
                        </motion.li>
                      )
                    })}
                  </ul>
                </div>

                {/* ── live split ── */}
                <div aria-live="polite" className="mt-5 rounded-lg border bg-muted/50 p-4">
                  <MonoLabel className="text-muted-foreground">Split</MonoLabel>
                  <ul className="mt-2 space-y-1.5">
                    {totals.map(({ person, amount }) => (
                      <motion.li layout={!reduce} key={person.id} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="flex items-baseline justify-between gap-3 font-mono text-[13px]">
                        <span className="flex items-center gap-2">
                          <span aria-hidden className="grid size-5 place-items-center rounded-full bg-background text-[8px] font-bold">
                            {initials(person.name)}
                          </span>
                          {person.name}
                        </span>
                        <span className="font-bold tabular-nums">{kr(amount)}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3 font-mono text-sm font-bold">
                    <span>Grand total</span>
                    <span className="tabular-nums">{kr(total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <figcaption
            className={cn(
              "mx-auto mt-8 flex max-w-[520px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              hair,
              ink ? "text-background/55" : "text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </figcaption>
        </figure>
      </InView>
    </SectionShell>
  )
}
