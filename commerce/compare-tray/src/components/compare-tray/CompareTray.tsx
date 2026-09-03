import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"

// ═══ JOB         Side-by-side spec truth without leaving the grid.
// ═══ EMOTION     Laying two receipts next to each other on the counter.
// ═══ SIGNATURE   Pick two (three max) and a tray slides up from the stage
//                 floor — mini columns compare thumb, price and three spec
//                 rows, and every value that disagrees gets underlined.

export type CompareProduct = {
  id: string
  name: string
  price: number
  src: string
  alt: string
  weight: string
  finish: string
  warranty: string
}

export type CompareTrayProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  products?: CompareProduct[]
  /** Product ids pre-selected for comparison on mount. */
  initialSelected?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const MAX_COMPARE = 3

const SPEC_ROWS = [
  { key: "weight", label: "Weight" },
  { key: "finish", label: "Finish" },
  { key: "warranty", label: "Warranty" },
] as const

type SpecKey = (typeof SPEC_ROWS)[number]["key"]

const DEFAULT_PRODUCTS: CompareProduct[] = [
  { id: "chair-03", name: "Chair 03", price: 8900, src: "/showcase/gallery-01.webp", alt: "Chair 03 in the showroom", weight: "6.2 kg", finish: "Oiled oak", warranty: "10 yr" },
  { id: "chair-04", name: "Chair 04", price: 9400, src: "/showcase/gallery-02.webp", alt: "Chair 04 by the window", weight: "7.4 kg", finish: "Lacquered ash", warranty: "10 yr" },
  { id: "wash-unit", name: "Wash unit 02", price: 21400, src: "/showcase/gallery-03.webp", alt: "Backwash unit in the wash corner", weight: "18.0 kg", finish: "Ceramic white", warranty: "5 yr" },
  { id: "trolley", name: "Trolley mini", price: 2600, src: "/showcase/gallery-04.webp", alt: "Colour trolley mid-mix", weight: "4.1 kg", finish: "Steel black", warranty: "2 yr" },
]

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`

export function CompareTray({
  eyebrow = "COMMERCE · COMPARE",
  title = "Specs, settled side by side.",
  subtitle = "Four pieces from the floor. Tick Compare on two — the tray slides up with thumbs, prices and specs, and every value that disagrees gets underlined.",
  products = DEFAULT_PRODUCTS,
  initialSelected = ["chair-03", "chair-04"],
  caption = "PICK TWO OR THREE · DIFFS GET UNDERLINED",
  tone = "paper",
  className,
}: CompareTrayProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(initialSelected))
  const chosen = products.filter((p) => selected.has(p.id))
  const open = chosen.length >= 2
  const full = selected.size >= MAX_COMPARE

  const diffRows = new Set<SpecKey>(
    open
      ? SPEC_ROWS.filter(({ key }) => new Set(chosen.map((p) => p[key])).size > 1).map(({ key }) => key)
      : [],
  )

  const toggle = (id: string) =>
    setSelected((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_COMPARE) next.add(id)
      return next
    })

  const hair = ink ? "border-background/15" : "border-border"

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
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
          {/* ── demo stage — the tray lives inside, like a viewport screenshot ── */}
          <div
            className={cn(
              "relative h-[520px] overflow-hidden rounded-xl border border-dashed",
              ink ? "border-background/25 bg-background/5" : "border-border bg-muted/30",
            )}
          >
            <div className="h-full overflow-y-auto">
              <div className={cn("p-4 sm:p-6", open && "pb-56")}>
                <div className="flex items-center justify-between gap-3">
                  <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>Quiet Times Studio — floor catalog</MonoLabel>
                  <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Max {MAX_COMPARE}</span>
                </div>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {products.map((p) => {
                    const on = selected.has(p.id)
                    const locked = !on && full
                    return (
                      <li key={p.id} className="flex flex-col overflow-hidden rounded-lg border bg-card">
                        <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        <div className="flex flex-1 flex-col gap-3 p-3">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{p.name}</p>
                            <p className="shrink-0 font-mono text-[11px] font-medium text-muted-foreground">{kr(p.price)}</p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            aria-pressed={on}
                            disabled={locked}
                            title={on || !locked ? undefined : `Up to ${MAX_COMPARE} compare at once — remove one first`}
                            onClick={() => toggle(p.id)}
                            className={cn(
                              "mt-auto h-8 gap-1.5 rounded-md border font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
                              on
                                ? "border-foreground bg-foreground text-background hover:bg-foreground/90"
                                : locked
                                  ? "cursor-not-allowed border-border/70 text-muted-foreground/50"
                                  : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                            )}
                          >
                            {on ? <Check className="size-3.5" aria-hidden /> : <Plus className="size-3.5" aria-hidden />}
                            Compare
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* ── the tray — slides up once two chips are on ── */}
            <AnimatePresence>
              {open && (
                <motion.div
                  role="region"
                  aria-label={`Compare tray — ${chosen.length} products`}
                  initial={reduce ? { opacity: 0 } : { y: "112%" }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: "112%" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-x-0 bottom-0 z-[2] rounded-t-[20px] border-t bg-card p-4 shadow-2xl"
                >
                  <div className="flex items-center gap-3">
                    <MonoLabel className="shrink-0 text-muted-foreground">
                      Compare — {chosen.length} / {MAX_COMPARE}
                    </MonoLabel>
                    <span className="hidden truncate font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70 sm:block">
                      differing specs underlined
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label="Clear the comparison"
                      onClick={() => setSelected(new Set())}
                      className="ml-auto h-8 shrink-0 rounded-full px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>

                  <motion.ul layout className="mt-3 flex gap-3 overflow-x-auto pb-1">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {chosen.map((p) => (
                        <motion.li
                          layout={!reduce}
                          key={p.id}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
                          transition={{ type: "spring", stiffness: 420, damping: 30 }}
                          className="w-36 shrink-0 rounded-lg border bg-background p-2.5"
                        >
                          <img src={p.src} alt={p.alt} className="h-16 w-full rounded-md border object-cover" />
                          <p className="mt-2 truncate text-xs font-semibold">{p.name}</p>
                          <p className="font-mono text-[11px] font-medium text-muted-foreground">{kr(p.price)}</p>
                          <dl className="mt-2 space-y-1.5 border-t border-border/70 pt-2">
                            {SPEC_ROWS.map(({ key, label }) => (
                              <div key={key} className="flex items-baseline justify-between gap-2">
                                <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
                                <dd
                                  className={cn(
                                    "text-right text-[11px] font-medium",
                                    diffRows.has(key) && "font-bold underline decoration-primary underline-offset-[3px]",
                                  )}
                                >
                                  {p[key]}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </motion.ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <figcaption
            className={cn(
              "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
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
