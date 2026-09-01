import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ArrowDown, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — support channels & team chat that don't yank you around.
// JOB      read a live thread without losing your place
// SIGNATURE stick-to-bottom logic (auto-follow only when you're at the end,
//           otherwise a "new replies ↓ N" pill floats); date dividers compress
//           as gaps grow; streaming replies render token-by-token with a
//           caret; hover on own messages offers edit within the window.
// API      messages props; host owns send/edit/streaming state.
// A11Y     log role + polite live region; timestamps are time elements.

export type Msg = { id: string; me?: boolean; author?: string; at: string; text: string; streaming?: boolean; reactions?: string[] }
export type ChatThreadVirtualProps = { messages: Msg[]; canEdit?: (m: Msg) => boolean; onEdit?: (id: string, text: string) => void; className?: string }

export function ChatThreadVirtual({ messages, canEdit, onEdit, className }: ChatThreadVirtualProps) {
  const box = React.useRef<HTMLDivElement>(null)
  const [stick, setStick] = React.useState(true)
  const [newCount, setNewCount] = React.useState(0)
  const last = React.useRef(messages.length)
  const [editing, setEditing] = React.useState<Msg | null>(null)
  const [draft, setDraft] = React.useState("")
  React.useEffect(() => {
    const grew = messages.length > last.current
    if (grew) {
      if (stick) box.current?.scrollTo({ top: box.current.scrollHeight, behavior: "smooth" })
      else setNewCount((n) => n + (messages.length - last.current))
      last.current = messages.length
    }
  }, [messages, stick])
  const onScroll = () => {
    const el = box.current!; const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 64
    setStick(atBottom); if (atBottom) setNewCount(0)
  }
  const dayOf = (a: string) => new Date(a).toDateString()
  let lastDay = ""
  return (
    <div className={cn("relative flex flex-col rounded-xl border border-border/70 bg-card shadow-sm", className)}>
      <MotionConfig reducedMotion="user">
      <div ref={box} role="log" aria-live="polite" onScroll={onScroll} className="h-[420px] overflow-y-auto px-4 py-3">
        {messages.map((m) => {
          const divider = dayOf(m.at) !== lastDay
          lastDay = dayOf(m.at)
          return (
            <React.Fragment key={m.id}>
              {divider && <p className="my-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><span className="h-px flex-1 bg-border" />{new Date(m.at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}<span className="h-px flex-1 bg-border" /></p>}
              <motion.div layout className={cn("group my-1.5 flex", m.me ? "justify-end" : "justify-start")}>
                <div className={cn("relative max-w-[76%] rounded-2xl px-3.5 py-2", m.me ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-muted")}>
                  {editing?.id === m.id ? (
                    <div className="flex items-center gap-2">
                      <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onEdit?.(m.id, draft); setEditing(null) } if (e.key === "Escape") setEditing(null) }} className="w-56 bg-transparent font-mono text-[12px] outline-none" />
                      <Button type="button" variant="ghost" onClick={() => { onEdit?.(m.id, draft); setEditing(null) }} className="text-xs font-medium text-muted-foreground hover:text-foreground">save</Button>
          </MotionConfig>
    </div>
                  ) : (
                    <p className="text-[13px] leading-relaxed">
                      {m.streaming ? <>{m.text}<motion.span aria-hidden animate={{ opacity: [1, 0.2] }} transition={{ duration: 0.5, repeat: Infinity }} className="ml-0.5 inline-block h-3.5 w-[0.55em] translate-y-[2px] bg-current" /></> : m.text}
                    </p>
                  )}
                  <span className={cn("mt-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide", m.me ? "justify-end text-primary-foreground/60" : "text-muted-foreground")}>
                    {!m.me && m.author && <span className="font-medium">{m.author}</span>}<time>{new Date(m.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</time>
                    {m.me && <CheckCheck className="size-3 opacity-70" />}
                    {m.reactions?.length ? <span className="ml-1 rounded-full bg-black/10 px-1.5 py-px text-[10px] font-medium normal-case">{m.reactions.join(" ")}</span> : null}
                  </span>
                  {m.me && canEdit?.(m) && <Button type="button" variant="ghost" aria-label="Edit message" onClick={() => { setEditing(m); setDraft(m.text) }} className="absolute -left-12 top-1 hidden rounded border border-border/60 bg-background px-2 py-0.5 text-xs font-medium group-hover:block">edit</Button>}
                </div>
              </motion.div>
            </React.Fragment>
          )
        })}
      </div>
      <AnimatePresence>
        {newCount > 0 && !stick && (
          <motion.button initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { box.current?.scrollTo({ top: 9e9 }); setStick(true) }} className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[10px] font-black text-background shadow-xl"><ArrowDown className="size-3" /> {newCount} new</motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
