import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, Ordinal } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      turn palette values into a recipe anyone can cook
// ═══ EMOTION  kitchen precision — colors as measured ingredients
// ═══ SIGNATURE recipe cards: ingredient swatches with % measures, a mixed
//               result plate, and "yields" tokens; hover pours the fill
//   SITE      → brand guideline color chapters
//   APP       → theme builders; recipes are data, result is computed
//   A11Y      percentages are text; swatches labeled

export type Ingredient = { name: string; hex: string; parts: number }
export type PaletteRecipe = { id: string; name: string; use: string; ingredients: Ingredient[] }

export type PaletteRecipeProps = {
  recipes?: PaletteRecipe[]
  className?: string
}

const DEFAULT_RECIPES: PaletteRecipe[] = [
  { id: "morning", name: "Morning Rush", use: "Primary CTA", ingredients: [
    { name: "Paper", hex: "#FAF7F2", parts: 62 },
    { name: "Signal Orange", hex: "#E8501E", parts: 30 },
    { name: "Ink", hex: "#121212", parts: 8 },
  ]},
  { id: "ledger", name: "Quiet Ledger", use: "Data surfaces", ingredients: [
    { name: "Paper", hex: "#FAF7F2", parts: 78 },
    { name: "Stone", hex: "#8E8B84", parts: 14 },
    { name: "Ink", hex: "#121212", parts: 8 },
  ]},
  { id: "grove", name: "Back Grove", use: "Success states", ingredients: [
    { name: "Moss", hex: "#4A5D43", parts: 44 },
    { name: "Paper", hex: "#FAF7F2", parts: 40 },
    { name: "Ink", hex: "#121212", parts: 16 },
  ]},
]

function mix(ing: Ingredient[]) {
  // crude additive mix for the result plate
  const total = ing.reduce((s, i) => s + i.parts, 0)
  const rgb = ing.reduce(([r, g, b], i) => {
    const h = i.hex.replace("#", "")
    return [r + parseInt(h.slice(0, 2), 16) * (i.parts / total), g + parseInt(h.slice(2, 4), 16) * (i.parts / total), b + parseInt(h.slice(4, 6), 16) * (i.parts / total)]
  }, [0, 0, 0])
  return `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`.toUpperCase()
}

export function PaletteRecipeCard({ recipe, index }: { recipe: PaletteRecipe; index: number }) {
  const total = recipe.ingredients.reduce((s, i) => s + i.parts, 0)
  const result = mix(recipe.ingredients)
  return (
    <InView once delay={index * 0.08}>
      <article className="group flex h-full flex-col rounded-2xl border bg-card p-6">
        <div className="flex items-start justify-between">
          <Ordinal n={index + 1} total={3} />
          <span className="rounded-full border px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">{recipe.use}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl font-black tracking-tight text-foreground">{recipe.name}</h3>

        <ul className="mt-5 space-y-3">
          {recipe.ingredients.map((ing) => (
            <li key={ing.name}>
              <div className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                <span className="flex items-center gap-2 text-foreground">
                  <span aria-hidden className="size-3.5 rounded-full border" style={{ backgroundColor: ing.hex }} />
                  {ing.name}
                </span>
                <span className="text-muted-foreground">{Math.round((ing.parts / total) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(ing.parts / total) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: ing.hex }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed p-3">
          <motion.span
            aria-hidden
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="size-12 shrink-0 rounded-lg border shadow-inner"
            style={{ backgroundColor: result }}
          />
          <span className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.14em] text-muted-foreground">
            yields <span className="text-foreground">{result}</span><br />token-ready · print-safe
          </span>
        </div>
      </article>
    </InView>
  )
}

export function PaletteRecipes({ recipes = DEFAULT_RECIPES, className }: PaletteRecipeProps) {
  return (
    <SectionShell width={1120} className={className}>
      <MonoLabel className="text-muted-foreground">PALETTE · RECIPES</MonoLabel>
      <h2 className="mt-2 max-w-xl font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        Colors are cooked, <em className="font-serif italic font-medium">not picked.</em>
      </h2>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {recipes.map((r, i) => <PaletteRecipeCard key={r.id} recipe={r} index={i} />)}
      </div>
    </SectionShell>
  )
}
