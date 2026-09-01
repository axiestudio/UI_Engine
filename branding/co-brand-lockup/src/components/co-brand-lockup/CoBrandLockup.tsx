import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { Button } from "@/components/ui/button"

// ═══ JOB      make co-branding a designed moment, not a squash & stretch
// ═══ EMOTION  diplomatic chemistry — two marks that belong together
// ═══ SIGNATURE the two partner marks sit in dashed clear-space frames on a
//               dotted stage and magnetically lean toward each other on
//               hover; the segmented rail re-arranges the lockup (| / × /
//               stacked) and the separator flies between positions on a
//               shared layoutId spring
//   SITE      → partnership pages, sponsor walls
//   APP       → co-marketing asset builders; onLockupChange emits style id
//   BUILD     vendored Magnetic + motion LayoutGroup; shadcn Button rail
//   A11Y      styles are buttons with aria-pressed + roving focus ring;
//             lockup is announced via aria-live; clear-space frames decorative

export type LockupStyle = "bar" | "times" | "stack"

export type CoBrandLockupProps = {
  left?: { name: string; mark?: React.ReactNode }
  right?: { name: string; mark?: React.ReactNode }
  styles?: LockupStyle[]
  /** Show the dashed clear-space frames around each mark. Default true. */
  clearSpace?: boolean
  className?: string
  /** Fires when the active lockup rule changes. */
  onLockupChange?: (s: LockupStyle) => void
}

const STYLE_LABEL: Record<LockupStyle, string> = { bar: "A | B", times: "A × B", stack: "A over B" }

function Mark({ name, mark, showFrame }: { name: string; mark?: React.ReactNode; showFrame: boolean }) {
  return (
    <Magnetic intensity={0.45} range={150} actionArea="parent">
      <div className={cn("flex items-center gap-3", showFrame && "rounded-2xl border border-dashed border-foreground/35 p-4")}>
        <span aria-hidden className="grid size-11 place-items-center rounded-xl border-2 border-foreground bg-background">
          {mark ?? (
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="text-foreground">
              <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="3" />
              <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="font-display text-lg font-black tracking-tight text-foreground">{name}</span>
      </div>
    </Magnetic>
  )
}

function Separator({ style }: { style: LockupStyle }) {
  if (style === "bar") return <motion.span key="sep" aria-hidden layoutId="lockup-sep" className="h-10 w-px bg-foreground" transition={{ type: "spring", stiffness: 280, damping: 26 }} />
  if (style === "times")
    return (
      <motion.span key="sep" aria-hidden layoutId="lockup-sep" className="relative grid size-6 place-items-center" transition={{ type: "spring", stiffness: 280, damping: 26 }}>
        <span className="absolute h-px w-6 rotate-45 bg-foreground" aria-hidden />
        <span className="absolute h-px w-6 -rotate-45 bg-foreground" aria-hidden />
      </motion.span>
    )
  return <motion.span key="sep" aria-hidden layoutId="lockup-sep" className="h-px w-24 bg-foreground" transition={{ type: "spring", stiffness: 280, damping: 26 }} />
}

export function CoBrandLockup({
  left = { name: "NORTHWIND" },
  right = { name: "Meridian" },
  styles = ["bar", "times", "stack"],
  clearSpace = true,
  className,
  onLockupChange,
}: CoBrandLockupProps) {
  const reduced = useReducedMotion()
  const [style, setStyle] = React.useState<LockupStyle>(styles[0] ?? "bar")
  const pick = (s: LockupStyle) => {
    setStyle(s)
    onLockupChange?.(s)
  }

  return (
    <section className={cn("bg-background text-foreground", className)>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <header className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">CO-BRAND · LOCKUP RULES</span>
        <h2 className="mt-2 tracking-tight text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">Two marks, one handshake.</h2>
        <p className="mt-2.5 text-sm leading-6 text-muted-foreground">Switch the rule — the lockup rearranges itself and the separator does the walking.</p>
      </header>

      {/* stage */}
      <InView once className="mt-10">
        <LayoutGroup>
          <div className="relative grid min-h-[240px] place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/20 p-8 sm:p-12">
            <motion.div
              layout={!reduced}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className={cn("relative", style === "stack" ? "flex flex-col items-center gap-5" : "flex items-center gap-8 sm:gap-12")}
            >
              <Mark name={left.name} mark={left.mark} showFrame={clearSpace} />
              <Separator style={style} />
              <Mark name={right.name} mark={right.mark} showFrame={clearSpace} />
            </motion.div>
          </div>
        </LayoutGroup>
      </InView>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Lockup style">
        {styles.map((s) => (
          <Button
            key={s}
            type="button"
            variant={style === s ? "default" : "outline"}
            size="sm"
            aria-pressed={style === s}
            onClick={() => pick(s)}
            className="rounded-full font-mono text-[10px] font-black uppercase tracking-[0.16em] tabular-nums"
          >
            {STYLE_LABEL[s]}
          </Button>
        ))}
      </div>

      <p aria-live="polite" className="sr-only">
        {`Lockup style: ${STYLE_LABEL[style]}.`}
      </p>

      <p className="mt-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        min gap = 1 glyph unit · never recolor a partner mark
      </p>
    </div>
    </section>
  )
}
