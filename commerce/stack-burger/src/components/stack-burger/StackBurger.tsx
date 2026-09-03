import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The layer components — each one is its own import, exactly like the
// sandwich logic: bun, lettuce, tomato, cheese, patty, base.
import { BunTop } from "./layers/BunTop"
import { Lettuce } from "./layers/Lettuce"
import { Tomato } from "./layers/Tomato"
import { Cheese } from "./layers/Cheese"
import { Patty } from "./layers/Patty"
import { BunBottom } from "./layers/BunBottom"

// ═══ JOB         Prove the layer architecture with a stack you can edit.
// ═══ EMOTION     Playful control — building your own order.
// ═══ SIGNATURE   Every ingredient is a separate component; toggling a chip
//                 springs the layer in or out of the physical stack, and the
//                 whole thing re-settles like a real sandwich being rebuilt.

export type BurgerLayerId = "bunTop" | "lettuce" | "tomato" | "cheese" | "patty" | "bunBottom"

export type StackBurgerProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Ingredient layers present on mount, top of stack first. */
  initialLayers?: BurgerLayerId[]
  /** Fixed width of the stack in px (max 360). */
  width?: number
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const LAYERS: Record<BurgerLayerId, { label: string; node: () => React.ReactNode }> = {
  bunTop: { label: "Bun top", node: () => <BunTop /> },
  lettuce: { label: "Lettuce", node: () => <Lettuce /> },
  tomato: { label: "Tomato", node: () => <Tomato /> },
  cheese: { label: "Cheese", node: () => <Cheese /> },
  patty: { label: "Patty", node: () => <Patty /> },
  bunBottom: { label: "Bun base", node: () => <BunBottom /> },
}

const STACK_ORDER: BurgerLayerId[] = ["bunTop", "lettuce", "tomato", "cheese", "patty", "bunBottom"]

export function StackBurger({
  eyebrow = "STACK · BURGER",
  title = "Every layer is a component.",
  subtitle = "Toggle the ingredients — each one is its own import, and the stack springs back into shape. Bun, lettuce, tomato, cheese, patty, base: six components, one sandwich.",
  initialLayers = ["bunTop", "lettuce", "tomato", "cheese", "patty", "bunBottom"],
  width = 300,
  caption = "SIX COMPONENTS · ONE STACK",
  tone = "paper",
  className,
}: StackBurgerProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const [active, setActive] = React.useState<BurgerLayerId[]>(initialLayers)

  const toggle = (id: BurgerLayerId) =>
    setActive((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]))

  const visible = STACK_ORDER.filter((id) => active.includes(id))
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
          {/* ── The stack ── */}
          <div className="flex justify-center">
            <motion.div
              layout={!reduce}
              role="img"
              aria-label={`Burger stack with ${visible.map((id) => LAYERS[id].label.toLowerCase()).join(", ") || "nothing"}`}
              className="relative drop-shadow-[0_28px_24px_hsl(var(--foreground)/0.18)]"
              style={{ width: Math.min(width, 360) }}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {visible.map((id, i) => (
                  <motion.div
                    layout={!reduce}
                    key={id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -46, scale: 1.06 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, y: -30, scale: 0.94 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24, delay: reduce ? 0 : i * 0.03 }}
                    className="relative z-[1]"
                  >
                    {LAYERS[id].node()}
                  </motion.div>
                ))}
              </AnimatePresence>
              {visible.length === 0 && (
                <p className={cn("grid h-24 place-items-center rounded-xl border border-dashed font-mono text-[11px] uppercase tracking-[0.2em]", ink ? "border-background/25 text-background/50" : "border-border text-muted-foreground")}>
                  an empty plate
                </p>
              )}
            </motion.div>
          </div>

          {/* ── Ingredient chips ── */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Ingredients">
            {STACK_ORDER.map((id) => {
              const on = active.includes(id)
              return (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant="outline"
                  aria-pressed={on}
                  onClick={() => toggle(id)}
                  className={cn(
                    "h-8 rounded-full px-3.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
                    on
                      ? ink
                        ? "border-background bg-background text-foreground hover:bg-background/90"
                        : "border-foreground bg-foreground text-background hover:bg-foreground/90"
                      : ink
                        ? "border-background/25 text-background/60 hover:border-background/50"
                        : "border-border text-muted-foreground hover:border-muted-foreground/60",
                  )}
                >
                  {LAYERS[id].label}
                </Button>
              )
            })}
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                hair,
                ink ? "text-background/55" : "text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden className="tabular-nums">{String(active.length).padStart(2, "0")} / 06</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
