import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ArrowUp, Cpu, Paperclip, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — the input box IS the product now.
// JOB      compose requests worth answering
// SIGNATURE token meter RINGS the send button and reddens near the context
//           limit; model chip cycles through your catalogue with a dice
//           animation; attachments stack as fanned cards; streaming state
//           dims the composer and hands the caret to the answer.
// A11Y     textarea labelled; meter text announced; buttons real.

export type AiPromptComposerProps = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  busy?: boolean
  models?: { id: string; label: string }[]
  model?: string
  onModel?: (id: string) => void
  attachments?: string[]
  onAttach?: () => void
  contextLimit?: number
  className?: string
}

// ~4 chars per token is a fair heuristic
const tokens = (s: string) => Math.ceil(s.trim().length / 4)

export function AiPromptComposer({ value, onChange, onSend, busy, models = [], model, onModel, attachments = [], onAttach, contextLimit = 8000, className }: AiPromptComposerProps) {
  const ta = React.useRef<HTMLTextAreaElement>(null)
  const used = tokens(value)
  const pct = Math.min(1, used / contextLimit)
  const hot = pct > 0.85
  const cycleModel = () => { if (!models.length || !onModel) return; const i = models.findIndex((m) => m.id === model); onModel(models[(i + 1) % models.length].id) }
  React.useEffect(() => { const el = ta.current; if (el) { el.style.height = "auto"; el.style.height = Math.min(200, el.scrollHeight) + "px" } }, [value])
  return (
    <div className={cn("rounded-xl border border-border/70 bg-card shadow-sm transition-opacity", busy && "opacity-70", className)}>
      <MotionConfig reducedMotion="user">
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-b border-border/60 px-3.5 py-2.5">
          {attachments.map((a, i) => (
            <motion.span key={a} initial={{ scale: 0.8, rotate: 0 }} animate={{ rotate: (i - attachments.length / 2) * 1.6, scale: 1 }} className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border/60 bg-muted/40 px-2.5 py-1.5 text-xs font-medium"><Paperclip className="size-3" aria-hidden /> {a}</motion.span>
          ))}
          </MotionConfig>
    </div>
      )}
      <textarea ref={ta} rows={1} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!busy && value.trim()) onSend() } }} placeholder="Ask for something specific — context is cheap, clarity is not." aria-label="Prompt" className="max-h-[200px] w-full resize-none bg-transparent px-4 pb-2 pt-3.5 text-sm leading-relaxed outline-none" />
      <div className="flex items-center gap-2 px-3 pb-3">
        {onAttach && <Button type="button" variant="ghost" aria-label="Attach file" onClick={onAttach} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"><Paperclip className="size-4" /></Button>}
        {models.length > 0 && (
          <Button type="button" variant="ghost" onClick={cycleModel} className="flex h-8 items-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium hover:bg-muted">
            <motion.span key={model} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-1.5"><Cpu className="size-3.5" aria-hidden /> {models.find((m) => m.id === model)?.label ?? model}</motion.span>
          </Button>
        )}
        <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{used.toLocaleString()} tk</span>
        <span className="relative grid size-9 place-items-center">
          <svg aria-hidden viewBox="0 0 36 36" className="absolute inset-0 -rotate-90"><circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" /><motion.circle cx="18" cy="18" r="16" fill="none" stroke={hot ? "hsl(var(--err))" : "hsl(var(--ring))"} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct * 100.5} 100.5`} /></svg>
          <motion.button disabled={busy || !value.trim()} onClick={onSend} whileTap={{ scale: 0.88 }} aria-label="Send prompt" className={cn("grid size-8 place-items-center rounded-full transition-colors", value.trim() && !busy ? (hot ? "bg-[hsl(var(--err))] text-white" : "bg-primary text-primary-foreground") : "bg-muted text-muted-foreground")}>
            {busy ? <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 0.9, repeat: Infinity }}><Sparkles className="size-4" /></motion.span> : <ArrowUp className="size-4" />}
          </motion.button>
        </span>
      </div>
      <p className="sr-only" aria-live="polite">{used} of {contextLimit} context tokens.</p>
    </div>
  )
}
