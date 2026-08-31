import * as React from "react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Reveal a framed band with a travelling border-trail light.
// ═══ EMOTION     A frame draws itself around the content.
// ═══ SIGNATURE   border-trail edge light sweeps the card as it comes into view.

export type RevealInViewWipeProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** Each tile animates its own trailing border as it enters. */
  items?: { id?: string; title: string; body?: React.ReactNode }[]
  action?: { label: string; href?: string; onClick?: () => void }
  tone?: "paper" | "ink"
  columns?: 1 | 2 | 3
  className?: string
}

export function RevealInViewWipe({
  eyebrow = "WIPE",
  title = "In view, in line.",
  subtitle = "Each card draws its edge as it slides into view — a border-trail reveal.",
  items = [
    { id: "a", title: "Self-drawing", body: "The trail light travels the border in the same rhythm as the reveal." },
    { id: "b", title: "Reduces cleanly", body: "Reduced-motion drops the pulse; cards simply appear." },
    { id: "c", title: "Token-driven", body: "The trail reads `--curtain-glow`, so it re-tints with the band." },
  ],
  action,
  tone = "paper",
  columns = 3,
  className,
}: RevealInViewWipeProps) {
  const ink = tone === "ink"
  const cols = columns === 1 ? "sm:grid-cols-1" : columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn(ink && "text-background")}>
          <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
          <div className={cn("mt-10 grid gap-4", cols)}>
            {items.map((it) => (
              <WipeCard key={it.id} title={it.title} body={it.body} ink={ink} />
            ))}
          </div>
          {action && (
            <div className="mt-8">
              <Button onClick={action.onClick} asChild={!!action.href && !action.onClick}>
                {action.href && !action.onClick ? <a href={action.href}>{action.label}</a> : action.label}
              </Button>
            </div>
          )}
        </div>
      </InView>
    </SectionShell>
  )
}

function WipeCard({ title, body, ink }: { title: string; body?: React.ReactNode; ink: boolean }) {
  return (
    <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
      <div className={cn("relative h-full overflow-hidden rounded-xl border p-6", ink ? "border-background/15" : "border-border")}>
        <BorderTrail size={60} className="bg-[hsl(var(--curtain-glow)/0.9)]" transition={{ ease: "linear", duration: 4 }} />
        <h3 className="font-display text-lg font-bold">{title}</h3>
        {body && <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{body}</p>}
      </div>
    </InView>
  )
}
