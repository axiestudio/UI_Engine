import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ArrowDownIcon, CheckCheck, Pencil, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"
import { Conversation, ConversationContent, ConversationEmptyState } from "@/components/ai-elements/conversation"
import { Message, MessageContent, MessageActions, MessageAction } from "@/components/ai-elements/message"
import { Loader } from "@/components/ai-elements/loader"
import { Shimmer } from "@/components/ai-elements/shimmer"
import { useStickToBottomContext } from "use-stick-to-bottom"

// ═══ APP-PRIMARY — support channels & team chat that don't yank you around.
// JOB      read a live thread without losing your place
// ROUND 2  the scroller IS AI Elements Conversation (use-stick-to-bottom owns
//           pin-to-tail behavior — the old hand-rolled onScroll math is gone);
//           bubbles are Message/MessageContent; the edit affordance is a real
//           MessageActions bar; the streaming tail shows Loader + shimmer caret.
// SIGNATURE stick-to-bottom (follow only when at the tail, otherwise a
//           "new replies ↓ N" pill); date dividers compress as gaps grow;
//           reply-quote rails re-render the quoted message inline; own
//           messages offer reedit INSIDE a live N-second window (countdown
//           visible; saving replaces the content and stamps it "edited").
// API      messages props; host owns send/edit/streaming state.
// A11Y     log role + polite live region; timestamps are time elements.

export type Msg = { id: string; me?: boolean; author?: string; at: string; text: string; streaming?: boolean; reactions?: string[]; quote?: string }
export type ChatThreadVirtualProps = { messages: Msg[]; canEdit?: (m: Msg) => boolean; onEdit?: (id: string, text: string) => void; reeditWindowSec?: number; className?: string;
  /**
   * `true` (default) renders the full marketing scene. `false` renders the
   * bare thread card for embedding inside host consoles that already own
   * the header — e.g. incident-command's support channel panel.
   */
  scene?: boolean
}

export function ChatThreadVirtual({ messages, canEdit, onEdit, reeditWindowSec = 90, className, scene = true }: ChatThreadVirtualProps) {
  const [count, setCount] = React.useState(messages.length)
  React.useEffect(() => { if (messages.length > count) setCount(messages.length) }, [messages.length, count])
  const channel = messages.find((m) => !m.me)?.author ?? "live thread"
  const own = messages.filter((m) => m.me).length
  const thread = (
    <>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 px-6 py-4">
        <h3 className="text-sm font-bold tracking-tight">{channel}</h3>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {own} of yours · follow the tail
        </span>
      </header>
      <Conversation className="h-[430px]" aria-live="polite">
        {messages.length === 0 ? (
          <ConversationEmptyState title="The channel is quiet" description="Newest traffic will land here." />
        ) : (
          <ConversationContent className="gap-1.5 px-5 py-4">
            <Thread messages={messages} canEdit={canEdit} onEdit={onEdit} reeditSec={reeditWindowSec} />
          </ConversationContent>
        )}
        <NewRepliesPill messages={messages} />
      </Conversation>
      <p className="sr-only" aria-live="polite">{count} messages in the thread.</p>
    </>
  )

  // Bare embed: host console owns header + card chrome, preset contributes the thread.
  if (!scene) return <div className={cn("w-full", className)}>{thread}</div>

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background", className)}>
      <MotionConfig reducedMotion="user">
        <div className="mx-auto w-full max-w-[720px] px-4 py-12 sm:px-6 sm:py-14">
          {/* ── scene header ─────────────────────────────────────────── */}
          <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em]">Support channel · {messages.length} messages</span>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">Stay near the tail.</h2>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-muted-foreground">
              A live thread that never drags you along — follow only while you&apos;re at the bottom, and a pill taps you back when replies land.
            </p>
          </InView>

          {/* ── hero card: the scroller ──────────────────────────────── */}
          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_48px_-32px_hsl(var(--foreground)/0.5)]">
            {thread}
          </div>

          {/* ── caption line ─────────────────────────────────────────── */}
          <p className="mx-auto mt-6 flex items-center justify-between border-t border-border/60 pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <span>AI-elements scroller · Stick to tail · Reedit window</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </MotionConfig>
    </section>
  )
}

