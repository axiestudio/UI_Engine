import * as React from "react"
import { Heart } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Loyalty CTA — a return-customer call to action.
// ═══ EMOTION     Reward the repeat.
// ═══ SIGNATURE   A loyalty invite with a points / reward preview.

export type LoyaltyCtaProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  points?: string
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function LoyaltyCta({ eyebrow = "REWARDS", title = "Come back and earn.", body = "Points on every section you ship, redeemable for the next one.", points = "1,240 pts", cta = "Join the club", tone = "paper", className }: LoyaltyCtaProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("relative overflow-hidden rounded-2xl border p-10 text-center", ink ? "border-background/25 bg-background/5" : "border-border bg-card")}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10">
            <Heart className="h-6 w-6 text-rose-500" />
          </span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">{title}</h2>
          <p className={cn("mx-auto mt-3 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/75" : "text-muted-foreground")}>{body}</p>
          {points && <p className="mt-6 inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 font-display text-lg font-black text-emerald-600">{points}</p>}
          <div className="mt-6"><Button size="lg" className="h-11 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button></div>
        </div>
      </InView>
    </SectionShell>
  )
}
