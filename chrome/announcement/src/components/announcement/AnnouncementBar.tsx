import * as React from "react"
import { X } from "lucide-react"
import { TextRoll } from "@/components/primitives/text-roll"
import { TextLoop } from "@/components/primitives/text-loop"
import { BorderTrail } from "@/components/primitives/border-trail"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Types ────────────────────────────────────────────────────────────────────
export type AnnouncementMessage = {
  text?: string
  /** Text before/after a rolled word-pair, e.g. "Now " + roll("open"->"booked") + " again". */
  before?: string
  roll?: string[]
  after?: string
}

export type AnnouncementBarProps = {
  /** One string or message object — or an array that rotates on a timer. */
  messages?: (string | AnnouncementMessage)[] | string | AnnouncementMessage
  /** Whole-strip action link shown as a chip on the right of the message. */
  cta?: { label: string; href: string }
  tone?: "ink" | "paper"
  /** Persist dismissal with this localStorage key (so it doesn't return). */
  dismissKey?: string
  /** Seconds per message when rotating. Default 3. */
  interval?: number
  className?: string
}

function normalize(messages: AnnouncementBarProps["messages"]): AnnouncementMessage[] {
  if (typeof messages === "string") return [{ text: messages }]
  if (Array.isArray(messages)) return messages.map((m) => (typeof m === "string" ? { text: m } : m))
  return messages && typeof messages === "object" ? [messages] : []
}

function renderMessage(m: AnnouncementMessage) {
  if (m.roll && m.roll.length === 2) {
    // TextRoll takes an two-word string: first word exits, second enters.
    const phrase = `${m.before ?? ""}${m.roll.join(" ")}${m.after ?? ""}`
    return <TextRoll duration={0.55} className="relative isolate overflow-hidden font-mono text-[11px] font-bold uppercase tracking-widest sm:text-xs" children={phrase} />
  }
  return <span>{m.text ?? `${m.before ?? ""}${m.after ?? ""}`}</span>
}

// ── AnnouncementBar ──────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_ANNOUNCEMENT_MESSAGES = ["Summer slots open", "Now roll booking", "Free first-visit consultation"]

export function AnnouncementBar({
  messages = DEMO_ANNOUNCEMENT_MESSAGES,
  cta,
  tone = "ink",
  dismissKey,
  interval = 6,
  className,
}: AnnouncementBarProps) {
  const [open, setOpen] = React.useState(() => {
    if (!dismissKey) return true
    try {
      return typeof window === "undefined" ? true : window.localStorage.getItem(dismissKey) !== "1"
    } catch {
      return true
    }
  })
  const [paused, setPaused] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  if (!open) return null
  const list = normalize(messages)
  if (!list.length) return null
  const ink = tone === "ink"

  const label = "Announcement"
  const dismiss = () => {
    setOpen(false)
    if (dismissKey) {
      try {
        window.localStorage.setItem(dismissKey, "1")
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <div
      role="region"
      aria-label={label}
      className={cn("relative isolate w-full overflow-hidden", ink ? "bg-foreground text-background" : "border-b bg-card text-foreground", className)}
    >
      <BorderTrail className={ink ? "bg-background/40" : "bg-foreground/25"} size={90} />
      {/* corner ticks — placed like a printed ribbon, not a banner dump */}
      <span aria-hidden className={cn("pointer-events-none absolute inset-0 hidden sm:block", ink ? "text-background/35" : "text-foreground/25")}>
        <span className="absolute left-2 top-2 size-2 border-l border-t border-current" />
        <span className="absolute right-2 top-2 size-2 border-r border-t border-current" />
        <span className="absolute bottom-2 left-2 size-2 border-b border-l border-current" />
        <span className="absolute bottom-2 right-2 size-2 border-b border-r border-current" />
      </span>
      <div
        className="mx-auto flex h-10 w-full max-w-[1280px] items-center justify-center gap-4 px-12 text-center sm:px-14"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {list.length === 1 || reduce ? (
          renderMessage(list[0]!)
        ) : (
          <TextLoop interval={paused ? 9999 : interval} className="font-mono text-[11px] font-semibold uppercase tracking-widest sm:text-xs">
            {list.map((m, i) => (
              <span key={i}>{renderMessage(m)}</span>
            ))}
          </TextLoop>
        )}
        {cta && (
          <a
            href={cta.href}
            className={cn("shrink-0 rounded-md px-3 py-1 font-display text-xs font-semibold uppercase tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", ink ? "bg-background text-foreground hover:bg-background/90" : "bg-foreground text-background hover:bg-foreground/90")}
          >
            {cta.label}
          </a>
        )}
      </div>
      <Button
        type="button"
        onClick={dismiss}
        aria-label={`Dismiss ${label.toLowerCase()}`}
        className={cn("absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full opacity-70 transition-opacity hover:opacity-100", ink ? "text-background hover:bg-background/10" : "text-foreground hover:bg-accent")}
      >
        <X className="h-3.5 w-3.5 stroke-[2.5]" />
      </Button>
    </div>
  )
}
