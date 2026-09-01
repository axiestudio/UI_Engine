import * as React from "react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type TeamMember = {
  name: string
  role: string
  group: "chair" | "floor" | "school"
  tag: string
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { name: "Klara Bengtsson", role: "Senior stylist", group: "chair", tag: "Chair 1" },
  { name: "Oskar Lindqvist", role: "Floor host", group: "floor", tag: "Front desk" },
  { name: "Elin Sandberg", role: "Colour specialist", group: "chair", tag: "Chair 2" },
  { name: "Vera Nyström", role: "Cut & finish", group: "chair", tag: "Chair 3" },
  { name: "Mika Aho", role: "Backbar & mix", group: "floor", tag: "Backbar" },
  { name: "Ingrid Holm", role: "Academy lead", group: "school", tag: "School" },
  { name: "Sanne Berg", role: "Apprentice", group: "floor", tag: "Floor" },
  { name: "Yusuf Karim", role: "Barber", group: "chair", tag: "Chair 4" },
]

const FILTERS = [
  { id: "all", label: "All" },
  { id: "chair", label: "Chairs" },
  { id: "floor", label: "Floor" },
  { id: "school", label: "School" },
] as const

type FilterId = (typeof FILTERS)[number]["id"]

export type TeamRosterProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  caption?: string
  members?: TeamMember[]
  tone?: "paper" | "ink"
  className?: string
}

export function TeamRoster({
  eyebrow = "Quiet Times Studio · The team",
  title = "Eight pairs of hands, one quiet standard.",
  subtitle = "Chairs, floor and school under one roof in Jönköping. Filter the roster by where people work.",
  caption = "ROSTER · AUTUMN COHORT",
  members = DEFAULT_MEMBERS,
  tone = "paper",
  className,
}: TeamRosterProps) {
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const [filter, setFilter] = React.useState<FilterId>("all")
  const filtered = filter === "all" ? members : members.filter((m) => m.group === filter)

  const pad = (n: number) => String(n).padStart(2, "0")

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="group" aria-label="Filter roster" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <Button type='button' key={f.id} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} className={cn(
                  "rounded-full border px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  filter === f.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )} variant="default">
                {f.label}
              </Button>
            ))}
          </div>
          <p aria-live="polite" className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {pad(filtered.length)} / {pad(members.length)} on the floor
          </p>
        </div>

        <MotionConfig reducedMotion="user">
          <motion.div layout className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((m) => (
                <motion.div
                  key={m.name}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  whileHover={{ y: -4 }}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <span
                    aria-hidden
                    className="flex size-12 items-center justify-center rounded-full bg-foreground font-mono text-[12px] font-bold tracking-[0.08em] text-background"
                  >
                    {m.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                  <p className="mt-3.5 font-display text-[14px] font-bold leading-tight">{m.name}</p>
                  <p className="mt-0.5 text-[11px] font-medium text-muted-foreground">{m.role}</p>
                  <span className="mt-3 inline-flex rounded-full border border-border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {m.tag}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </MotionConfig>

        <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          <span>{caption}</span>
          <span aria-hidden>●</span>
        </p>
      </div>
    
  </div>
</section>
  )
}
