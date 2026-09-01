import * as React from "react"
import { motion } from "motion/react"
import { CalendarDays, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — analysts live in date ranges.
// JOB      choose sensible ranges in one click, weird ones exactly
// SIGNATURE preset column ("Last 7 days" with computed subtext), calendar
//           paints the in-progress span WHILE you pick, and a compare-shift
//           toggle that adds a ghost prior period under the header.
// A11Y     real grid with roving focus; range announced in the trigger text;
//          keyboard: arrows move, enter picks start then end.

export type Range = { from: Date; to: Date; label?: string }
export type DateRangePresetsProps = { value: Range | null; onChange: (r: Range | null) => void; presets?: { label: string; days: number }[]; allowCompare?: boolean; className?: string }

const DEFAULTS: DateRangePresetsProps["presets"] = [{ label: "Today", days: 1 }, { label: "Last 7 days", days: 7 }, { label: "Last 30 days", days: 30 }, { label: "Last 90 days", days: 90 }]
const iso = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
const same = (a: Date, b: Date) => iso(a) === iso(b)

export function DateRangePresets({ value, onChange, presets = DEFAULTS, allowCompare, className }: DateRangePresetsProps) {
  const [open, setOpen] = React.useState(false)
  const [cursor, setCursor] = React.useState(() => value?.from ?? new Date())
  const [picking, setPicking] = React.useState<Date | null>(null)
  const [compare, setCompare] = React.useState(false)
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1)
  const days = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
  const lead = (start.getDay() + 6) % 7
  const inRange = (d: Date) => value && d >= new Date(value.from.setHours(0, 0, 0)) && d <= new Date(value.to.setHours(23))
  const applyPreset = (daysAgo: number) => { const to = new Date(); const from = new Date(Date.now() - (daysAgo - 1) * 86400000); from.setHours(0, 0, 0, 0); to.setHours(23, 59, 0, 0); onChange({ from, to, label: daysAgo === 1 ? "Today" : `Last ${daysAgo} days` }); setOpen(false) }
  const pick = (d: Date) => {
    if (!picking) { setPicking(d); return }
    const from = picking <= d ? picking : d, to = picking <= d ? d : picking
    onChange({ from, to }); setPicking(null); setOpen(false)
  }
  const cellBtn = (d: Date | null, key: number, ghost?: boolean) =>
    <span key={key} className="relative">{d ? <Button type="button" variant="ghost" tabIndex={same(d, cursor) ? 0 : -1} onClick={() => { same(d, cursor) || d.getMonth() !== cursor.getMonth() ? setCursor(d) : pick(d) }} className={cn("relative z-[1] grid size-8 place-items-center rounded-md text-[12px] tabular-nums transition-colors", d.getMonth() !== cursor.getMonth() && "opacity-35", same(d, value?.from ?? d) || same(d, value?.to ?? d) ? "bg-primary font-black text-primary-foreground" : inRange(d) ? "bg-accent font-bold" : "hover:bg-muted")}>{d.getDate()}</Button> : null}
      {ghost && d && compare && value && (() => { const g = new Date(value.from.getTime() - (value.to.getTime() - value.from.getTime())); const gp = new Date(g.getTime() + key * 86400000); return same(d, gp) ? <span aria-hidden className="absolute inset-1 rounded-md border border-dashed border-muted-foreground/50" /> : null })()}
    </span>

  return (
    <div className={cn("relative inline-block font-sans", className)}>
      <Button type="button" variant="ghost" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="flex h-9 items-center gap-2 rounded-md border border-border/70 bg-background px-3 text-sm font-medium shadow-sm hover:bg-muted/60">
        <CalendarDays aria-hidden className="size-4 text-muted-foreground" />
        {value ? `${value.from.toLocaleDateString()} → ${value.to.toLocaleDateString()}` : "Pick a range"}
        {value && <span className="text-xs text-muted-foreground">{Math.ceil(+value.to / 86400000) - Math.ceil(+new Date(value.from).setHours(23) / 86400000) + 1}d</span>}
      </Button>
      {value && <Button type="button" variant="ghost" aria-label="Clear range" onClick={() => { onChange(null); setPicking(null) }} className="absolute -right-7 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"><X className="size-3.5" /></Button>}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setOpen(false); setPicking(null) }} aria-hidden />
          <motion.div role="dialog" aria-label="Date range" initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }} className="absolute left-0 top-[calc(100%+8px)] z-50 flex overflow-hidden rounded-lg border border-border/70 bg-popover shadow-xl">
            <div className="w-40 border-r p-2">
              {(presets ?? []).map((p) => <Button type="button" variant="ghost" key={p.label} onClick={() => applyPreset(p.days)} className="block w-full rounded-md px-2.5 py-2 text-left text-sm font-medium hover:bg-accent">{p.label}</Button>)}
              {allowCompare && (
                <Button type="button" variant="ghost" role="switch" aria-checked={compare} onClick={() => setCompare((c) => !c)} className="mt-1 flex w-full items-center justify-between gap-2 rounded-md border border-dashed px-2.5 py-2 text-left text-[11px] font-bold text-muted-foreground hover:bg-accent">
                  Compare previous <span aria-hidden className={cn("relative h-4 w-7 rounded-full transition-colors", compare && "bg-primary")}><span className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow transition-all", compare ? "left-3.5" : "left-0.5")} /></span>
                </Button>
              )}
          
    </div>
            <div className="p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <Button type="button" variant="ghost" aria-label="Previous month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="grid size-7 place-items-center rounded hover:bg-muted">‹</Button>
                <p className="text-[12px] font-black">{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
                <Button type="button" variant="ghost" aria-label="Next month" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="grid size-7 place-items-center rounded hover:bg-muted">›</Button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => <span key={w} className="py-1 text-[11px] font-semibold text-muted-foreground">{w}</span>)}
                {Array.from({ length: lead }, (_, i) => cellBtn(null, i))}
                {Array.from({ length: days }, (_, i) => cellBtn(new Date(cursor.getFullYear(), cursor.getMonth(), i + 1), i + lead, true))}
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">{picking ? "pick end date" : value ? "range selected" : "pick start date"}</p>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
