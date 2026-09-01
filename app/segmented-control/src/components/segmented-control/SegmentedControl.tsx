import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — mutually-exclusive views deserve a thumb, not radios styled
// like buttons.
// JOB      switch between 2–6 views of the same data with zero ambiguity
// SIGNATURE a single spring-measured thumb slides behind the active label
//           (measured with per-option refs, re-measured on resize); labels get
//           contrast-safe colour flip mid-slide; icons optional.
// API      options [{value,label,icon?}] + value + onChange ("listbox without
//          the mouse: roving tabindex + arrows + Home/End).
// A11Y     radiogroup semantics; thumb is decoration.

export type SegOption = { value: string; label: string; icon?: React.ElementType }
export type SegmentedControlProps = { options: SegOption[]; value: string; onChange: (v: string) => void; size?: "sm" | "md"; className?: string }

export function SegmentedControl({ options, value, onChange, size = "md", className }: SegmentedControlProps) {
  const host = React.useRef<HTMLDivElement>(null)
  const refs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const [thumb, setThumb] = React.useState({ x: 0, w: 0 })
  React.useEffect(() => {
    const el = refs.current[value]
    if (el && host.current) { setThumb({ x: el.offsetLeft, w: el.offsetWidth }) }
  }, [value, options])
  React.useEffect(() => {
    const ro = new ResizeObserver(() => { const el = refs.current[value]; el && setThumb({ x: el.offsetLeft, w: el.offsetWidth }) })
    if (host.current) ro.observe(host.current)
    return () => ro.disconnect()
  }, [value])
  const key = (e: React.KeyboardEvent) => {
    const i = options.findIndex((o) => o.value === value)
    if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); onChange(options[(i + 1) % options.length].value) }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); onChange(options[(i - 1 + options.length) % options.length].value) }
    if (e.key === "Home") { e.preventDefault(); onChange(options[0].value) }
    if (e.key === "End") { e.preventDefault(); onChange(options[options.length - 1].value) }
  }
  return (
    <div ref={host} role="radiogroup" aria-label="View" onKeyDown={key} className={cn("relative inline-flex rounded-full border bg-muted/60 p-[3px] font-sans select-none", className)}>
      <MotionConfig reducedMotion="user">
      <motion.span aria-hidden initial={false} animate={{ x: thumb.x, width: thumb.w }} transition={{ type: "spring", stiffness: 420, damping: 34 }} className="absolute top-[3px] bottom-[3px] rounded-full bg-card shadow-[0_1px_3px_rgba(0,0,0,0.18)]" style={{ left: 0 }} />
      {options.map((o) => {
        const Icon = o.icon
        return (
          <Button type="button" variant="ghost" key={o.value} ref={(el) => { refs.current[o.value] = el }} role="radio" aria-checked={o.value === value} tabIndex={o.value === value ? 0 : -1} onClick={() => onChange(o.value)} className={cn("relative z-[1] flex items-center gap-1.5 rounded-full px-3.5 font-medium transition-colors", size === "sm" ? "h-7 text-[11px]" : "h-8 text-[12px]", o.value === value ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
            {Icon && <Icon className="size-3.5" />} {o.label}
          </Button>
        )
      })}
          </MotionConfig>
    </div>
  )
}
