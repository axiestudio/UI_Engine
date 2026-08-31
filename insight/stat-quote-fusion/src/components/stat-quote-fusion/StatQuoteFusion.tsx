import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, CornerTicks } from "@/components/primitives/handcraft"
import { AnimatedNumber } from "@/components/primitives/animated-number"

export type StatQuoteFusionProps = {
  eyebrow?: string
  stat: { value: number; suffix?: string; caption: string }
  quote: string
  attribution?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULTS = {
  stat: { value: 340000, suffix: "+", caption: "hours of manual work erased since 2024" },
  quote: "We got our Fridays back. Every single one of them.",
  attribution: "Dana Okafor · Operations lead, Cartwheel",
}

export function StatQuoteFusion({
  eyebrow = "IMPACT · PROOF",
  stat = DEFAULTS.stat,
  quote = DEFAULTS.quote,
  attribution = DEFAULTS.attribution,
  tone = "ink",
  className,
}: StatQuoteFusionProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <SectionShell width={920} tone={tone} grain padding="roomy" className={cn(ink && "text-background", className)}>
      <CornerTicks className={ink ? "text-background/20" : "text-foreground/10"} size={10} offset={14} />

      <MonoLabel className={ink ? "text-background/60" : "text-muted-foreground"}>{eyebrow}</MonoLabel>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.05fr_1.4fr]">
        {/* stat */}
        <div className="relative">
          <p className="font-display text-[46px] font-semibold leading-[0.9] tracking-[-0.032em] sm:text-[54px] lg:text-[58px]">
            <span className="sr-only">{stat.value.toLocaleString()}{stat.suffix ?? ""} — {stat.caption}</span>
            <span aria-hidden className={ink ? "text-background" : "text-foreground"}>
              <AnimatedNumber value={stat.value} springOptions={{ stiffness: 90, damping: 22 }} />
              <span className={ink ? "text-background" : "text-foreground"}>{stat.suffix}</span>
            </span>
          </p>
          <p className={cn("mt-3 max-w-[28ch] font-mono text-[11px] font-semibold uppercase leading-5 tracking-[0.08em]", ink ? "text-background/65" : "text-muted-foreground")}>
            {stat.caption}
          </p>
          <span aria-hidden className="mt-4 block h-px w-12 bg-current opacity-20" />
        </div>

        {/* quote */}
        <blockquote className="relative">
          <span aria-hidden className="absolute -left-3 -top-6 select-none font-serif text-[64px] leading-none opacity-10">“</span>
          <p className={cn("relative font-display text-[22px] font-medium leading-[1.45] tracking-[-0.015em] sm:text-[26px]", ink ? "text-background" : "text-foreground")}>
            {reduce ? (
              <span>{quote}</span>
            ) : (
              quote.split(" ").map((w, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.38, delay: 0.18 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  {w}&nbsp;
                </motion.span>
              ))
            )}
          </p>
          {attribution && (
            <footer className={cn("mt-5 flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]", ink ? "text-background/60" : "text-muted-foreground")}>
              <span aria-hidden className="h-px w-8 bg-current opacity-30" />
              {attribution}
            </footer>
          )}
        </blockquote>
      </div>
    </SectionShell>
  )
}
