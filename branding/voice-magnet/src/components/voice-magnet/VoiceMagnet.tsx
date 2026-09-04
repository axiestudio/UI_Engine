import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      define the voice: what we say, what we never say
// ═══ EMOTION  conviction — a brand that knows its own mouth
// ═══ SIGNATURE magnetic flip coins: the card drifts toward the cursor,
//               and one press turns it — the front is letterpress "We say",
//               the ink reverse is "We don't" with the line struck through.
//               Reduced motion flips instantly. Both verdicts stay readable.
//   SITE      → about/brand pages, culture decks
//   APP       → tone checker tools; pairs are data
//   BUILD     one accessible toggle button per coin (the old build stacked
//             two focusable faces); destructive/primary tokens for the
//             verdicts — no rogue emerald/red palette colours
//   A11Y      single aria-pressed button announces the flip; reverse face
//             is aria-hidden when hidden; focus ring rides the coin

export type VoicePair = { say: string; dont: string }

export type VoiceMagnetProps = {
  pairs?: VoicePair[]
  eyebrow?: string
  title?: React.ReactNode
  className?: string
  onFlip?: (pair: VoicePair, showing: "say" | "dont") => void
}

const DEFAULT_PAIRS: VoicePair[] = [
  { say: "We ship on Friday.", dont: "Synergizing deliverables by EOD." },
  { say: "It broke. Here's the fix.", dont: "An unexpected opportunity emerged." },
  { say: "Made for the 5% who care.", dont: "Best-in-class world-class solution." },
  { say: "Ask us anything.", dont: "Please hold for the next agent." },
]

function Coin({ pair, index, onFlip }: { pair: VoicePair; index: number; onFlip?: VoiceMagnetProps["onFlip"] }) {
  const reduced = useReducedMotion()
  const [flipped, setFlipped] = React.useState(false)

  const turn = () => {
    setFlipped((f) => {
      const next = !f
      onFlip?.(pair, next ? "dont" : "say")
      return next
    })
  }

  return (
    <InView once delay={index * 0.08} className="h-full">
      <Magnetic intensity={0.3} range={130}>
        <motion.div
          initial={false}
          animate={{ rotateX: flipped ? 180 : 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformStyle: "preserve-3d", transformPerspective: 900 }}
          className="relative h-[190px]"
        >
          <Button variant="ghost"
            aria-pressed={flipped}
            aria-label={`${pair.say} We say. Press to show what we never say.`}
            onClick={turn}
            className="absolute inset-0 w-full cursor-pointer rounded-xl outline-none [backface-visibility:hidden] focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span className="flex h-full w-full flex-col justify-between rounded-xl border-2 border-foreground bg-background p-5 text-left shadow-[6px_6px_0_0_hsl(var(--foreground))] transition-[transform,box-shadow] duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_0_hsl(var(--foreground))]">
              <span>
                <Badge className="gap-1.5 rounded-full bg-primary font-mono text-[9px] font-black uppercase tracking-[0.2em] text-primary-foreground">
                  <Check className="size-3" aria-hidden /> We say
                </Badge>
              </span>
              <span className="font-display text-lg font-bold leading-snug tracking-tight text-foreground">{pair.say}</span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">tap the coin</span>
            </span>
          </Button>

          <span
            aria-hidden={!flipped}
            style={{ transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}
            className="pointer-events-none absolute inset-0 flex flex-col justify-between rounded-xl border-2 border-destructive/50 bg-foreground p-5 text-left"
          >
            <span>
              <Badge variant="destructive" className="gap-1.5 rounded-full font-mono text-[9px] font-black uppercase tracking-[0.2em]">
                <X className="size-3" aria-hidden /> We don't
              </Badge>
            </span>
            <span className="font-display text-lg font-bold leading-snug tracking-tight text-background/80 line-through decoration-destructive decoration-2 underline-offset-4">{pair.dont}</span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-background/45">the anti-voice · tap again</span>
          </span>
        </motion.div>
      </Magnetic>
    </InView>
  )
}

export function VoiceMagnet({
  pairs = DEFAULT_PAIRS,
  eyebrow = "VOICE · SAY / DON'T",
  title = <>The words are the brand. <em className="font-serif italic font-medium">Guard them like keys.</em></>,
  className,
  onFlip,
}: VoiceMagnetProps) {
  return (
    <section className="relative isolate overflow-hidden w-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <header className="">
          {eyebrow != null && (            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>          )}
          <h2 className="mt-2 tracking-tight text-4xl font-bold tracking-tight sm:text-5xl text-foreground">{title}</h2>
          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">Every coin holds a promise and its opposite. Turn them.</p>
        </header>
        <p className="mb-1 hidden sm:block">
          <Badge variant="outline" className="rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {pairs.length} pairs · {new Set(pairs.map((p) => p.say)).size} vows
          </Badge>
        </p>
      </div>
      <div className="mt-12 grid gap-6 pt-6 sm:grid-cols-2">
        {pairs.map((p, i) => (
          <Coin key={p.say} pair={p} index={i} onFlip={onFlip} />
        ))}
      </div>
    </div>
    </section>
  )
}
