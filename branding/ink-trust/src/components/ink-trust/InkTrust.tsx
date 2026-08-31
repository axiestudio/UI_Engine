import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, CornerTicks } from "@/components/primitives/handcraft"
import { TextEffect } from "@/components/primitives/text-effect"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      make the manifesto land as one unbroken voice
// ═══ EMOTION  held breath, then agreement — ink on paper
// ═══ SIGNATURE an inverted ink band: the manifesto reveals word-by-word
//               (TextEffect) over grain; a letterpress sign-off closes it
//   SITE      → manifesto/about chapters, campaign pages
//   APP       → values onboarding splash
//   A11Y      full text present for AT; reduce-motion = static text

export type InkTrustProps = {
  statement?: string
  signoff?: string
  className?: string
}

export function InkTrust({ statement = "We would rather lose a deal than ship work we wouldn't sign. Every pixel here was argued for, drawn twice, and finished once.", signoff = "— the partners, in ink", className }: InkTrustProps) {
  return (
    <SectionShell width={760} tone="ink" grain padding="grand" className={cn("text-background", className)}>
      <CornerTicks corners={["tl", "br"]} className="text-background/30" />
      <MonoLabel className="text-background/50">MANIFESTO · IN INK</MonoLabel>
      <InView once className="mt-8">
        <TextEffect
          per="word"
          as="p"
          preset="blur"
          speedReveal={1.6}
          className="font-serif text-[26px] font-medium italic leading-[1.5] sm:text-[34px]"
        >
          {statement}
        </TextEffect>
      </InView>
      <div className="mt-12 flex items-center gap-4">
        <span aria-hidden className="h-px w-14 bg-background/40" />
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-background/60">{signoff}</span>
      </div>
      {/* letterpress seal */}
      <motion.div
        initial={false}
        whileHover={{ rotate: -6 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        aria-hidden
        className="mt-10 grid size-20 place-items-center rounded-full border-2 border-background/50"
      >
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-background/70">signed · sealed</span>
      </motion.div>
    </SectionShell>
  )
}
