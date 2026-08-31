import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { Spotlight } from "@/components/primitives/spotlight"

// ═══ JOB      position every player on one honest map
// ═══ EMOTION  strategist's clarity — four quadrants, no fog
// ═══ SIGNATURE hover a quadrant and a spotlight lens dims the others while
//               its label plate lifts; dots ease toward their quadrant center
//   SITE      → competitive/positioning pages, category creation
//   APP       → portfolio/triage boards; items are data
//   A11Y      quadrant buttons labeled; dots have sr names

export type ScopeItem = { name: string; x: number; y: number }

export type QuadrantScopeProps = {
  axes?: { x: [string, string]; y: [string, string] }
  items?: ScopeItem[]
  className?: string
}

const QUADRANTS = [
  { id: "q1", label: "Leaders", note: "High craft · High reach" },
  { id: "q2", label: "Craftists", note: "High craft · Low reach" },
  { id: "q3", label: "Niche", note: "Low craft · Low reach" },
  { id: "q4", label: "Bulldozers", note: "Low craft · High reach" },
]

const DEFAULT_ITEMS: ScopeItem[] = [
  { name: "You", x: 72, y: 78 },
  { name: "Incumbent Co", x: 64, y: 62 },
  { name: "Studio B", x: 30, y: 70 },
  { name: "DIY tools", x: 22, y: 30 },
  { name: "Platform X", x: 76, y: 26 },
]

export function QuadrantScope({ axes = { x: ["Craft", "Reach"], y: ["Low", "High"] }, items = DEFAULT_ITEMS, className }: QuadrantScopeProps) {
  const [active, setActive] = React.useState<number | null>(null)
  const quadrantOf = (it: ScopeItem) => (it.x >= 50 && it.y >= 50 ? 0 : it.x < 50 && it.y >= 50 ? 1 : it.x < 50 && it.y < 50 ? 2 : 3)

  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">POSITIONING · THE SCOPE</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">The map, without the fog.</h2>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="relative aspect-square w-full rounded-2xl border bg-card" onMouseLeave={() => setActive(null)}>
          <Spotlight size={280} className="rounded-2xl" />
          {/* axes */}
          <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-border" />
          <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <span className="absolute -bottom-6 left-0 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{axes.x[0]}</span>
          <span className="absolute -bottom-6 right-0 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{axes.x[1]} →</span>
          <span className="absolute -left-2 top-0 origin-top-left -rotate-90 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{axes.y[1]} ↑</span>

          {/* quadrant hover plates */}
          {QUADRANTS.map((q, qi) => (
            <motion.button
              key={q.id}
              type="button"
              aria-label={`Quadrant ${q.label}: ${q.note}`}
              onMouseEnter={() => setActive(qi)}
              onFocus={() => setActive(qi)}
              animate={{ opacity: active === null || active === qi ? 1 : 0.25 }}
              transition={{ duration: 0.3 }}
              className={cn("absolute grid h-1/2 w-1/2 place-items-start p-3 text-left",
                qi === 0 && "right-0 top-0 rounded-tr-2xl", qi === 1 && "left-0 top-0 rounded-tl-2xl",
                qi === 2 && "bottom-0 left-0 rounded-bl-2xl", qi === 3 && "bottom-0 right-0 rounded-br-2xl")}
            >
              <span className={cn("rounded-lg border bg-background px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] transition-all",
                active === qi ? "-translate-y-0.5 border-foreground text-foreground shadow" : "border-border text-muted-foreground")}>
                {q.label}
              </span>
            </motion.button>
          ))}

          {/* items */}
          {items.map((it, i) => {
            const qi = quadrantOf(it)
            return (
              <motion.div
                key={it.name}
                animate={{ opacity: active === null || active === qi ? 1 : 0.2, scale: active === qi ? 1.12 : 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                style={{ left: `${it.x}%`, top: `${100 - it.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <span className={cn("block size-3.5 rounded-full border-2 border-background shadow", it.name === "You" ? "bg-foreground" : "bg-muted-foreground/70")} />
                <span className={cn("absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.12em]", it.name === "You" ? "text-foreground" : "text-muted-foreground")}>{it.name}</span>
                <span className="sr-only">{it.name}</span>
              </motion.div>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          {QUADRANTS.map((q, qi) => (
            <button key={q.id} type="button" onMouseEnter={() => setActive(qi)} onFocus={() => setActive(qi)} onMouseLeave={() => setActive(null)}
              className={cn("rounded-xl border p-4 text-left transition-colors", active === qi ? "border-foreground bg-foreground text-background" : "border-border bg-background")}>
              <span className="font-display text-sm font-black uppercase tracking-tight">{q.label}</span>
              <span className={cn("mt-1 block font-mono text-[10px] font-bold", active === qi ? "text-background/70" : "text-muted-foreground")}>{q.note}</span>
            </button>
          ))}
        </div>
      </div>
    </SectionShell>
  )
}
