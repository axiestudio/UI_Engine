import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { AtSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — comments that actually notify the right human.
// JOB      write where you can pull people in and run quick commands
// SIGNATURE typing "@" opens a fuzzy roster anchored at the caret LINE (measured
//           with a mirror div); "/" surfaces slash-commands; the token, once
//           accepted, lands as a highlighted pill word; a counter ring around
//           the send button tracks remaining characters.
// API      value/onChange are plain strings — host persists whatever it likes.
// A11Y     listbox pops with aria-controls/activedescendant; Enter accepts;
//          Esc/Space out. Ring is aria-hidden, count is text.

export type Mention = { id: string; label: string; sub?: string }
export type MentionTextareaProps = {
  value: string
  onChange: (v: string) => void
  mentions?: Mention[]
  commands?: { cmd: string; describe: string; run: () => void }[]
  max?: number
  onSubmit?: () => void
  placeholder?: string
  className?: string
}

export function MentionTextarea({ value, onChange, mentions = [], commands = [], max = 1000, onSubmit, placeholder = "Write something — @ to pull someone in, / for actions", className }: MentionTextareaProps) {
  const ta = React.useRef<HTMLTextAreaElement>(null)
  const [pop, setPop] = React.useState<{ kind: "at" | "slash"; term: string; top: number; left: number } | null>(null)
  const [idx, setIdx] = React.useState(0)
  const auto = React.useRef(false)

  React.useEffect(() => {
    if (auto.current && ta.current) { ta.current.style.height = "auto"; ta.current.style.height = Math.min(240, ta.current.scrollHeight) + "px" }
  }, [value])
  const detect = () => {
    const el = ta.current; if (!el) return
    const upto = el.value.slice(0, el.selectionStart)
    const at = upto.match(/(^|\s)@([\w.-]*)$/)
    const sl = upto.match(/(^|\s)\/([\w-]*)$/)
    if (at || sl) {
      const term = (at ?? sl)![2]
      // caret position via mirror
      const div = document.createElement("div")
      const cs = getComputedStyle(el)
      div.style.cssText = cs.cssText + "; position:absolute; visibility:hidden; white-space:pre-wrap; word-wrap:break-word;"
      div.textContent = el.value.slice(0, el.selectionStart)
      const span = document.createElement("span"); div.appendChild(span)
      const holder = el.closest(".relative") as HTMLElement
      holder.appendChild(div)
      const er = el.getBoundingClientRect()
      const r = span.getBoundingClientRect()
      const top = r.top - er.top + Number(cs.lineHeight.replace("px", "") || 22)
      const left = Math.max(4, r.left - er.left)
      div.remove()
      setPop({ kind: at ? "at" : "slash", term, top, left }); setIdx(0)
    } else setPop(null)
  }
  const pick = (insert: string) => {
    const el = ta.current; if (!el) return
    const s = el.selectionStart
    const cut = pop?.kind === "slash" ? /(^|\s)\/([\w-]*)$/ : /(^|\s)@([\w.-]*)$/
    const upto = el.value.slice(0, s).replace(cut, (_m, p1) => p1)
    const next = upto + insert + el.value.slice(s)
    onChange(next); setPop(null)
    auto.current = true
  }
  const q = pop?.term.toLowerCase() ?? ""
  const people = mentions.filter((m) => m.label.toLowerCase().includes(q)).slice(0, 6)
  const cmds = commands.filter((c) => c.cmd.startsWith(q)).slice(0, 6)
  const opts = pop?.kind === "at" ? people.map((p) => ({ id: p.id, main: p.label, sub: p.sub, insert: `@${p.label.replace(/\s+/g, "")}` })) : cmds.map((c) => ({ id: c.cmd, main: "/" + c.cmd, sub: c.describe, insert: c.cmd + " " }))
  const over = value.length > max
  const pct = Math.min(1, value.length / max)

  return (
    <div className={cn("relative rounded-lg border border-border/70 bg-background shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring", className)}>
      <MotionConfig reducedMotion="user">
      <textarea ref={ta} value={value} aria-label="Message with mentions" rows={3} placeholder={placeholder} onChange={(e) => { auto.current = true; onChange(e.target.value) }} onKeyUp={(e) => { detect(); if (e.key === "Enter" && e.metaKey) onSubmit?.() }} onClick={detect} onKeyDown={(e) => {
        if (pop && opts.length) {
          if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => (i + 1) % opts.length) }
          else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => (i - 1 + opts.length) % opts.length) }
          else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); const o = opts[idx]; pick(o.insert); pop.kind === "slash" && cmds.find((c) => c.cmd === o.main.slice(1))?.run() }
          else if (e.key === "Escape" || e.key === " ") { setPop(null) }
        }
      }} className="w-full resize-none bg-transparent px-3.5 py-3 text-[14px] leading-relaxed outline-none" />
      <div className="flex items-center justify-between px-3 pb-2.5">
        <span className="text-xs text-muted-foreground"><AtSign className="mr-1 inline size-3" /> @mention · /command</span>
        <div className="flex items-center gap-2">
          <span className={cn("font-mono text-[11px] tabular-nums", over ? "font-semibold text-[hsl(var(--err))]" : "text-muted-foreground")}>{value.length}/{max}</span>
          <svg aria-hidden viewBox="0 0 20 20" className="size-4 -rotate-90"><circle cx="10" cy="10" r="8" fill="none" stroke="hsl(var(--muted-foreground)/0.3)" strokeWidth="2.5" /><circle cx="10" cy="10" r="8" fill="none" stroke={over ? "hsl(var(--err))" : "hsl(var(--app-focus))"} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${pct * 50.2} 50.2`} className="transition-[stroke-dasharray]" /></svg>
          
    </div>
      </div>
      <AnimatePresence>
        {pop && opts.length > 0 && (
          <motion.ul role="listbox" aria-label={pop.kind === "at" ? "Mention" : "Commands"} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.08 } }} className="absolute inset-x-2 z-50 overflow-hidden rounded-lg border bg-popover shadow-xl" style={{ top: pop.top }}>
            {opts.map((o, i) => (
              <li key={o.id} role="option" aria-selected={i === idx}>
                <Button type="button" variant="ghost" onMouseDown={(e) => e.preventDefault()} onClick={() => { pick(o.insert); pop.kind === "slash" && cmds.find((c) => c.cmd === o.main.slice(1))?.run() }} className={cn("flex w-full items-baseline gap-2 px-3 py-2 text-left text-sm", i === idx && "bg-accent")}>
                  <span className="font-mono font-medium">{o.main}</span><span className="truncate text-xs text-muted-foreground">{o.sub}</span>
                </Button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
          </MotionConfig>
    </div>
  )
}
