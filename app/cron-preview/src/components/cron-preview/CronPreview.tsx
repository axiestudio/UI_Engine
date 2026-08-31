import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarClock } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — nobody can read raw cron. Everyone understands "next runs".
// JOB      author a schedule by feel, confirm by facts
// SIGNATURE chips for M-H-Dom-Mon-Dow with live validation + human sentence
//           recomputed AS you type; "next five runs" stream in with slide-in
//           rows (a small parser covers common patterns — good enough to
//           review, real one runs server-side).
// A11Y     inputs labelled by position name; preview is text.

export type CronPreviewProps = { expr: string; onChange: (v: string) => void; now?: () => Date; className?: string }
const NAMES = ["minute", "hour", "day of month", "month", "day of week"]
const fieldOk = (f: string, max: number) => f === "*" || /^\*|\d+(,\s*\d+)*(\/\s*\d+)?$/.test(f) && f.split(/[*,\/\s-]+/).every((t) => !t || /^\d+$/.test(t) && +t <= max)

export function CronPreview({ expr, onChange, now = () => new Date(), className }: CronPreviewProps) {
  const raw = expr.split(/\s+/)
  const parts = [...raw]; while (parts.length < 5) parts.push("*")
  const valid = parts.every((p, i) => p !== "" && fieldOk(p, [59, 23, 31, 12, 7][i]))
  const human = describe(parts)
  const nexts = useMemoFiveParts(parts, now())
  return (
    <div className={cn("space-y-3 font-sans", className)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Cron expression">
        {parts.map((p, i) => (
          <label key={i} className="flex flex-col gap-1">
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">{NAMES[i]}</span>
            <input value={p} onChange={(e) => { const n = [...parts]; n[i] = e.target.value.replace(/\s/g, ""); onChange(n.join(" ").trim()) }} aria-label={NAMES[i]} className={cn("h-9 w-16 rounded-md border bg-background px-2 text-center font-mono text-[13px] font-bold outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]", !fieldOk(p, [59, 23, 31, 12, 7][i]) && "border-[hsl(var(--err))] text-[hsl(var(--err))]")} />
          </label>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[13px]">
        <CalendarClock aria-hidden className={cn("size-4", valid ? "text-[hsl(var(--info))]" : "text-[hsl(var(--err))]")} />
        <AnimatePresence mode="wait">
          <motion.p key={human} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn("font-medium", valid ? "" : "text-[hsl(var(--err))]")}>{valid ? human : "That expression can't be parsed yet."}</motion.p>
        </AnimatePresence>
      </div>
      {valid && nexts.length > 0 && (
        <ol className="flex flex-wrap gap-1.5" aria-label="Next five runs">
          {nexts.map((t, i) => (
            <motion.li key={+t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="rounded-md bg-[hsl(var(--app-code))] px-2.5 py-1.5 font-mono text-[10px] font-bold text-muted-foreground">
              {t.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  )
}

function describe(p: string[]) {
  const [mi, h, dom, mon, dow] = p
  const bits: string[] = []
  if (/^\d+$/.test(mi) && /^\d+$/.test(h)) bits.push(`at ${h.padStart(2, "0")}:${String(mi).padStart(2, "0")}`)
  else bits.push(mi.startsWith("*/") ? `every ${mi.slice(2)} min${h === "*" ? "" : " past hour " + h}` : h === "*" ? "every minute" : `in hour ${h}`)
  if (dom !== "*") bits.push(`on day ${dom}`)
  if (dow !== "*") bits.push(dow === "1-5" ? "on weekdays" : `on weekday ${dow}`)
  if (mon !== "*") bits.push(`in month ${mon}`)
  return bits.join(", ") + "."
}
function useMemoFiveParts(p: string[], from: Date) { const out: Date[] = []; let d = new Date(from.getTime() + 60000); for (let guard = 0; out.length < 5 && guard < 2.2e5; guard++, d = new Date(d.getTime() + 60000)) { const match = (f: string, v: number) => f === "*" ? true : /^\*\/(\d+)$/.test(f) ? v % +RegExp.$1 === 0 : f.split(",").some((t) => (t.includes("-") ? (+t.split("-")[0] <= v && v <= +t.split("-")[1]) : +t === v)) ; if (match(p[0], d.getMinutes()) && match(p[1], d.getHours()) && (p[2] === "*" || +p[2] === d.getDate()) && (p[3] === "*" || +p[3] === d.getMonth() + 1) && (p[4] === "*" || p[4] === "1-5" ? p[4] !== "1-5" || (d.getDay() > 0 && d.getDay() < 6) : +p[4] === d.getDay())) out.push(new Date(d)) } return out }
