import * as React from "react"
import { Tent, Hammer, Wrench } from "lucide-react"
import { ListStack, type ListItem } from "@/components/watermelon/list-stack"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type StackProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** Same shape the vendored registry item consumes: title, location, date, icon. */
  items: ListItem[]
  className?: string
}

// ── Stack ────────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS: ListItem[] = [
  { id: "st1", title: "Bench residency", location: "Bench 4, north wall", date: "Year-round", icon: Hammer },
  { id: "st2", title: "Annual check-up", location: "Home or ours", date: "Every spring", icon: Wrench },
  { id: "st3", title: "Field demos", location: "Maker fair, pav. B", date: "Each October", icon: Tent },
]
export function Stack({ eyebrow = "Highlights", title = "Pinned, one at a time", subtitle, items = DEFAULT_ITEMS, className }: StackProps) {
  if (!items.length) return null
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[780px] px-5 pt-16 text-center sm:px-8">
          {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
          {title && <h2 className="mt-1 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
          {subtitle && <p className="mx-auto mt-2 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>
      </InView>
      <div className="mx-auto w-full max-w-[780px] px-5 pb-16 sm:px-8">
        <ListStack items={items} />
        <p className="mt-2 text-center font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Tap a card to bring it forward</p>
      </div>
    </section>
  )
}
