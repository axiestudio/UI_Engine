import * as React from "react"
import { Lock } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Invite gate — a members-only invite wall.
// ═══ EMOTION     Exclusivity.
// ═══ SIGNATURE   A locked / invite-only panel with an email request.

export type InviteGateProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function InviteGate({ eyebrow = "INVITE ONLY", title = "This part is by invite.", body = "Request access and we'll send a key when a spot opens up.", cta = "Request access", tone = "paper", className }: InviteGateProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("relative overflow-hidden rounded-2xl border p-10 text-center", ink ? "border-background/25 bg-background/5" : "border-foreground bg-card")}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent"><Lock className="h-5 w-5" /></span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
          <p className={cn("mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{body}</p>
          {sent ? (
            <p className="mt-6 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-600">Request received ✓</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="mx-auto mt-6 flex max-w-sm gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className={cn("w-full rounded-full border bg-background px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", ink ? "border-background/25 text-background" : "border-border")} />
              <Button type="submit" className="shrink-0 rounded-full px-5 font-mono text-[10px] font-bold uppercase tracking-widest">{cta}</Button>
            </form>
          )}
        </div>
      </InView>
    </SectionShell>
  )
}
