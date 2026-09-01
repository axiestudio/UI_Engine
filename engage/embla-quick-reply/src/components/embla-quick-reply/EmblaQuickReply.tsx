import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { Send } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel, SectionHead } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Resolve a support thread before the kettle boils.
// ═══ EMOTION     The calm desk at the front — one flick, one tap, done.
// ═══ SIGNATURE   A drag-free chip rail under a live thread; a tap sends the
//                 chip as a right-aligned bubble, the studio answers 800 ms
//                 later, and used chips retire at half ink.

export type EmblaQuickReplyProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  replies?: string[]
  autoReply?: string
  caption?: string
  onSent?: (reply: string) => void
  className?: string
}

const DEFAULT_REPLIES = [
  "Of course — which time?",
  "Friday is full, Saturday?",
  "Moved! New time sent.",
  "Let me check the book",
  "Anything else?",
  "You're welcome in",
]

const DEFAULT_AUTO_REPLY = "Perfect, see you Friday ✂️"

type Message = { id: number; from: "vera" | "you" | "studio"; text: string; meta: string }

export function EmblaQuickReply({
  eyebrow = "QUIET TIMES STUDIO · SUPPORT",
  title = "Answer Vera in one flick.",
  subtitle = "Drag the rail, tap a reply, watch the thread resolve. Used chips retire — no accidental double-sends.",
  replies = DEFAULT_REPLIES,
  autoReply = DEFAULT_AUTO_REPLY,
  caption = "DRAG-FREE RAIL · ONE TAP · CHIPS RETIRE",
  onSent,
  className,
}: EmblaQuickReplyProps) {
  const reducedMotion = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
  const [emblaRef, embla] = useEmblaCarousel({ dragFree: true, containScroll: "keepSnaps" })
  const [messages, setMessages] = React.useState<Message[]>([
    { id: 1, from: "vera", text: "Hi! Can I move my appointment to Friday?", meta: "VERA · 13:02" },
  ])
  const [used, setUsed] = React.useState<string[]>([])
  const idRef = React.useRef(1)
  const timersRef = React.useRef<number[]>([])
  const threadRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const timers = timersRef.current
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [])

  // keep the newest bubble in view
  React.useEffect(() => {
    const el = threadRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" })
  }, [messages, reducedMotion])

  const send = (reply: string) => {
    if (used.includes(reply)) return
    idRef.current += 1
    const sentId = idRef.current
    setMessages((m) => [...m, { id: sentId, from: "you", text: reply, meta: "YOU · NOW" }])
    setUsed((u) => [...u, reply])
    onSent?.(reply)
    timersRef.current.push(
      window.setTimeout(() => {
        idRef.current += 1
        setMessages((m) => [...m, { id: idRef.current, from: "studio", text: autoReply, meta: "QUIET TIMES · NOW" }])
      }, 800),
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} align="center" className="mx-auto" />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mx-auto mt-8 max-w-[520px]">
          <div className="overflow-hidden rounded-[16px] border border-border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]">
            {/* chrome header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <MonoLabel>QUIET TIMES · SUPPORT</MonoLabel>
              <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-primary/60" />
                Online
              </span>
            </div>

            {/* thread */}
            <div ref={threadRef} className="h-56 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite" aria-label="Conversation">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={message.id === 1 || reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className={cn("flex flex-col", message.from === "you" ? "items-end" : "items-start")}
                >
                  <span className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{message.meta}</span>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13px] font-medium leading-5",
                      message.from === "you" && "rounded-br-md bg-foreground text-background",
                      message.from === "vera" && "rounded-bl-md bg-muted text-foreground",
                      message.from === "studio" && "rounded-bl-md border border-border bg-background text-foreground",
                    )}
                  >
                    {message.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* drag-free chip rail */}
            <div className="relative border-t border-border px-5 py-3.5">
              <div className="overflow-hidden" ref={emblaRef} role="group" aria-roledescription="carousel" aria-label="Suggested replies">
                <div className="flex gap-2 py-0.5 touch-pan-y">
                  {replies.map((reply) => {
                    const isUsed = used.includes(reply)
                    return (
                      <button
                        key={reply}
                        type="button"
                        disabled={isUsed}
                        onClick={() => send(reply)}
                        aria-label={`Send reply: ${reply}`}
                        className={cn(
                          "h-9 shrink-0 grow-0 whitespace-nowrap rounded-full border px-4 text-[12px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isUsed
                            ? "border-border bg-muted text-muted-foreground opacity-40"
                            : "border-border bg-background text-foreground hover:border-foreground/40 hover:bg-muted/60",
                        )}
                      >
                        {reply}
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* edge fades — the rail continues */}
              <span aria-hidden className="pointer-events-none absolute inset-y-3.5 left-0 w-8 bg-[linear-gradient(to_right,var(--card),transparent)]" />
              <span aria-hidden className="pointer-events-none absolute inset-y-3.5 right-0 w-8 bg-[linear-gradient(to_left,var(--card),transparent)]" />
            </div>

            {/* decorative composer */}
            <div aria-hidden className="pointer-events-none flex items-center gap-2 border-t border-border px-5 py-3">
              <div className="flex h-9 flex-1 items-center rounded-full border border-border bg-background px-3.5 text-[12px] text-muted-foreground/70">
                Skriv ett svar…
              </div>
              <span className="grid size-9 place-items-center rounded-full bg-muted text-muted-foreground">
                <Send className="size-4" />
              </span>
            </div>
          </div>

          {caption && (
            <p className="mt-5 flex items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <span aria-hidden>●</span>
              <span>{caption}</span>
            </p>
          )}
        </div>
      </InView>
    </div>
  )
}