function Thread({ messages, canEdit, onEdit, reeditSec }: { messages: Msg[]; canEdit?: (m: Msg) => boolean; onEdit?: (id: string, text: string) => void; reeditSec: number }) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const iv = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(iv)
  }, [])
  const [editing, setEditing] = React.useState<Msg | null>(null)
  const [draft, setDraft] = React.useState("")
  const [editedIds, setEditedIds] = React.useState<string[]>([])

  const save = (id: string) => { onEdit?.(id, draft); setEditedIds((e) => [...e, id]); setEditing(null) }

  let lastDay = ""
  return (
    <>
      {messages.map((m) => {
        const d = new Date(m.at).toDateString()
        const divider = d !== lastDay
        lastDay = d
        const leftMs = new Date(m.at).getTime() + reeditSec * 1000 - now
        const editable = Boolean(m.me && canEdit?.(m)) && leftMs > 0
        const quoteTarget = m.quote ? messages.find((x) => x.id === m.quote) : null
        const isEditing = editing?.id === m.id
        return (
          <React.Fragment key={m.id}>
            {divider && (
              <p className="my-2 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="h-px flex-1 bg-[hsl(var(--app-line))]" />{new Date(m.at).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}<span className="h-px flex-1 bg-[hsl(var(--app-line))]" />
              </p>
            )}
            <motion.div layout initial={false}>
              <Message from={m.me ? "user" : "assistant"} className="max-w-[80%]">
                <MessageContent className={cn("text-[13px]", !m.me && "rounded-lg rounded-bl-md bg-muted px-4 py-2.5", m.me && "rounded-br-md", isEditing && "ring-2 ring-[hsl(var(--ring))]")}
                >
                  {quoteTarget && (
                    <span className="mb-1 flex items-start gap-1.5 border-l-2 border-[hsl(var(--pinned))] pl-2 text-[11px] font-normal italic text-muted-foreground">
                      <Quote className="mt-px size-3 shrink-0 text-[hsl(var(--pinned))]" aria-hidden />{quoteTarget.me ? "you" : quoteTarget.author}: {quoteTarget.text.slice(0, 64)}{quoteTarget.text.length > 64 ? "…" : ""}
                    </span>
                  )}
                  {isEditing ? (
                    <div className="flex items-center gap-2 py-0.5">
                      <Input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") save(m.id); if (e.key === "Escape") setEditing(null) }} aria-label="Reedit message" className="w-56 bg-transparent font-mono text-[12px] text-foreground outline-none" />
                      <Button type="button" variant="outline" size="sm" onClick={() => save(m.id)} className="h-6 px-2 text-[11px] font-medium text-foreground">save</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)} className="h-6 px-2 text-[11px] text-muted-foreground">esc</Button>
                    </div>
                  ) : (
                    <p className="leading-relaxed">
                      {m.text}
                      {m.streaming && (
                        <>
                          <motion.span aria-hidden animate={{ opacity: [1, 0.2] }} transition={{ duration: 0.5, repeat: Infinity }} className="ml-0.5 inline-block h-3.5 w-[0.55em] translate-y-[2px] bg-current" />
                          <Shimmer as="span" duration={1.8} className="ml-2 align-middle text-[10px] font-medium">writing…</Shimmer>
                        </>
                      )}
                    </p>
                  )}
                  <span className={cn("mt-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide", m.me ? "justify-end text-muted-foreground" : "text-muted-foreground")}>
                    {!m.me && m.author && <span className="font-medium">{m.author}</span>}<time dateTime={m.at}>{new Date(m.at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</time>
                    {m.me && !m.streaming && <CheckCheck className="size-3 opacity-70" />}
                    {editedIds.includes(m.id) && <span className="normal-case opacity-70">· edited</span>}
                    {m.streaming && <Loader size={11} className="motion-reduce:animate-none opacity-70" />}
                    {m.reactions?.length ? <span aria-label={`Reactions: ${m.reactions.join(" ")}`} className="ml-1 rounded-full bg-background/10 px-1.5 py-px text-[10px] font-medium normal-case">{m.reactions.join(" ")}</span> : null}
                  </span>
                </MessageContent>
                {m.me && (editable || isEditing) && (
                  <MessageActions className={cn(isEditing ? "opacity-100" : "opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100")}>
                    <MessageAction
                      tooltip={isEditing ? `Reedit open — ${Math.ceil(leftMs / 1000)}s left in the window` : `Reedit — window closes in ${Math.ceil(leftMs / 1000)}s`}
                      label={`Edit message: ${m.text.slice(0, 40)}`}
                      onClick={() => { setEditing(m); setDraft(m.text) }}
                    >
                      <Pencil className="size-3.5" />
                    </MessageAction>
                    {!isEditing && <span aria-hidden className="font-mono text-[10px] tabular-nums text-muted-foreground">{Math.ceil(leftMs / 1000)}s</span>}
                  </MessageActions>
                )}
              </Message>
            </motion.div>
          </React.Fragment>
        )
      })}
    </>
  )
}

// Sits inside <Conversation> so isAtBottom/scrollToBottom come from the SAME
// use-stick-to-bottom context that drives the scroller — no hand-rolled
// scroll anchoring anywhere. The pill only counts content growth.
function NewRepliesPill({ messages }: { messages: Msg[] }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext()
  const [newCount, setNewCount] = React.useState(0)
  const prev = React.useRef(messages.length)
  React.useEffect(() => {
    const grew = messages.length - prev.current
    prev.current = messages.length
    if (grew > 0) setNewCount((n) => (isAtBottom ? 0 : n + grew))
  }, [messages.length, isAtBottom])
  React.useEffect(() => {
    if (isAtBottom) setNewCount(0)
  }, [isAtBottom])
  return (
    <AnimatePresence>
      {!isAtBottom && newCount > 0 && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="absolute bottom-3 left-[50%] z-10 -translate-x-[50%]">
          <Button type="button" onClick={() => scrollToBottom()} aria-label={`${newCount} new replies — jump to the tail`} className="h-auto gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-[10px] font-black text-background shadow-xl hover:bg-foreground hover:opacity-90">
            <ArrowDownIcon className="size-3" /> {newCount} new
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
