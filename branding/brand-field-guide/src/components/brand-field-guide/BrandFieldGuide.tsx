import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Ban, Check, Undo2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ═══ JOB      make the rules memorable by showing the wrong way too
// ═══ EMOTION  a field guide — practical, a little dry, deadly serious
// ═══ SIGNATURE do/don't split cards on a paper ledger: pressing "test the
//               mistake" fails the don't side live — dashed destructive tint,
//               strikethrough, and an AVOID rubber stamp that springs in
//               rotated; the why-line stays as the dry moral
//   SITE      → brand guideline do/don't chapters
//   APP       → checklist rails; rules are data
//   BUILD     shadcn new-york-v4 Card/Badge/Button  token-driven section markup
//   A11Y      toggle is a labelled button with aria-pressed; both verdicts
//             are visible text; stamp is aria-hidden

export type BrandRule = { do: string; dont: string; why: string }

export type BrandFieldGuideProps = {
  rules?: BrandRule[]
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  className?: string
}

const DEFAULT_RULES: BrandRule[] = [
  { do: "Logo on paper, always with air.", dont: "Logo on a photo of a sunset.", why: "Contrast is kindness." },
  { do: "One accent per view.", dont: "All five colors at once.", why: "Accent means rare." },
  { do: "Sentences under 12 words.", dont: "Corporate word-salad.", why: "Brevity is brand." },
]

function RuleCard({ rule, index, total }: { rule: BrandRule; index: number; total: number }) {
  const reduced = useReducedMotion()
  const [avoid, setAvoid] = React.useState(false)

  return (
    <InView once delay={index * 0.07}>
      <Card className="overflow-hidden gap-0 p-0">
        <CardContent className="p-0">
          <div className="grid sm:grid-cols-2">
            <section className="p-6">
              <Badge className="gap-1.5 rounded-full bg-primary font-mono text-[9px] font-black uppercase tracking-[0.16em] text-primary-foreground">
                <Check className="size-3" aria-hidden /> Do
              </Badge>
              <p className="mt-4 font-display text-lg font-bold leading-snug tracking-tight text-foreground">{rule.do}</p>
            </section>
            <section className={cn("relative p-6 transition-colors duration-300", avoid ? "bg-destructive/[0.07] dark:bg-destructive/15" : "bg-muted/40")}>
              <Badge variant="destructive" className="gap-1.5 rounded-full font-mono text-[9px] font-black uppercase tracking-[0.16em]">
                <Ban className="size-3" aria-hidden /> Don't
              </Badge>
              <p className={cn("mt-4 font-display text-lg font-bold leading-snug tracking-tight transition-all", avoid ? "text-foreground/70 line-through decoration-destructive decoration-2 underline-offset-4" : "text-muted-foreground")}>
                {rule.dont}
              </p>
              {avoid && (
                <motion.span
                  initial={reduced ? false : { scale: 1.8, opacity: 0, rotate: -18 }}
                  animate={{ scale: 1, opacity: 1, rotate: -12 }}
                  transition={{ type: "spring", stiffness: 320, damping: 16 }}
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border-[2.5px] border-destructive px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.3em] text-destructive"
                >
                  Avoid
                </motion.span>
              )}
            </section>
          </div>
          <Separator className="opacity-70" />
          <footer className="flex items-center justify-between gap-4 px-6 py-3">
            <span className="flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground text-foreground/40">{String(index + 1).padStart(2, "0")}<span className="opacity-50"> / {String(total).padStart(2, "0")}</span></span>
              <span aria-hidden className="h-3 w-px bg-border" />why: {rule.why}
            </span>
            <Button
              type="button"
              variant={avoid ? "outline" : "default"}
              size="xs"
              aria-pressed={avoid}
              onClick={() => setAvoid((a) => !a)}
              className="shrink-0 gap-1.5 rounded-full font-mono text-[9px] font-black uppercase tracking-[0.16em]"
            >
              {avoid ? <Undo2 className="size-3" aria-hidden /> : null}
              {avoid ? "reset" : "test the mistake"}
            </Button>
          </footer>
        </CardContent>
      </Card>
    </InView>
  )
}

export function BrandFieldGuide({
  rules = DEFAULT_RULES,
  eyebrow = "FIELD GUIDE · DO / DON'T",
  title = (
    <>
      Read the rules. <em className="font-serif text-[0.98em] font-medium italic">Then feel the difference.</em>
    </>
  ),
  subtitle = "Click “test the mistake” to see the failure state — the stamp is the point.",
  className,
}: BrandFieldGuideProps) {
  return (
    <section className={cn("bg-background text-foreground", className)>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <header className="">
        {eyebrow != null && (          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>        )}
        <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">{title}</h2>
        {subtitle != null && (          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>        )}
      </header>
      <div className="mt-12 space-y-6">
        {rules.map((r, i) => (
          <RuleCard key={r.do} rule={r} index={i} total={rules.length} />
        ))}
      </div>
    </div>
    </section>
  )
}
