import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — GitHub/Copilot-grade inline ghost completion.
// JOB      finish what the user is typing without ever interrupting
// ROUND 2  the field is the registry Input; the suggestion pipeline is real:
//           240ms debounce (latency badge proves it fires), tab-accept replays
//           the value through the SAME suggest() the host gave us, and typing
//           past/past-wrong dissolves the ghost on the very next keystroke.
// SIGNATURE the continuation renders GHOSTED (muted) after the caret inside a
//           mirror layer; Tab accepts with a brightening flash that runs
//           through the absorbed text; typing again dissolves it instantly;
//           latency badge shows the debounce actually working.
// A11Y     the ghost is aria-hidden (it's a suggestion); composing remains
//          plain text I/O; accept announced politely.

export type GhostSuggestInputProps = {
  value: string
  onChange: (v: string) => void
  suggest: (v: string) => string | null
  placeholder?: string
  label?: string
  /** debounce in ms for the suggestion lookup (default 240) */
  debounceMs?: number
  className?: string
}

export function GhostSuggestInput({ value, onChange, suggest, placeholder, label = "Field", debounceMs = 240, className }: GhostSuggestInputProps) {
  const [ghost, setGhost] = React.useState<string | null>(null)
  const [latency, setLatency] = React.useState(0)
  const [pending, setPending] = React.useState(false)
  const [accepted, setAccepted] = React.useState<{ flash: string; n: number } | null>(null)
  const ref = React.useRef<HTMLInputElement>(null)

  // debounced suggestion — "think…" state makes the debounce visible, the
  // badge reports the settle delay so you can SEE it working.
  const ghostFor = React.useRef<string>("")
  React.useEffect(() => {
    if (!value.trim()) { setGhost(null); setPending(false); return }
    setPending(true)
    const t0 = performance.now()
    const t = window.setTimeout(() => {
      const s = suggest(value)
      ghostFor.current = value
      setGhost(s)
      setLatency(Math.max(1, Math.round(performance.now() - t0)))
      setPending(false)
    }, debounceMs)
    return () => window.clearTimeout(t)
  }, [value, suggest, debounceMs])

  // typing past a suggestion dissolves it the SAME tick — never stale ghosts
  React.useEffect(() => {
    if (ghost && ghostFor.current !== value) setGhost(null)
  }, [value, ghost])

  const accept = () => {
    if (!ghost) return
    const absorbed = ghost
    onChange(value + absorbed)
    setGhost(null)
    setAccepted((a) => ({ flash: absorbed, n: (a?.n ?? 0) + 1 }))
    window.setTimeout(() => setAccepted(null), 650)
    // move caret to the end after commit
    requestAnimationFrame(() => { const el = ref.current; if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length) } })
  }

  return (
    <div className={cn("relative isolate overflow-hidden font-sans", className)}>
      <MotionConfig reducedMotion="user">
        <div className="relative">
          <Input
            ref={ref}
            aria-label={label}
            aria-hint={ghost ? `Inline suggestion: ${ghost}. Press Tab to accept.` : undefined}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Tab" && ghost) { e.preventDefault(); accept() } if (e.key === "Escape") setGhost(null) }}
            placeholder={placeholder}
            className="h-10 pl-9 pr-20 text-sm"
          />
          <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
          {ghost && value && (
            <span aria-hidden className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-pre text-[13px] text-transparent">
              <span className="invisible">{value}</span>
              <span className="text-muted-foreground/80 italic">{ghost}</span>
            </span>
          )}
          {/* accept flash: the absorbed text brightens once, then hands over to plain input */}
          <AnimatePresence>
            {accepted && value.endsWith(accepted.flash) && (
              <motion.span
                key={accepted.n}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-pre text-[13px] text-transparent"
              >
                <span className="invisible">{value.slice(0, -accepted.flash.length)}</span>
                <motion.span
                  initial={{ backgroundColor: "hsl(var(--info)/0.45)", color: "hsl(var(--foreground))" }}
                  animate={{ backgroundColor: "hsl(var(--info)/0)", color: "hsl(var(--muted-foreground)/0)" }}
                  transition={{ duration: 0.65, ease: "easeOut" }}
                  className="rounded-sm font-medium"
                >
                  {accepted.flash}
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
          <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            {pending ? (
              <span className="font-mono text-[10px] text-muted-foreground/60">think…</span>
            ) : ghost ? (
              <motion.kbd initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">tab ↵</motion.kbd>
            ) : null}
            {Boolean(latency) && !pending && <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">{latency}ms</span>}
            {accepted && <span className="font-mono text-[10px] tabular-nums text-[hsl(var(--info))]">×{accepted.n}</span>}
          </span>
        </div>
        <p className="sr-only" aria-live="polite">{accepted ? `Suggestion accepted: ${accepted.flash}. Total ${accepted.n}.` : ghost && !pending ? "Suggestion available, press Tab to accept." : ""}</p>
      </MotionConfig>
    </div>
  )
}
