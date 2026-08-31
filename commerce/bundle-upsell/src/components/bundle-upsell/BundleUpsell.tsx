import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Bundle upsell — add more to the cart in one move.
// ═══ EMOTION     A friendly nudge, not a hard sell.
// ═══ SIGNATURE   A "you might also take" bundle row with a combined price.

export type BundleItem = { id: string; name: string; price: string; included?: boolean }

export type BundleUpsellProps = {
  eyebrow?: string
  title?: React.ReactNode
  bundle?: { name: string; items: string[]; price: string; save?: string }
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function BundleUpsell({ eyebrow = "BUNDLE", title = "Add the bundle.", bundle = { name: "The full set", items: ["All sections", "Motion kit", "Tokens", "Playground"], price: "€240", save: "Save €60" }, cta = "Add bundle", tone = "paper", className }: BundleUpsellProps) {
  const ink = tone === "ink"
  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionShellHeader eyebrow={eyebrow} title={title} ink={ink} />
        <div className={cn("mt-8 flex flex-col gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}>
          <div className="flex-1">
            <p className="font-display text-lg font-bold">{bundle.name}</p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {bundle.items.map((it) => (
                <li key={it} className="flex items-center gap-2 text-sm font-medium"><Check className="h-3.5 w-3.5 text-success" /> {it}</li>
              ))}
            </ul>
          </div>
          <div className="shrink-0 text-right">
            {bundle.save && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-success">{bundle.save}</p>}
            <p className="font-display text-3xl font-semibold">{bundle.price}</p>
            <Button size="sm" className="mt-3 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.12em]">{cta}</Button>
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}

function SectionShellHeader({ eyebrow, title, ink }: { eyebrow: string; title: React.ReactNode; ink: boolean }) {
  return (
    <>
      <p className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.3em]", ink ? "text-background/50" : "text-muted-foreground")}>{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{title}</h2>
    </>
  )
}
