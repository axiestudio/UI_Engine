import * as React from "react"
import { motion, MotionConfig } from "motion/react"
import { Cpu, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { Loader } from "@/components/ai-elements/loader"
import { Shimmer } from "@/components/ai-elements/shimmer"
import {
  PromptInput,
  PromptInputProvider,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  usePromptInputController,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input"

// ═══ APP-PRIMARY — the input box IS the product now.
// JOB      compose requests worth answering
// ROUND 2  rebuilt on AI Elements PromptInput (composer form, enter-to-send,
//           IME-safe submit, registry buttons via input-group; optional
//           PromptInputProvider keeps the host's controlled value in sync)
// SIGNATURE token meter RINGS the send button and reddens near the context
//           limit; model chip cycles through your catalogue with a dice
//           animation; attachments stack as fanned cards; streaming state
//           dims the composer, locks the textarea and shows the live caret
//           (AI Elements Loader + shimmering "streaming" label).
// A11Y     textarea labelled; meter text announced politely; every control a
//           registry Button with focus-visible ring.

export type AiPromptComposerProps = {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  /** fires on submit with the exact text captured by PromptInput */
  onSendText?: (text: string) => void
  /** "submitted" | "streaming" both lock the composer; default = busy */
  status?: "ready" | "submitted" | "streaming" | "error"
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

export function AiPromptComposer({ value, onChange, onSend, onSendText, status, busy, models = [], model, onModel, attachments = [], onAttach, contextLimit = 8000, className }: AiPromptComposerProps) {
  const stream = Boolean(busy) || status === "submitted" || status === "streaming"
  const used = tokens(value)
  const pct = Math.min(1, used / contextLimit)
  const hot = pct > 0.85
  const empty = !value.trim()
  const [announce, setAnnounce] = React.useState("")

  const cycleModel = () => {
    if (!models.length || !onModel) return
    const i = models.findIndex((m) => m.id === model)
    const next = models[(i + 1) % models.length]
    onModel(next.id)
    setAnnounce(`Model switched to ${next.label}.`)
  }

  const handleSubmit = (message: PromptInputMessage) => {
    onSendText?.(message.text)
    onSend()
    setAnnounce(empty ? "" : `Sent ${tokens(message.text)} tokens to ${model ?? "the model"}.`)
  }

  return (
    <div className={cn("relative isolate transition-opacity", stream && "opacity-70", className)}>
      <MotionConfig reducedMotion="user">
        <PromptInputProvider initialInput={value}>
          <ControlledBridge value={value} onChange={onChange} />
          <PromptInput onSubmit={handleSubmit}>
            {attachments.length > 0 && (
              <PromptInputHeader className="gap-2 border-b border-border/60 bg-muted/20 px-3.5 py-2.5">
                {attachments.map((a, i) => (
                  <motion.span
                    key={a}
                    initial={{ scale: 0.8, rotate: 0 }}
                    animate={{ rotate: (i - attachments.length / 2) * 1.6, scale: 1 }}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border/60 bg-card px-2.5 py-1.5 text-xs font-medium"
                  >
                    <Paperclip className="size-3" aria-hidden /> {a}
                  </motion.span>
                ))}
              </PromptInputHeader>
            )}
            <PromptInputTextarea
              aria-label="Prompt"
              placeholder="Ask for something specific — context is cheap, clarity is not."
              disabled={stream}
              className="text-sm leading-relaxed"
            />
            <PromptInputFooter className="gap-2 px-3 pb-2.5">
              <PromptInputTools>
                {onAttach && (
                  <PromptInputButton type="button" aria-label="Attach file" onClick={onAttach} className="rounded-full text-muted-foreground">
                    <Paperclip className="size-4" />
                  </PromptInputButton>
                )}
                {models.length > 0 && (
                  <PromptInputButton
                    type="button"
                    onClick={cycleModel}
                    aria-label={`Model ${models.find((m) => m.id === model)?.label ?? model}. Click to switch.`}
                    className="h-8 gap-1.5 rounded-full border border-border/70 px-3 text-xs font-medium"
                  >
                    <motion.span key={model} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex items-center gap-1.5">
                      <Cpu className="size-3.5" aria-hidden /> {models.find((m) => m.id === model)?.label ?? model}
                    </motion.span>
                  </PromptInputButton>
                )}
                {stream && (
                  <span className="flex items-center gap-1.5 pl-1 text-xs">
                    <Shimmer as="span" duration={1.6} className="text-xs font-medium">streaming…</Shimmer>
                    <span className="inline-block h-3.5 w-[0.55em] animate-pulse bg-[hsl(var(--ring))]" aria-hidden />
                  </span>
                )}
              </PromptInputTools>
              <span className="ml-auto font-mono text-[11px] tabular-nums text-muted-foreground">{used.toLocaleString()} tk{hot ? " · tight" : ""}</span>
              <span className="relative grid size-9 place-items-center">
                <svg aria-hidden viewBox="0 0 36 36" className="pointer-events-none absolute inset-0 -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <motion.circle cx="18" cy="18" r="16" fill="none" stroke={hot ? "hsl(var(--err))" : "hsl(var(--ring))"} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${pct * 100.5} 100.5`} animate={{ strokeDashoffset: 0 }} transition={{ duration: 0.25 }} />
                </svg>
                <PromptInputSubmit
                  aria-label="Send prompt"
                  status={stream ? "streaming" : "ready"}
                  disabled={stream || empty}
                  className={cn("rounded-full", !stream && !empty && (hot ? "bg-[hsl(var(--err))] text-white hover:bg-[hsl(var(--err))]" : ""))}
                >
                  {stream ? <Loader size={14} className="motion-reduce:animate-none" /> : undefined}
                </PromptInputSubmit>
              </span>
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
        <p className="sr-only" aria-live="polite">{used} of {contextLimit} context tokens.{announce ? ` ${announce}` : ""}</p>
      </MotionConfig>
    </div>
  )
}

// Keeps the host-controlled value welded to the provider's text input,
// so external clears (submit, drafts) and typing stay one source of truth.
function ControlledBridge({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { textInput } = usePromptInputController()
  React.useEffect(() => {
    if (textInput.value !== value) textInput.setInput(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setInput is stable; sync on external change only
  }, [value])
  return <SyncChange onChange={onChange} />
}

function SyncChange({ onChange }: { onChange: (v: string) => void }) {
  const { textInput } = usePromptInputController()
  const cb = React.useRef(onChange)
  cb.current = onChange
  const seen = React.useRef(textInput.value)
  React.useEffect(() => {
    if (seen.current !== textInput.value) {
      seen.current = textInput.value
      cb.current(textInput.value)
    }
  }, [textInput.value])
  return null
}
