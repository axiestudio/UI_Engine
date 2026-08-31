import * as React from "react"
import { Users } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Referral — a share-and-earn invite.
// ═══ EMOTION     Bring a friend.
// ═══ SIGNATURE   A two-for-one offer with a copyable referral link.

export type ReferralProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  amount?: string
  link?: string
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function Referral({ eyebrow = "REFER", title = "Give a month, get a month.", body = "Share your link. When a friend joins, you both get a month free.", amount = "1 month free", link = "https://studio.com/r/you", cta = "Copy link", tone = "paper", className }: ReferralProps) {
  const ink = tone === "ink"
  const [copied, setCopied] = React.useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* noop */ } }
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("rounded-2xl border p-8 text-center", ink ? "border-background/25 bg-background/5" : "border-foreground bg-card")}>
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent"><Users className="h-5 w-5" /></span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
          <p className={cn("mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{body}</p>
          <span className="mt-5 inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 font-display text-lg font-black text-emerald-600">{amount}</span>
          <div className="mt-6 flex items-center justify-center gap-2">
            <code className={cn("truncate rounded-lg border px-3 py-2 text-xs", ink ? "border-background/25" : "border-border")}>{link}</code>
            <Button variant="outline" size="sm" onClick={copy} className="rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{copied ? "Copied ✓" : cta}</Button>
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
