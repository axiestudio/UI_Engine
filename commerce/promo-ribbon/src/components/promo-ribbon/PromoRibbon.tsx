import * as React from "react"
import { Tag } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Promo ribbon — a horizontal promo with a code.
// ═══ EMOTION     Limited-time urgency.
// ═══ SIGNATURE   A slim ribbon with a copyable promo code and deadline.

export type PromoRibbonProps = {
  text?: React.ReactNode
  code?: string
  deadline?: string
  tone?: "paper" | "ink"
  className?: string
}

export function PromoRibbon({ text = "Launch week — everything 20% off.", code = "LAUNCH20", deadline = "Ends Sunday", tone = "paper", className }: PromoRibbonProps) {
  const ink = tone === "ink"
  const [copied, setCopied] = React.useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* noop */ }
  }
  return (
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn("flex flex-col items-center justify-between gap-4 rounded-2xl border px-6 py-5 sm:flex-row", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
          <div className="flex items-center gap-3">
            <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", ink ? "bg-background/10" : "bg-accent")}><Tag className="h-4 w-4 text-warning" /></span>
            <div>
              <p className="font-display text-base font-bold">{text}</p>
              {deadline && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{deadline}</p>}
            </div>
          </div>
          <button type="button" onClick={copy} className={cn("rounded-full border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-colors", ink ? "border-background/30" : "border-foreground/30")} aria-label="Copy promo code">
            {copied ? "Copied ✓" : `Code · ${code}`}
          </button>
        </div>
      </InView>
    </SectionShell>
  )
}
