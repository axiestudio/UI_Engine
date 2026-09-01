import * as React from "react"
import { Magnetic } from "@/components/primitives/magnetic"
import { ArrowRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"

// ═══ JOB         Magnetic menu — primary actions that magnetically pull toward the cursor.
// ═══ EMOTION     Inviting, physical.
// ═══ SIGNATURE   Magnetic CTA/links arranged as a menu that lean toward the pointer.

export type InteractiveMagneticMenuProps = {
  eyebrow?: string
  title?: React.ReactNode
  links?: { label: string; href?: string; variant?: "primary" | "outline" | "link" }[]
  className?: string
}

export function InteractiveMagneticMenu({ eyebrow = "MENU", title = "A menu that leans in.", links = [
  { label: "Get started", variant: "primary" },
  { label: "Watch the film" },
  { label: "Read the journal" },
  { label: "Contact" },
], className }: InteractiveMagneticMenuProps) {
  return (
    <section className={cn("relative isolate overflow-hidden py-20 sm:py-28", className)}>
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "justify-center text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-[-0.03em] sm:text-5xl">{title}</h2>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {links.map((l, i) => (
              <Magnetic key={l.label} intensity={28}>
                {l.variant === "primary" ? (
                  <a href={l.href ?? "#"} className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 font-mono text-[11px] font-bold uppercase tracking-widest text-background">
                    {l.label} <ArrowRight className="h-4 w-4" />
                  </a>
                ) : l.variant === "outline" ? (
                  <a href={l.href ?? "#"} className="inline-flex h-12 items-center rounded-full border px-7 font-mono text-[11px] font-bold uppercase tracking-widest"> {l.label}</a>
                ) : (
                  <a href={l.href ?? "#"} className="inline-flex h-12 items-center rounded-full px-3 font-display text-lg font-bold underline underline-offset-4 decoration-2 decoration-[hsl(var(--primary))]/60">{l.label}</a>
                )}
              </Magnetic>
            ))}
          </div>
        </InView>
      </div>
    </section>
  )
}
