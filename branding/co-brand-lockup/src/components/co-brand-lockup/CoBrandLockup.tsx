import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { Magnetic } from "@/components/primitives/magnetic"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make co-branding a designed moment, not a squash & stretch
// ═══ EMOTION  diplomatic chemistry — two marks that belong together
// ═══ SIGNATURE the two partner marks magnetically pull toward each other
//               on hover and click-locks a lockup style (| / × / stacked)
//   SITE      → partnership pages, sponsor walls
//   APP       → co-marketing asset builders; onLockup emits style id
//   A11Y      radiogroup for lockup styles; marks are labeled buttons

export type LockupStyle = "bar" | "times" | "stack"

export type CoBrandLockupProps = {
  left?: string
  right?: string
  styles?: LockupStyle[]
  className?: string
  onLockupChange?: (s: LockupStyle) => void
}

function Mark({ label, side }: { label: string; side: "left" | "right" }) {
  return (
    <Magnetic intensity={0.5} range={140} actionArea="parent">
      <div className={cn("flex items-center gap-2", side === "right" && "flex-row-reverse")}>
        <span aria-hidden className="grid size-11 place-items-center rounded-xl border-2 border-foreground">
          <svg width="20" height="20" viewBox="0 0 48 48" fill="none" className="text-foreground">
            <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="3" />
            <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className={cn("font-display text-lg font-black tracking-tight text-foreground", side === "right" && "text-right")}>{label}</span>
      </div>
    </Magnetic>
  )
}

export function CoBrandLockup({ left = "NORTHWIND", right = "Meridian", styles = ["bar", "times", "stack"], className, onLockupChange }: CoBrandLockupProps) {
  const [style, setStyle] = React.useState<LockupStyle>("bar")
  const pick = (s: LockupStyle) => { setStyle(s); onLockupChange?.(s) }

  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">CO-BRAND · LOCKUP RULES</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Two marks, one handshake.</h2>

      {/* stage */}
      <InView once className="mt-10">
        <div className="grid min-h-[220px] place-items-center rounded-2xl border border-dashed border-border bg-muted/20 p-8">
          {style === "stack" ? (
            <div className="flex flex-col items-center gap-4">
              <Mark label={left} side="left" />
              <motion.span layoutId="lockup-sep" className="h-px w-24 bg-foreground" />
              <Mark label={right} side="left" />
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Mark label={left} side="left" />
              {style === "bar" ? (
                <motion.span layoutId="lockup-sep" className="h-10 w-px bg-foreground" />
              ) : (
                <motion.span layoutId="lockup-sep" className="relative grid size-6 place-items-center">
                  <span className="absolute h-px w-6 rotate-45 bg-foreground" aria-hidden />
                  <span className="absolute h-px w-6 -rotate-45 bg-foreground" aria-hidden />
                </motion.span>
              )}
              <Mark label={right} side="right" />
            </div>
          )}
        </div>
      </InView>

      <div role="radiogroup" aria-label="Lockup style" className="mt-8 flex flex-wrap justify-center gap-2">
        {styles.map((s) => (
          <button key={s} role="radio" aria-checked={style === s} onClick={() => pick(s)}
            className={cn("rounded-full border px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] transition-colors",
              style === s ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground hover:border-foreground/40")}>
            {s === "bar" ? "A | B" : s === "times" ? "A × B" : "A over B"}
          </button>
        ))}
      </div>
      <p className="mt-6 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">min gap = 1 glyph unit · never recolor a partner mark</p>
    </SectionShell>
  )
}
