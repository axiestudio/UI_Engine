import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      prove the type system holds from footnote to billboard
// ═══ EMOTION  typographic awe — the scale is the brand's skeleton
// ═══ SIGNATURE a ramp ladder where each rung labels its px/tracking and
//               a mini aA waterfall; hovering a rung pushes the others aside
//   SITE      → brand guideline typography chapter
//   APP       → type scale pickers; rungs are data
//   A11Y      headings real; labels are text

export type TypeRung = { label: string; size: number; tracking: string; use: string }

export type TypoRampBrandProps = {
  rungs?: TypeRung[]
  className?: string
}

const DEFAULT_RUNGS: TypeRung[] = [
  { label: "Display", size: 72, tracking: "-0.035em", use: "billboards" },
  { label: "H1", size: 48, tracking: "-0.03em", use: "page openers" },
  { label: "H2", size: 34, tracking: "-0.025em", use: "section heads" },
  { label: "Body", size: 16, tracking: "0", use: "reading" },
  { label: "Micro", size: 11, tracking: "0.18em", use: "labels" },
]

export function TypoRampBrand({ rungs = DEFAULT_RUNGS, className }: TypoRampBrandProps) {
  const [active, setActive] = React.useState(0)
  return (
    <SectionShell width={1120} rails className={className}>
      <MonoLabel className="text-muted-foreground">TYPE · THE RAMP</MonoLabel>
      <h2 className="mt-2 font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        Five sizes. <em className="font-serif italic font-medium">Zero defaults.</em>
      </h2>

      <div className="mt-12 divide-y divide-border border-y">
        {rungs.map((r, i) => (
          <InView key={r.label} once delay={i * 0.05}>
            <motion.div
              role="button"
              tabIndex={0}
              aria-pressed={active === i}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              animate={{ paddingLeft: active === i ? 24 : 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn("group flex cursor-default flex-wrap items-baseline gap-x-8 gap-y-2 py-5 transition-colors",
                active === i ? "text-foreground" : "text-muted-foreground")}
            >
              <span className="w-16 shrink-0 font-mono text-[10px] font-black uppercase tracking-[0.18em]">{r.label}</span>
              <span
                aria-hidden
                className={cn("min-w-0 truncate font-display font-black leading-none", active === i ? "opacity-100" : "opacity-60")}
                style={{ fontSize: `min(${r.size}px, 12vw)`, letterSpacing: r.tracking }}
              >
                Aa — {r.use}
              </span>
              <span className="ml-auto shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.16em]">
                {r.size}px · {r.tracking}
              </span>
            </motion.div>
          </InView>
        ))}
      </div>
      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">var(--font-display) · optical sizes locked</p>
    </SectionShell>
  )
}
