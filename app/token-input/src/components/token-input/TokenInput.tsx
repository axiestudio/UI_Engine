import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — emails, tags, scopes: lists typed, not picked.
// JOB      enter comma/space-separated values as managed tokens
// SIGNATURE paste of "a, b, c; d" splits & dedups into flying pills; backspace
//           on empty arms a red delete (second press removes — the two-stage
//           guard everyone expects but nobody builds); dupes shake, not add.
// A11Y     tokens are list items with remove buttons; input labelled; live
//          region counts total/dupes.

export type TokenInputProps = { value: string[]; onChange: (v: string[]) => void; placeholder?: string; validate?: (t: string) => string | null; label?: string; className?: string }

export function TokenInput({ value, onChange, placeholder = "Type, paste, or press Enter…", validate, label = "Tokens", className }: TokenInputProps) {
  const [text, setText] = React.useState("")
  const [shake, setShake] = React.useState<string | null>(null)
  const [armed, setArmed] = React.useState(false)
  const [msg, setMsg] = React.useState("")
  const ref = React.useRef<HTMLInputElement>(null)

  const add = (raw: string) => {
    const parts = raw.split(/[,\n;]+\s*/).map((t) => t.trim()).filter(Boolean)
    const next = [...value]; let dupes = 0; let rejected = 0
    for (const p of parts) {
      if (validate) { const err = validate(p.toLowerCase()); if (err) { rejected++; setMsg(err); continue } }
      const k = p.toLowerCase()
      if (next.some((t) => t.toLowerCase() === k)) { dupes++; setShake(k); setTimeout(() => setShake(null), 420); continue }
      next.push(p)
    }
    if (next.length !== value.length) onChange(next)
    else if (dupes) setMsg(`${dupes} duplicate${dupes > 1 ? "s" : ""} skipped`)
    if (!rejected) setMsg("")
    setText(""); setArmed(false)
  }

  return (
    <div className={cn("font-sans", className)} onClick={() => ref.current?.focus()}>
      <MotionConfig reducedMotion="user">
      <div className={cn("flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 cursor-text transition-shadow focus-within:ring-2 focus-within:ring-[hsl(var(--app-focus))]")}>
        <AnimatePresence initial={false}>
          {value.map((t) => (
            <motion.span layout key={t} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: shake === t.toLowerCase() ? [1, 1.06, 0.96, 1.03, 1] : 1, boxShadow: shake === t.toLowerCase() ? "0 0 0 2px hsl(var(--err))" : "0 0 0 0 #0000" }} exit={{ scale: 0.8, opacity: 0 }} transition={{ layout: { duration: 0.18 }, opacity: { duration: shake === t.toLowerCase() ? 0.4 : 0.15 } }} className="flex items-center gap-1 rounded-full bg-accent py-0.5 pl-2.5 pr-1 text-[12px] font-bold text-accent-foreground">
              {t}
              <Button type="button" variant="ghost" aria-label={`Remove ${t}`} onClick={(e) => { e.stopPropagation(); onChange(value.filter((x) => x !== t)) }} className="grid size-4 place-items-center rounded-full hover:bg-primary-foreground/20"><X className="size-3" /></Button>
            </motion.span>
          ))}
        </AnimatePresence>
        <input ref={ref} aria-label={label} value={text} onChange={(e) => { setText(e.target.value); setArmed(false) }} onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " " || e.key === ",") && text.trim()) { e.preventDefault(); add(text) }
          else if (e.key === "Backspace" && !text && value.length) {
            if (armed) onChange(value.slice(0, -1))
            else { setArmed(true); setTimeout(() => setArmed(false), 1400) }
          } else setArmed(false)
        }} onPaste={(e) => { const data = e.clipboardData.getData("text"); if (/[,\n;]/.test(data)) { e.preventDefault(); add(data + text) } }} placeholder={value.length && !text ? "" : placeholder} className="h-7 min-w-[12ch] flex-1 bg-transparent text-sm outline-none" />
        {armed && <span aria-hidden className="rounded-sm bg-[hsl(var(--err))]/10 px-1.5 text-[11px] font-medium text-[hsl(var(--err))]">again to delete “{value[value.length - 1]}”</span>}
          
    </div>
      <p aria-live="polite" className="sr-only">{msg} {value.length} token{value.length === 1 ? "" : "s"} total</p>
          </MotionConfig>
    </div>
  )
}
