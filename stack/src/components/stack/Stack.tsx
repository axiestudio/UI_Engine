import * as React from "react"
import { ListStack, type ListItem } from "@/components/watermelon/list-stack"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type StackProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** Same shape the vendored registry item consumes: title, blurb, rows, accent color. */
  items: ListItem[]
  className?: string
}

// ── Stack ────────────────────────────────────────────────────────────────────

export function Stack({ eyebrow = "Highlights", title = "Pinned, one at a time", subtitle, items, className }: StackProps) {
  if (!items.length) return null
  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[780px] px-4 pt-16 text-center sm:px-6">
          {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
          {title && <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>}
          {subtitle && <p className="mx-auto mt-2 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>
      </InView>
      <div className="mx-auto w-full max-w-[780px] px-4 pb-16 sm:px-6">
        <ListStack items={items} />
        <p className="mt-2 text-center font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tap a card to bring it forward</p>
      </div>
    </section>
  )
}
