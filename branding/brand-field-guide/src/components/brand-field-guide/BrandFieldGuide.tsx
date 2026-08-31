import * as React from "react"
import { motion } from "motion/react"
import { Check, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make the rules memorable by showing the wrong way too
// ═══ EMOTION  a field guide — practical, a little funny, deadly serious
// ═══ SIGNATURE split rule cards: the "do" side is crisp paper, the "don't"
//               side gets a rotated AVOID stamp on toggle; verdict stamps animate
//   SITE      → brand guideline do/don't chapters
//   APP       → checklist/wizard rails; rules are data
//   A11Y      toggle buttons with aria-pressed; both states are text

export type BrandRule = { do: string; dont: string; why: string }

export type BrandFieldGuideProps = {
  rules?: BrandRule[]
  className?: string
}

const DEFAULT_RULES: BrandRule[] = [
  { do: "Logo on paper, always with air.", dont: "Logo on a photo of a sunset.", why: "Contrast is kindness." },
  { do: "One accent per view.", dont: "All five colors at once.", why: "Accent means rare." },
  { do: "Sentences under 12 words.", dont: "Corporate word-salad.", why: "Brevity is brand." },
]

function RuleCard({ rule, index }: { rule: BrandRule; index: number }) {
  const [avoid, setAvoid] = React.useState(false)
  return (
    <InView once delay={index * 0.07}>
      <article className="relative grid overflow-hidden rounded-2xl border bg-card sm:grid-cols-2">
        <div className="p-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
            <Check className="size-3.5" aria-hidden /> Do
          </span>
          <p className="mt-4 font-display text-lg font-bold leading-snug text-foreground">{rule.do}</p>
        </div>
        <div className={cn("relative p-6 transition-colors", avoid ? "bg-red-950/95 dark:bg-red-950/60" : "bg-muted/40")}>
          <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em]",
            avoid ? "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-200" : "bg-red-100/70 text-red-800 dark:bg-red-950 dark:text-red-300")}>
            <Ban className="size-3.5" aria-hidden /> Don't
          </span>
          <p className={cn("mt-4 font-display text-lg font-bold leading-snug", avoid ? "text-red-100 line-through decoration-2" : "text-muted-foreground")}>{rule.dont}</p>
          {avoid && (
            <motion.span
              initial={{ scale: 1.8, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: -12 }}
              transition={{ type: "spring", stiffness: 320, damping: 16 }}
              aria-hidden
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-lg border-[3px] border-red-500 px-3 py-1 font-mono text-[11px] font-black uppercase tracking-[0.3em] text-red-500"
            >
              Avoid
            </motion.span>
          )}
        </div>
        <footer className="col-span-full flex items-center justify-between gap-4 border-t border-dashed px-6 py-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">why · {rule.why}</span>
          <button type="button" aria-pressed={avoid} onClick={() => setAvoid((a) => !a)}
            className="rounded-full border px-3 py-1 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-foreground hover:bg-foreground hover:text-background">
            {avoid ? "reset" : "test the mistake"}
          </button>
        </footer>
      </article>
    </InView>
  )
}

export function BrandFieldGuide({ rules = DEFAULT_RULES, className }: BrandFieldGuideProps) {
  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">FIELD GUIDE · DO / DON'T</MonoLabel>
      <h2 className="mt-2 font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        Read the rules. <em className="font-serif italic font-medium">Then feel the difference.</em>
      </h2>
      <div className="mt-12 space-y-6">
        {rules.map((r, i) => <RuleCard key={r.do} rule={r} index={i} />)}
      </div>
    </SectionShell>
  )
}
