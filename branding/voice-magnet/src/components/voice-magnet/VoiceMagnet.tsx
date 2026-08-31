import * as React from "react"
import { motion } from "motion/react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { Magnetic } from "@/components/primitives/magnetic"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      define the voice: what we say, what we never say
// ═══ EMOTION  conviction — a brand that knows its own mouth
// ═══ SIGNATURE magnetic flip coins: one side "WE SAY", the other
//               "WE DON'T"; they lean toward your cursor before flipping
//   SITE      → about/brand pages, culture decks
//   APP       → tone checker tools; pairs are data
//   A11Y      buttons with aria-pressed; text readable in both states

export type VoicePair = { say: string; dont: string }

export type VoiceMagnetProps = {
  pairs?: VoicePair[]
  className?: string
}

const DEFAULT_PAIRS: VoicePair[] = [
  { say: "We ship on Friday.", dont: "Synergizing deliverables by EOD." },
  { say: "It broke. Here's the fix.", dont: "An unexpected opportunity emerged." },
  { say: "Made for the 5% who care.", dont: "Best-in-class world-class solution." },
  { say: "Ask us anything.", dont: "Please hold for the next agent." },
]

function Coin({ pair, index }: { pair: VoicePair; index: number }) {
  const [flipped, setFlipped] = React.useState(false)
  return (
    <InView once delay={index * 0.08}>
      <motion.div
        initial={false}
        animate={{ rotateX: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d", transformPerspective: 900 }}
        className="relative h-[190px]"
      >
        <Magnetic strength={0.18}>
          <button
            type="button"
            aria-pressed={flipped}
            onClick={() => setFlipped((f) => !f)}
            className="group absolute inset-0 w-full [backface-visibility:hidden]"
          >
            <span className={cn("flex h-full w-full flex-col justify-between rounded-xl border-2 border-foreground bg-background p-5 text-left",
              "shadow-[6px_6px_0_0_hsl(var(--foreground))] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[8px_8px_0_0_hsl(var(--foreground))]")}>
              <span className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
                <Check className="size-3.5" aria-hidden /> We say
              </span>
              <span className="font-display text-lg font-bold leading-snug text-foreground">{pair.say}</span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">tap to flip</span>
            </span>
          </button>
          <button
            type="button"
            aria-pressed={flipped}
            onClick={() => setFlipped((f) => !f)}
            style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
            className="absolute inset-0 w-full"
          >
            <span className={cn("flex h-full w-full flex-col justify-between rounded-xl border-2 border-border bg-muted/50 p-5 text-left")}>
              <span className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-red-700 dark:text-red-400">
                <X className="size-3.5" aria-hidden /> We don't
              </span>
              <span className="font-display text-lg font-bold leading-snug text-muted-foreground line-through decoration-red-500/60 decoration-2">{pair.dont}</span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">tap to flip back</span>
            </span>
          </button>
        </Magnetic>
      </motion.div>
    </InView>
  )
}

export function VoiceMagnet({ pairs = DEFAULT_PAIRS, className }: VoiceMagnetProps) {
  return (
    <SectionShell width={1120} rails className={className}>
      <MonoLabel className="text-muted-foreground">VOICE · SAY / DON'T</MonoLabel>
      <h2 className="mt-2 max-w-2xl font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        The words are the brand. <em className="font-serif italic font-medium">Guard them like keys.</em>
      </h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {pairs.map((p, i) => <Coin key={p.say} pair={p} index={i} />)}
      </div>
    </SectionShell>
  )
}
