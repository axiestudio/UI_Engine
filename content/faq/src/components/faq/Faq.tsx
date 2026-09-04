import * as React from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/primitives/accordion"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ── Types ────────────────────────────────────────────────────────────────────
export type FaqEntry = {
  /** Stable slug used for #hash deep links. Auto-derived from the question if omitted. */
  id?: string
  question: string
  /** Plain string keeps search + highlighting working; ReactNode allowed too. */
  answer: React.ReactNode
  category?: string
}

export type FaqProps = {
  badge?: string
  title?: string
  subtitle?: string
  items: FaqEntry[]
  /** 1 by default; 2 spreads items on xl. */
  columns?: 1 | 2
  /** Show category chip row (derived from items when any entry has a category). Default true. */
  showCategories?: boolean
  /** Show the search input. Default true. */
  searchable?: boolean
  searchPlaceholder?: string
  emptyLabel?: string
  /** Closing call-to-action; the preset renders no invented copy if omitted. */
  cta?: { label: string; href: string }
  /** Label beside the CTA. Default "Still have questions?" */
  questionsLabel?: string
  defaultOpenId?: string
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function itemText(i: FaqEntry) {
  const answerText = typeof i.answer === "string" ? i.answer : ""
  return `${i.question} ${answerText}`.toLowerCase()
}

function highlight(text: string, q: string): React.ReactNode {
  if (!q) return text
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-accent px-0.5 text-foreground">{text.slice(idx, idx + q.length)}</mark>
      {highlight(text.slice(idx + q.length), q)}
    </>
  )
}

// ── FAQ ──────────────────────────────────────────────────────────────────────

// Self-demo defaults.
const DEMO_FAQ_ITEMS: FaqEntry[] = [
  { id: "hours", question: "What are your hours?", answer: "Monday through Friday, 09:00 to 21:00. Saturdays, 10:00 to 18:00. The studio is closed on Sundays." },
  { id: "book", question: "How do I book a chair?", answer: "Pick a slot in the calendar above. Confirmation arrives by email within a minute; the front desk sees the booking the moment it lands." },
  { id: "cancel", question: "Can I cancel or reschedule?", answer: "Yes — up to four hours before the appointment. Inside the four-hour window the chair is held for you and the slot is forfeit." },
  { id: "license", question: "Are your therapists licensed?", answer: "Every practitioner on the floor carries a current state license and is listed on the staff page with their credentials and specialties." },
  { id: "walk-ins", question: "Do you take walk-ins?", answer: "When the calendar shows open chairs, yes. The same online calendar the studio uses is mirrored on the door screen, so you will not queue in vain." },
]

export function Faq({
  badge = "Support",
  title = "Frequently asked questions",
  subtitle,
  items = DEMO_FAQ_ITEMS,
  columns = 1,
  showCategories = true,
  searchable = true,
  searchPlaceholder = "Search questions…",
  emptyLabel = "No questions match your search.",
  cta,
  questionsLabel = "Still have questions?",
  defaultOpenId,
  className,
}: FaqProps) {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<string | null>(null)
  const [openId, setOpenId] = React.useState<React.Key | null>(defaultOpenId ?? null)

  const withIds = React.useMemo(
    () => items.map((i) => ({ ...i, key: i.id ?? slugify(i.question) })),
    [items]
  )

  const categories = React.useMemo(() => {
    if (!showCategories) return []
    const seen = new Set<string>()
    for (const i of items) if (i.category) seen.add(i.category)
    return [...seen]
  }, [items, showCategories])

  React.useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    if (hash && withIds.some((i) => i.key === hash)) {
      setOpenId(hash)
      requestAnimationFrame(() => document.getElementById(`faq-${hash}`)?.scrollIntoView({ block: "center", behavior: "smooth" }))
    }
  }, [withIds])

  const filtered = withIds
    .filter((i) => (category ? i.category === category : true))
    .filter((i) => (query.trim() ? itemText(i).includes(query.trim().toLowerCase()) : true))

  return (
    <section className={cn("relative isolate overflow-hidden w-full bg-background text-foreground", className)} aria-labelledby="faq-title">
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[880px] px-5 py-16 sm:px-8 lg:px-8">
          <header className="max-w-2xl">
            {badge && (
              <span className="inline-flex items-center rounded-full border bg-card shadow-sm px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {badge}
              </span>
            )}
            <h2 id="faq-title" className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h2>
            {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
          </header>

          {/* controls */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            {categories.length > 0 && (
              <div role="tablist" aria-label="FAQ categories" className="flex flex-wrap items-center gap-1.5">
                <Button type='button' role="tab" aria-selected={category === null} onClick={() => setCategory(null)} className={cn(
                    "h-11 rounded-full px-3.5 py-2 text-sm font-bold tracking-tight transition-colors",
                    category === null ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )} variant="default">
                  All
                </Button>
                {categories.map((c) => (
                  <Button type='button' key={c} role="tab" aria-selected={category === c} onClick={() => setCategory(category === c ? null : c)} className={cn(
                      "h-11 rounded-full px-3.5 py-2 text-sm font-bold tracking-tight transition-colors",
                      category === c ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )} variant="default">
                    {c}
                  </Button>
                ))}
              </div>
            )}

            {searchable && (
              <div className="relative sm:ml-auto sm:w-[260px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  aria-label={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-11 w-full rounded-full border bg-card pl-9 pr-9 font-medium"
                />
                {query && (
                  <Button type='button' aria-label="Clear search" onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground" variant="default">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* items */}
          {filtered.length === 0 ? (
            <p className="mt-12 rounded-[20px] border border-dashed bg-muted/30 px-6 py-10 text-center text-sm font-medium text-muted-foreground" role="status">
              {emptyLabel}
            </p>
          ) : (
            <div className={cn("mt-8", columns === 2 && "gap-x-10 lg:grid lg:grid-cols-2")}>
              <Accordion expandedValue={openId} onValueChange={(v) => setOpenId(v)} variants={{ collapsed: {}, expanded: {} }}>
                {filtered.map((i) => (
                  <div key={String(i.key)} id={`faq-${i.key}`} className="scroll-mt-24 border-b last:border-b-0">
                  <AccordionItem value={i.key}>
                    <AccordionTrigger className="w-full rounded-xl group/acc">
                      <span className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors group-hover/acc:bg-accent/40">
                        <span className="font-display text-[15px] font-bold leading-snug tracking-tight sm:text-base">
                          {highlight(i.question, query.trim())}
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[expanded]/acc:rotate-180" />
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-4 pb-5">
                        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                          {typeof i.answer === "string" ? highlight(i.answer, query.trim()) : i.answer}
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  </div>
                ))}
              </Accordion>
            </div>
          )}

          {cta && (
            <div className="mt-10 flex items-center justify-between gap-4 rounded-[20px] bg-foreground px-5 py-5 text-background">
              <p className="text-sm font-semibold">{questionsLabel}</p>
              <Magnetic intensity={0.25} range={40}>
                <a
                  href={cta.href}
                  className="inline-flex h-10 items-center rounded-full bg-background px-5 font-display text-sm font-bold tracking-tight text-foreground shadow transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {cta.label}
                </a>
              </Magnetic>
            </div>
          )}
        </div>
      </InView>
    </section>
  )
}
