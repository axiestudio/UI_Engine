import * as React from "react"
import { motion } from "motion/react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — GitHub/Copilot-grade inline ghost completion.
// JOB      finish what the user is typing without ever interrupting
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
  className?: string
}

export function GhostSuggestInput({ value, onChange, suggest, placeholder, label = "Field", className }: GhostSuggestInputProps) {
  const [ghost, setGhost] = React.useState<string | null>(null)
  const [latency, setLatency] = React.useState(0)
  const [accepted, setAccepted] = React.useState(0)
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    const t0 = performance.now()
    if (!value.trim()) { setGhost(null); return }
    const t = setTimeout(() => { const s = suggest(value); setGhost(s); setLatency(Math.round(performance.now() - t0)) }, 240)
    return () => clearTimeout(t)
  }, [value, suggest])
  const accept = () => { if (!ghost) return; onChange(value + ghost); setGhost(null); setAccepted((a) => a + 1) }
  return (
    <div className={cn("relative font-sans", className)}>
      <div className="relative">
        <input ref={ref} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => { if (e.key === "Tab" && ghost) { e.preventDefault(); accept() } if (e.key === "Escape") setGhost(null) }} placeholder={placeholder} className="h-10 w-full rounded-lg border border-border/70 bg-background pl-9 pr-20 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <Search aria-hidden className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70" />
        {ghost && value && (
          <span aria-hidden className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 whitespace-pre text-[13px] text-transparent">
            <span className="invisible">{value}</span>
            <motion.span key={accepted + value} initial={{ color: "hsl(var(--muted-foreground))" }} className="text-muted-foreground/80 italic">{ghost}</motion.span>
          </span>
        )}
        <span className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {ghost && <motion.kbd initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="rounded-md border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium">tab ↵</motion.kbd>}
          <span className="text-[10px] text-muted-foreground/60">{latency ? `${latency}ms` : ""}</span>
        </span>
      </div>
      <p className="sr-only" aria-live="polite">{ghost ? "Suggestion available, press Tab to accept." : ""}</p>
    </div>
  )
}
