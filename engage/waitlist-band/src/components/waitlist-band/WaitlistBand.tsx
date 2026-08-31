import * as React from "react"
import { Clock } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Waitlist band — a count of people ahead + a join CTA.
// ═══ EMOTION     Momentum, scarcity.
// ═══ SIGNATURE   A waitlist with a live count and single join action.

export type WaitlistBandProps = {
  eyebrow?: string
  title?: React.ReactNode
  count?: number
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function WaitlistBand({ eyebrow = "WAITLIST", title = "You're early — that's the point.", count = 1280, cta = "Join the waitlist", tone = "paper", className }: WaitlistBandProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [joined, setJoined] = React.useState(false)
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("rounded-2xl border p-8 text-center sm:p-10", ink ? "border-background/25 bg-background/5" : "border-foreground bg-card")}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent"><Clock className="h-5 w-5" /></span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-4xl">{title}</h2>
          <p className="mt-4 font-display text-4xl font-black tabular-nums">{count.toLocaleString()}<span className="text-lg font-medium text-muted-foreground"> already in</span></p>
          {joined ? (
            <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-600">You're on the list ✓</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setJoined(true) }} className="mx-auto mt-6 flex max-w-sm gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className={cn("w-full rounded-full border bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", ink ? "border-background/25 text-background" : "border-border")} />
              <Button type="submit" className="shrink-0 rounded-full px-5 font-mono text-[10px] font-bold uppercase tracking-widest">{cta}</Button>
            </form>
          )}
        </div>
      </InView>
    </SectionShell>
  )
}
