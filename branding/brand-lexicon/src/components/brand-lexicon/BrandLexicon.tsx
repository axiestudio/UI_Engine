import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { CornerDownLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { TextLoop } from "@/components/primitives/text-loop"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      define brand vocabulary with authority
// ═══ EMOTION  a dictionary that reads like a manifesto
// ═══ SIGNATURE flip-card lexicon — one toggle button per term: the front
//               is letterpress (ink offset shadow) with the pronunciation
//               looping; pressing turns the card to a serif-italic usage
//               sentence on the reverse. Reduced motion = instant flip.
//   SITE      → brand guideline language chapter, culture pages
//   APP       → glossary widgets; terms are data
//   BUILD     handcraft shell + vendored TextLoop; single accessible toggle
//             button per card (previous version stacked two focusable
//             buttons and had no focus ring)
//   A11Y      full text (term, ipa, meaning, usage) readable in both states;
//             aria-pressed communicates the flip; focus-visible ring styled

export type LexiconEntry = { term: string; ipa: string; meaning: string; usage: string }

export type BrandLexiconProps = {
  entries?: LexiconEntry[]
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  className?: string
}

const DEFAULT_ENTRIES: LexiconEntry[] = [
  { term: "Finish", ipa: "/ˈfɪnɪʃ/", meaning: "v. — to bring work to its intended edge, then stop.", usage: "“We finish. That is the whole trick.”" },
  { term: "Quiet", ipa: "/ˈkwaɪət/", meaning: "adj. — confident enough to lower the volume.", usage: "“Loud is easy. Quiet is designed.”" },
  { term: "Receipts", ipa: "/rɪˈsiːts/", meaning: "n. — proof attached to every promise.", usage: "“Show the receipts, then the price.”" },
  { term: "Hand", ipa: "/hænd/", meaning: "n. — the person on the other side of the tool.", usage: "“Built for the hand, not the demo.”" },
]

function Entry({ entry, index }: { entry: LexiconEntry; index: number }) {
  const reduced = useReducedMotion()
  const [flipped, setFlipped] = React.useState(false)

  return (
    <InView once delay={index * 0.06} className="h-full">
      <motion.div
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d", transformPerspective: 1000 }}
        className="relative h-[240px]"
      >
        <motion.button
          type="button"
          aria-pressed={flipped}
          onClick={() => setFlipped((f) => !f)}
          whileTap={reduced ? undefined : { scale: 0.98 }}
          className="group absolute inset-0 w-full cursor-pointer rounded-xl border-2 border-foreground bg-background text-left outline-none shadow-[5px_5px_0_0_hsl(var(--foreground))] [backface-visibility:hidden] focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex h-full flex-col justify-between p-5">
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-display text-3xl font-black tracking-tight text-foreground">{entry.term}</span>
              <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground text-foreground/40">{String(index + 1).padStart(2, "0")}<span className="opacity-50"> / {String(4).padStart(2, "0")}</span></span>
            </span>
            <TextLoop interval={2.4} className="font-mono text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
              <span>{entry.ipa}</span>
              <span>tap for usage →</span>
            </TextLoop>
            <span className="text-[13px] leading-relaxed text-muted-foreground">{entry.meaning}</span>
          </span>
        </motion.button>

        {/* reverse face — real text, kept out of the a11y tree until shown */}
        <motion.span
          aria-hidden={!flipped}
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          className="absolute inset-0 flex w-full select-none flex-col justify-between rounded-xl border-2 border-foreground bg-foreground p-5 text-left text-background [backface-visibility:hidden]"
        >
          <span className="flex items-center justify-between">
            <Badge variant="outline" className="rounded-full border-background/40 bg-transparent font-mono text-[9px] font-black uppercase tracking-[0.2em] text-background/70">
              in a sentence
            </Badge>
            <span className="font-display text-sm font-black tracking-tight">{entry.term}</span>
          </span>
          <span className="font-serif text-xl italic leading-snug">{entry.usage}</span>
          <span className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-background/70">
            <CornerDownLeft className="size-3" aria-hidden /> back to term
          </span>
        </motion.span>
      </motion.div>
    </InView>
  )
}

export function BrandLexicon({
  entries = DEFAULT_ENTRIES,
  eyebrow = "LEXICON · HOW WE TALK",
  title = (
    <>
      Words we chose <em className="font-serif text-[0.98em] font-medium italic">on purpose.</em>
    </>
  ),
  subtitle = "Turn a card to read the term in the wild.",
  className,
}: BrandLexiconProps) {
  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
            <header className="">
        {eyebrow != null && (          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>        )}
        <h2 className="mt-2 tracking-tight text-3xl font-bold tracking-tight sm:text-4xl text-foreground">{title}</h2>
        {subtitle != null && (          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>        )}
      </header>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((e, i) => (
          <Entry key={e.term} entry={e} index={i} />
        ))}
      </div>
    </div>
    </section>
  )
}
