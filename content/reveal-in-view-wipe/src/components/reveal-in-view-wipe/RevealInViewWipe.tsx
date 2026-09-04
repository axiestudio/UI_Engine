import * as React from "react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"

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
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-5 sm:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className={cn(ink && "text-background")}>
            <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
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
    
  </div>
</section>
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
