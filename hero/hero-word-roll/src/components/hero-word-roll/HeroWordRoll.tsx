import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { TextRoll } from "@/components/primitives/text-roll"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Word-roll hero — the headline cycles one word at a time.
// ═══ EMOTION     Kinetic, restless.
// ═══ SIGNATURE   A multi-word hero where a highlighted word rolls (TextRoll) on a timer.

export type HeroWordRollProps = {
  eyebrow?: string
  lead?: string
  words?: string[]
  tail?: string
  subtitle?: React.ReactNode
  cta?: { label: string; href?: string }
  tone?: "paper" | "ink"
  className?: string
}

export function HeroWordRoll({
  eyebrow = "ROLL",
  lead = "Sections that",
  words = ["ship.", "scale.", "convert.", "endure."],
  tail = "fast.",
  subtitle = "A headline that cycles through what your build needs most, one rolling word at a time.",
  cta = { label: "Start building", href: "#" },
  tone = "paper",
  className,
}: HeroWordRollProps) {
  const ink = tone === "ink"
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % words.length), 2600)
    return () => clearInterval(t)
  }, [words.length])
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.98] tracking-[-0.035em] sm:text-7xl">
            {lead}{" "}
            <span className={cn("inline-block text-transparent", ink ? "bg-clip-text" : "bg-clip-text")}
              style={{ backgroundImage: `linear-gradient(105deg, hsl(var(--site-accent)), hsl(var(--site-accent-2)))` }}>
              <TextRoll
                key={idx}
                duration={0.5}
                getEnterDelay={(i) => i * 0.08}
                transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
              >
                {words[idx]}
              </TextRoll>
            </span>{" "}
            {tail}
          </h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}>
          <p className={cn("mt-6 max-w-xl text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{subtitle}</p>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}>
          <div className="mt-8">
            <Button size="lg" onClick={() => { if (cta.href) window.location.href = cta.href }} className="h-12 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">
              {cta.label}
            </Button>
          </div>
        </InView>
      </div>
    </section>
  )
}
