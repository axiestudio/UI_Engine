import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         RSVP form — a short attendance question form.
// ═══ EMOTION     Friendly confirmation.
// ═══ SIGNATURE   A name/email/attendance form with a confirmation state.

export type RsvpFormProps = {
  eyebrow?: string
  title?: React.ReactNode
  options?: string[]
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function RsvpForm({ eyebrow = "RSVP", title = "Will you make it?", options = ["Yes, count me in", "Maybe", "Can't make it"], cta = "Send RSVP", tone = "paper", className }: RsvpFormProps) {
  const ink = tone === "ink"
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [choice, setChoice] = React.useState(options[0])
  const [sent, setSent] = React.useState(false)
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("rounded-2xl border p-6 sm:p-8", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
          <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
          {sent ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4">
              <Check className="h-5 w-5 text-emerald-600" />
              <p className="font-display font-bold">See you there — {choice}.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={cn("rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring")} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className={cn("rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring")} />
              </div>
              <div className="flex flex-wrap gap-2">
                {options.map((o) => (
                  <button key={o} type="button" onClick={() => setChoice(o)} className={cn("rounded-full border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors", choice === o ? "bg-foreground text-background" : ink ? "hover:bg-background/10" : "hover:bg-accent")}>{o}</button>
                ))}
              </div>
              <Button type="submit" className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button>
            </form>
          )}
        </div>
      </InView>
    </SectionShell>
  )
}
