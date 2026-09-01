import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { Eye, EyeOff, Keyboard, ShieldCheck, ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — registration forms with a brain.
// JOB      coach a strong secret without lecturing
// SIGNATURE criteria rungs LIGHT IN one by one (each its own spring) while the
//           bar's width and colour interpolate over them; breach lookups get a
//           status line; caps-lock whispers; reveal is a morph, not a toggle.
// API      value + onChange (host owns storage); onScore(score) to gate the
//          submit button; `breached` = your haveibeenpwned result.
// SECURITY note: no strength is ever claimed client-side as sufficient —
//          the meter scores entropy heuristics only.

export type PasswordMeterProps = { value: string; onChange: (v: string) => void; breached?: boolean; checking?: boolean; onScore?: (s: number) => void; placeholder?: string; className?: string }

const RULES: { id: string; test: (v: string) => boolean; label: string }[] = [
  { id: "len", test: (v) => v.length >= 12, label: "12+ characters" },
  { id: "case", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v), label: "UPPER + lower" },
  { id: "num", test: (v) => /\d/.test(v), label: "a number" },
  { id: "sym", test: (v) => /[^A-Za-z0-9]/.test(v), label: "a symbol" },
]

export function PasswordMeter({ value, onChange, breached, checking, onScore, placeholder = "Choose something memorable, not personal", className }: PasswordMeterProps) {
  const [show, setShow] = React.useState(false)
  const [caps, setCaps] = React.useState(false)
  const passed = RULES.filter((r) => r.test(value))
  const score = (passed.length / RULES.length) * 100 * (breached ? 0.4 : 1) * (new Set(value).size > 8 ? 1 : 0.8)
  React.useEffect(() => { onScore?.(Math.round(score)) }, [score, onScore])
  const hue = breached ? "hsl(var(--err))" : score < 40 ? "hsl(var(--err))" : score < 70 ? "hsl(var(--warn))" : "hsl(var(--ok))"

  return (
    <div className={cn("font-sans", className)}>
      <MotionConfig reducedMotion="user">
      <div className="relative">
        <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))} placeholder={placeholder} autoComplete="new-password" aria-describedby="pwd-rules" className="h-11 w-full rounded-lg border bg-background pl-3.5 pr-16 text-[14px] tracking-[0.04em] outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]" />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {caps && <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} aria-hidden title="Caps Lock is on" className="grid size-6 place-items-center rounded-md bg-[hsl(var(--warn))]/15 text-[hsl(var(--warn))]"><Keyboard className="size-3.5" /></motion.span>}
          <Button type="button" variant="ghost" aria-pressed={show} aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((s) => !s)} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"><motion.span animate={{ rotate: show ? 180 : 0 }}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</motion.span></Button>
          
    </div>
      </div>
      <div aria-hidden className="mt-2.5 flex gap-1">
        {RULES.map((r, i) => {
          const hit = r.test(value)
          return <motion.span key={r.id} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><motion.span animate={{ width: hit ? "100%" : "4%" }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className={cn("block h-full rounded-full", hit ? "bg-[hsl(var(--ok))]" : "bg-[hsl(var(--warn))]/50")} /></motion.span>
        })}
      </div>
      <ul id="pwd-rules" className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {RULES.map((r) => {
          const hit = r.test(value)
          return <li key={r.id} className={cn("flex items-center gap-1.5 transition-colors", hit ? "font-semibold text-[hsl(var(--ok))]" : "text-muted-foreground")}>{hit ? <ShieldCheck className="size-3" /> : <span aria-hidden className="size-1.5 rounded-full border border-current" />}{r.label}</li>
        })}
      </ul>
      {checking && <p className="mt-2 text-xs text-muted-foreground">checking known breaches…</p>}
      {breached && <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[hsl(var(--err))]"><ShieldX className="size-4" aria-hidden /> This one has appeared in a known breach — pick a different phrase.</p>}
          </MotionConfig>
    </div>
  )
}
