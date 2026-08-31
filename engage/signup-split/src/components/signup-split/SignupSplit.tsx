import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Signup split — a benefits-led signup beside a short form.
// ═══ EMOTION     Persuasive, low-friction.
// ═══ SIGNATURE   A two-column signup: value props + a compact input form.

export type SignupSplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  points?: string[]
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function SignupSplit({ eyebrow = "JOIN", title = "Start in seconds.", points = ["No card to start", "Every section included", "Cancel anytime"], cta = "Create account", tone = "paper", className }: SignupSplitProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  return (
    <SectionShell tone={tone} width={920} grain={!ink} rule="bottom" className={className}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-[-0.03em] sm:text-4xl">{title}</h2>
            <ul className="mt-6 space-y-2">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm font-medium"><Check className="h-4 w-4 text-emerald-500" /> {p}</li>
              ))}
            </ul>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <form onSubmit={(e) => e.preventDefault()} className={cn("rounded-2xl border p-6", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className={cn("w-full rounded-lg border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring")} />
            <Button type="submit" size="lg" className="mt-3 w-full h-11 rounded-full font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button>
            <p className="mt-3 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By joining you agree to our terms</p>
          </form>
        </InView>
      </div>
    </SectionShell>
  )
}
