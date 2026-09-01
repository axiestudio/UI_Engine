import * as React from "react"
import { cn } from "@/lib/utils"

import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "@/components/primitives/morphing-popover"
import { InView } from "@/components/primitives/in-view"

export type Term = { term: string; kind: string; definition: string }
export type GlossaryMorphProps = {
  body?: (string | Term)[]
  className?: string
}

const DEFAULT_BODY: (string | Term)[] = [
  "A finishable task starts as a ",
  { term: "unit", kind: "noun · scope", definition: "The smallest piece of work you can demonstrably close in one sitting. If it can't be demoed, it isn't a unit — it's a wish." },
  " that you can ",
  { term: "close", kind: "verb · ritual", definition: "To move a unit from doing to demonstrably done: tested, reviewed, shown to one human who didn't build it." },
  " daily. Closable work compounds into ",
  { term: "momentum", kind: "noun · physics", definition: "The felt sense that finishing is your default state. Built from streaks of closed units, destroyed by one week of drifting scope." },
  " — and momentum is the whole game.",
]

function TermChip({ t, index }: { t: Term; index: number }) {
  return (
    <MorphingPopover>
      <MorphingPopoverTrigger className="rounded-sm border-b border-dotted border-foreground/40 px-0.5 font-semibold text-foreground decoration-transparent underline-offset-4 transition-colors hover:border-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {t.term}
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className="w-[320px] rounded-xl border bg-popover p-5 shadow-lg">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t.kind} · {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="mt-2 font-display text-lg font-bold tracking-tight text-foreground">{t.term}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.definition}</p>
      </MorphingPopoverContent>
    </MorphingPopover>
  )
}

export function GlossaryMorph({ body = DEFAULT_BODY, className }: GlossaryMorphProps) {
  const terms = body.filter((b): b is Term => typeof b !== "string")
  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (760), ["--shell-w" as string]: `${(760)}px` }}>

      <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />GLOSSARY · IN CONTEXT</span>
      <h2 className="mt-2 max-w-[18ch] font-display text-[30px] font-bold leading-[0.98] tracking-tight text-foreground sm:text-[36px]">
        Definitions that <em className="font-serif italic font-medium">meet you mid-sentence.</em>
      </h2>

      <InView once className="mt-8">
        <p className="font-serif text-[18px] font-medium leading-[1.75] text-foreground sm:text-[20px]">
          {body.map((b, i) =>
            typeof b === "string" ? (
              <span key={i}>{b}</span>
            ) : (
              <TermChip key={i} t={b} index={terms.indexOf(b)} />
            )
          )}
        </p>
      </InView>

      <div className="mt-8 flex items-center justify-between border-t pt-4">
        <span className="font-mono text-[11px] font-medium text-muted-foreground">{terms.length} terms · click dotted words</span>
        <span className="hidden font-mono text-[11px] font-medium text-muted-foreground sm:inline">Esc to close</span>
      </div>
    
  </div>
</section>
  )
}
