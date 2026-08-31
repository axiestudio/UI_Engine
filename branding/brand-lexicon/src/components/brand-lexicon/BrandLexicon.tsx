import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { TextLoop } from "@/components/primitives/text-loop"

// ═══ JOB      define brand vocabulary with authority
// ═══ EMOTION  a dictionary that reads like a manifesto
// ═══ SIGNATURE flip-card lexicon: front = term in display type with a
//               looping pronunciation line; back = usage in a sentence
//   SITE      → brand guideline language chapter, culture pages
//   APP       → glossary widgets; terms are data
//   A11Y      buttons with aria-pressed; both faces are real text

export type LexiconEntry = { term: string; ipa: string; meaning: string; usage: string }

export type BrandLexiconProps = {
  entries?: LexiconEntry[]
  className?: string
}

const DEFAULT_ENTRIES: LexiconEntry[] = [
  { term: "Finish", ipa: "/ˈfɪnɪʃ/", meaning: "v. — to bring work to its intended edge, then stop.", usage: "“We finish. That is the whole trick.”" },
  { term: "Quiet", ipa: "/ˈkwaɪət/", meaning: "adj. — confident enough to lower the volume.", usage: "“Loud is easy. Quiet is designed.”" },
  { term: "Receipts", ipa: "/rɪˈsiːts/", meaning: "n. — proof attached to every promise.", usage: "“Show the receipts, then the price.”" },
  { term: "Hand", ipa: "/hænd/", meaning: "n. — the person on the other side of the tool.", usage: "“Built for the hand, not the demo.”" },
]

function Entry({ entry, index }: { entry: LexiconEntry; index: number }) {
  const [flipped, setFlipped] = React.useState(false)
  return (
    <InView once delay={index * 0.06}>
      <motion.div
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformStyle: "preserve-3d", transformPerspective: 1000 }}
        className="relative h-[240px]"
      >
        <button type="button" aria-pressed={flipped} aria-label={`Term ${entry.term}. Activate for usage.`}
          onClick={() => setFlipped((f) => !f)}
          className="absolute inset-0 flex w-full flex-col justify-between rounded-xl border-2 border-foreground bg-background p-5 text-left shadow-[5px_5px_0_0_hsl(var(--foreground))] [backface-visibility:hidden]">
          <span className="flex items-baseline justify-between">
            <span className="font-display text-3xl font-black tracking-tight text-foreground">{entry.term}</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
          </span>
          <TextLoop interval={2.4} className="font-mono text-[11px] font-bold tracking-[0.08em] text-muted-foreground">
            <span>{entry.ipa}</span>
            <span>tap for usage →</span>
          </TextLoop>
          <span className="text-[13px] leading-relaxed text-muted-foreground">{entry.meaning}</span>
        </button>
        <button type="button" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
          className="absolute inset-0 flex w-full flex-col justify-between rounded-xl border-2 border-border bg-muted/40 p-5 text-left">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">in a sentence</span>
          <span className="font-serif text-xl italic leading-snug text-foreground">{entry.usage}</span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">← back to term</span>
        </button>
      </motion.div>
    </InView>
  )
}

export function BrandLexicon({ entries = DEFAULT_ENTRIES, className }: BrandLexiconProps) {
  return (
    <SectionShell width={1120} rails className={className}>
      <MonoLabel className="text-muted-foreground">LEXICON · HOW WE TALK</MonoLabel>
      <h2 className="mt-2 font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        Words we chose <em className="font-serif italic font-medium">on purpose.</em>
      </h2>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((e, i) => <Entry key={e.term} entry={e} index={i} />)}
      </div>
    </SectionShell>
  )
}
