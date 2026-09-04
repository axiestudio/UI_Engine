import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ═══ JOB      turn palette values into a recipe anyone can cook
// ═══ EMOTION  kitchen precision — colors as measured ingredients
// ═══ SIGNATURE recipe cards: each ingredient is a measured row whose fill
//               bar pours in on scroll; the yield plate is the actual
//               weight-mixed hex, and one click copies it; ratios are text
//               for AT, not just bar widths
//   SITE      → brand guideline color chapters
//   APP       → theme builders; recipes are data, result is computed
//   BUILD     shadcn Card/Badge/Button + vendored mix maths (hexes here are
//             the subject matter — data, by design)
//   A11Y      percent measures readable, copy button announces, bars are
//             aria-hidden decoration over text values

export type Ingredient = { name: string; token: string; rgb: [number, number, number]; parts: number }
export type Recipe = { id: string; name: string; use: string; ingredients: Ingredient[] }
/** @deprecated alias kept for the published package API */
export type PaletteRecipe = Recipe

export type PaletteRecipeProps = {
  recipes?: Recipe[]
  eyebrow?: string
  className?: string
  onPick?: (r: Recipe, mixedHex: string) => void
}

const DEFAULT_RECIPES: Recipe[] = [
  { id: "morning", name: "Morning Rush", use: "Primary CTA", ingredients: [
    { name: "Paper", token: "paper", rgb: [250, 247, 242], parts: 62 },
    { name: "Signal Orange", token: "signal-orange", rgb: [232, 80, 30], parts: 30 },
    { name: "Ink", token: "ink", rgb: [18, 18, 18], parts: 8 },
  ]},
  { id: "ledger", name: "Quiet Ledger", use: "Data surfaces", ingredients: [
    { name: "Paper", token: "paper", rgb: [250, 247, 242], parts: 78 },
    { name: "Stone", token: "stone", rgb: [142, 139, 132], parts: 14 },
    { name: "Ink", token: "ink", rgb: [18, 18, 18], parts: 8 },
  ]},
  { id: "grove", name: "Back Grove", use: "Success states", ingredients: [
    { name: "Moss", token: "moss", rgb: [74, 93, 67], parts: 44 },
    { name: "Paper", token: "paper", rgb: [250, 247, 242], parts: 40 },
    { name: "Ink", token: "ink", rgb: [18, 18, 18], parts: 16 },
  ]},
]

/** Weighted RGB mix — the same maths the bar percentages show. */
export function mix(ing: Ingredient[]): string {
  const total = ing.reduce((s, i) => s + i.parts, 0) || 1
  const rgb = ing.reduce(
    ([r, g, b], i) => [
      r + i.rgb[0] * (i.parts / total),
      g + i.rgb[1] * (i.parts / total),
      b + i.rgb[2] * (i.parts / total),
    ],
    [0, 0, 0]
  )
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`.toUpperCase()
}

function RecipeCard({ recipe, index, total, onPick }: { recipe: Recipe; index: number; total: number; onPick?: PaletteRecipeProps["onPick"] }) {
  const reduced = useReducedMotion()
  const sum = recipe.ingredients.reduce((s, i) => s + i.parts, 0) || 1
  const result = React.useMemo(() => mix(recipe.ingredients), [recipe])
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${recipe.name}: ${result}`)
    } catch { /* no clipboard, no crash */ }
    setCopied(true)
    onPick?.(recipe, result)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <InView once delay={index * 0.08} className="h-full">
      <Card className="group relative h-full overflow-hidden gap-4">
        <CardContent className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(index + 1).padStart(2, "0")}<span className="opacity-50"> / {String(total).padStart(2, "0")}</span></span>
            <Badge variant="outline" className="rounded-full font-mono text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
              {recipe.use}
            </Badge>
          </div>
          <h3 className="mt-1 font-display text-2xl font-black tracking-tight text-foreground">{recipe.name}</h3>

          <ul className="mt-4 grow space-y-3">
            {recipe.ingredients.map((ing) => {
              const pct = Math.round((ing.parts / sum) * 100)
              return (
                <li key={ing.name}>
                  <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                    <span className="flex items-center gap-2 text-foreground">
                      <span aria-hidden className="size-3.5 rounded-full border" style={{ backgroundColor: `hsl(var(--app-${ing.token}))` }} />
                      {ing.name}
                    </span>
                    <span className="tabular-nums text-muted-foreground">{ing.parts} pt · {pct}%</span>
                  </div>
                  <div aria-hidden className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={reduced ? false : { width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={reduced ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: `hsl(var(--app-${ing.token}))` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <Separator className="my-4" />

          <Button type="button" variant="ghost" onClick={() => void copy()} aria-label={`Copy ${recipe.name} yield ${result}`} className="mt-auto flex w-full items-center gap-3 rounded-xl border border-dashed p-3 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 h-auto">
            <motion.span
              aria-hidden
              initial={reduced ? false : { scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="size-12 shrink-0 rounded-lg border shadow-inner"
              style={{ backgroundColor: result }}
            />
            <span className="min-w-0 grow font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
              yields <span className="font-black text-foreground">{result}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
              {copied ? <><Check className="size-3.5 text-foreground" aria-hidden /> copied</> : <><Copy className="size-3.5" aria-hidden /> copy</>}
            </span>
          </Button>
        </CardContent>
      </Card>
    </InView>
  )
}

export function PaletteRecipes({ recipes = DEFAULT_RECIPES, eyebrow = "PALETTE · RECIPES", className, onPick }: PaletteRecipeProps) {
  return (
    <section className={cn("relative isolate overflow-hidden w-full bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <header className="">
        {eyebrow != null && (          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>        )}
        <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">{<>Colors are cooked, <em className="font-serif italic font-medium">not picked.</em></>}</h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">Measured parts, a real mix, and one click to copy the token.</p>
      </header>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {recipes.map((r, i) => (
          <RecipeCard key={r.id} recipe={r} index={i} total={recipes.length} onPick={onPick} />
        ))}
      </div>
      <p aria-live="polite" className="sr-only">{/* copied announcements ride the button label */}</p>
    </div>
    </section>
  )
}

export { RecipeCard as PaletteRecipeCard }
