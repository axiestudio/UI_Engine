import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { AtSign, Slash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { autoUpdate, flip, offset, shift, useDismiss, useFloating, useInteractions, useRole, } from "@floating-ui/react"

// ═══ APP-PRIMARY — comments that actually notify the right human.
// JOB      write where you can pull people in and run quick commands
// ROUND 2  the @mention and /command panels are anchored with @floating-ui/react
//           (useFloating + offset/flip/shift + autoUpdate, dismiss + role +
//           click interactions per the registry floating-ui recipe) — the old
//           mirror-div caret measurement is gone: the panel floats off the
//           field itself and flip/shift keep it on stage.
// SIGNATURE typing "@" opens the fuzzy roster; "/" surfaces slash-commands;
//           the token, once accepted, lands inline as @Name text; a counter
//           ring around the send corner tracks remaining characters.
// API      value/onChange are plain strings — host persists whatever it likes.
// A11Y     listbox pops with aria-controls/activedescendant; Enter/Tab accepts;
//          Esc/outside-click dismiss (useDismiss); registry Buttons trigger
//          the panels for pointer users too.

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
  const anchor = React.useRef<HTMLDivElement>(null)
  const [pop, setPop] = React.useState<{ kind: "at" | "slash"; term: string } | null>(null)
  const [idx, setIdx] = React.useState(0)
  const auto = React.useRef(false)

  const { refs, floatingStyles, context } = useFloating({
    // anchor to the field itself — Floating UI owns placement & collisions
    placement: "bottom-start",
    open: Boolean(pop),
    onOpenChange: (o) => { if (!o) setPop(null) },
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "listbox" })
  const { getFloatingProps } = useInteractions([dismiss, role])

  React.useEffect(() => {
    if (auto.current && ta.current) { ta.current.style.height = "auto"; ta.current.style.height = Math.min(240, ta.current.scrollHeight) + "px" }
  }, [value])

  const detect = () => {
    const el = ta.current; if (!el) return
    const upto = el.value.slice(0, el.selectionStart)
    const at = upto.match(/(^|\s)@([\w.-]*)$/)
    const sl = upto.match(/(^|\s)\/([\w-]*)$/)
    if (at || sl) { setPop({ kind: at ? "at" : "slash", term: (at ?? sl)![2] }); setIdx(0) }
    else setPop(null)
  }
  const pick = (insert: string) => {
    const el = ta.current; if (!el) return
    const s = el.selectionStart
    const cut = pop?.kind === "slash" ? /(^|\s)\/([\w-]*)$/ : /(^|\s)@([\w.-]*)$/
    const upto = el.value.slice(0, s).replace(cut, (_m, p1) => p1)
    onChange(upto + insert + el.value.slice(s))
    setPop(null)
    auto.current = true
  }
  const q = pop?.term.toLowerCase() ?? ""
  const people = mentions.filter((m) => m.label.toLowerCase().includes(q)).slice(0, 6)
  const cmds = commands.filter((c) => c.cmd.startsWith(q)).slice(0, 6)
  const opts = pop?.kind === "at" ? people.map((p) => ({ id: p.id, main: p.label, sub: p.sub, insert: `@${p.label.replace(/\s+/g, "")}` })) : cmds.map((c) => ({ id: c.cmd, main: "/" + c.cmd, sub: c.describe, insert: c.cmd + " " }))
  const over = value.length > max
  const pct = Math.min(1, value.length / max)
  const listId = "mention-listbox"

  const openPanel = (kind: "at" | "slash") => {
    // pointer shortcut: insert the sigil at the caret and let detect() do the rest
    const el = ta.current
    if (el) {
      const s = el.selectionStart ?? el.value.length
      onChange(el.value.slice(0, s) + (kind === "at" ? "@" : "/") + el.value.slice(s))
      setPop({ kind, term: "" })
      setIdx(0)
      requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + 1, s + 1) })
    } else setPop({ kind, term: "" })
  }

  return (
    <div ref={(node) => { anchor.current = node; refs.setReference(node) }} className={cn("relative rounded-lg border border-border/70 bg-background shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring", className)}>
      <MotionConfig reducedMotion="user">
        <Textarea
          ref={ta} value={value} rows={3} placeholder={placeholder}
          aria-label="Message with mentions"
          aria-expanded={Boolean(pop && opts.length)}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={pop && opts.length ? `${listId}-opt-${idx}` : undefined}
          className="max-h-60 min-h-0 resize-none border-0 bg-transparent px-3.5 py-3 text-[14px] leading-relaxed shadow-none focus-visible:ring-0"
          onChange={(e) => { auto.current = true; onChange(e.target.value); requestAnimationFrame(detect) }}
          onKeyUp={(e) => { detect(); if (e.key === "Enter" && e.metaKey) onSubmit?.() }}
          onClick={detect}
          onKeyDown={(e) => {
            if (pop && opts.length) {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => (i + 1) % opts.length) }
              else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => (i - 1 + opts.length) % opts.length) }
              else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); const o = opts[idx]; pick(o.insert); pop.kind === "slash" && opts.find((x) => x.id === o.id) && commands.find((c) => c.cmd === o.main.slice(1))?.run() }
            }
          }}
        />
        <div className="flex items-center justify-between px-3 pb-2.5">
          <span className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" aria-label="Insert mention — choose a person" onClick={() => openPanel("at")} className="h-6 gap-1 px-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"><AtSign className="size-3" aria-hidden /> mention</Button>
            <Button type="button" variant="ghost" size="sm" aria-label="Open command palette" onClick={() => openPanel("slash")} className="h-6 gap-1 px-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"><Slash className="size-3" aria-hidden /> command</Button>
          </span>
          <div className="flex items-center gap-2">
            <span className={cn("font-mono text-[11px] tabular-nums", over ? "font-semibold text-[hsl(var(--err))]" : "text-muted-foreground")}>{value.length}/{max}</span>
            <svg aria-hidden viewBox="0 0 20 20" className="size-4 -rotate-90"><circle cx="10" cy="10" r="8" fill="none" stroke="hsl(var(--muted-foreground)/0.3)" strokeWidth="2.5" /><motion.circle cx="10" cy="10" r="8" fill="none" stroke={over ? "hsl(var(--err))" : "hsl(var(--app-focus))"} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${pct * 50.2} 50.2`} transition={{ duration: 0.2 }} /></svg>
            <Button type="button" variant="ghost" size="sm" onClick={() => { if (!over && value.trim()) onSubmit?.() }} disabled={!value.trim() || over} className="h-6 rounded px-2 text-[11px] font-semibold text-primary disabled:opacity-40">send ⌘↵</Button>
          </div>
        </div>
        <AnimatePresence>
          {pop && opts.length > 0 && (
            <motion.ul
              id={listId}
              role="listbox"
              aria-label={pop.kind === "at" ? "Mentions" : "Commands"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.08 } }}
              ref={(node) => { refs.setFloating(node) }}
              style={{ ...floatingStyles, width: anchor.current ? anchor.current.offsetWidth : undefined }}
              className="z-50 max-h-48 overflow-y-auto rounded-lg border bg-popover text-popover-foreground shadow-xl outline-none"
              {...getFloatingProps()}
            >
              {opts.map((o, i) => (
                <li key={o.id} id={`${listId}-opt-${i}`} role="option" aria-selected={i === idx}>
                  <Button type="button" variant="ghost"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { const cmd = commands.find((c) => "/" + c.cmd === o.main); pick(o.insert); if (pop.kind === "slash") cmd?.run() }}
                    className={cn("flex w-full items-baseline gap-2 rounded-none px-3 py-2 text-left text-sm text-foreground hover:bg-accent", i === idx && "bg-accent")}
                  >
                    <span className="shrink-0 font-mono font-medium">{o.main}</span><span className="truncate text-xs text-muted-foreground">{o.sub}</span>
                  </Button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
        <p className="sr-only" aria-live="polite">{pop ? `${opts.length} ${pop.kind === "at" ? "people" : "commands"} listed.` : ""}</p>
      </MotionConfig>
    </div>
  )
}
