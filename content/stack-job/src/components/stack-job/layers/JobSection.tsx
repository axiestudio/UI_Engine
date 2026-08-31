import * as React from "react"
import { cn } from "@/lib/utils"

// ── JOB SECTION — one titled text block. The filling: repeat per topic. ─────

export type JobSectionProps = {
  heading: string
  children: React.ReactNode
  className?: string
}

export function JobSection({ heading, children, className }: JobSectionProps) {
  return (
    <section className={cn("border-t border-border/50 px-5 py-4 first:border-t-0", className)}>
      <h4 className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-primary">{heading}</h4>
      <div className="mt-2 space-y-2 text-[13px] font-medium leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
