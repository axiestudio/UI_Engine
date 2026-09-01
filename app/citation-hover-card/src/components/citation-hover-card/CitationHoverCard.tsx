import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ExternalLink, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — answers people can trust have receipts visible on hover.
// JOB      prove generated claims without leaving the page
// SIGNATURE [3] markers sup-style with a dotted underline; hover/focus pops a
//           pointer-tracking CARD (title, domain favicon slot, snippet with the
//          quoted sentence marked); the citation list variant shows the full
//           column underneath with used/unused states.
// A11Y     markers are real buttons (focus shows card); card is aria-linked.

export type Source = { n: number; title: string; domain: string; snippet: string; href?: string }
export type CitationHoverCardProps = { children: string; sources: Source[]; className?: string }

export function CitationHoverCard({ children, sources, className }: CitationHoverCardProps) {
  const [open, setOpen] = React.useState<number | null>(null)
  const [pos, setPos] = React.useState<{ x: number; bottom: number } | null>(null)
  const host = React.useRef<HTMLDivElement>(null)
  // parse [n] tokens
  const parts = React.useMemo(() => children.split(/(\[\d+\])/g), [children])
  return (
    <div ref={host} className={cn("relative text-[13px] leading-[1.75] font-sans", className)} onMouseLeave={() => setOpen(null)}>
      <MotionConfig reducedMotion="user">
      {parts.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/)
        if (!m) return <React.Fragment key={i}>{p}</React.Fragment>
        const n = +m[1]
        const src = sources.find((s) => s.n === n)
        return (
          <Button type="button" variant="ghost" key={i} onMouseEnter={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(), hr = host.current!.getBoundingClientRect(); setOpen(n); setPos({ x: r.left - hr.left + r.width / 2, bottom: hr.bottom - r.top + 10 }) }} onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(), hr = host.current!.getBoundingClientRect(); setOpen(n); setPos({ x: r.left - hr.left + r.width / 2, bottom: hr.bottom - r.top + 10 }) }} aria-label={src ? `Citation ${n}: ${src.title}` : `Citation ${n}`} className="mx-px inline-block align-super font-mono text-[10px] font-medium text-[hsl(var(--info))] underline decoration-dotted underline-offset-2">
            {p}
          </Button>
        )
      })}
      <AnimatePresence>
        {open !== null && pos && sources.find((s) => s.n === open) && (
          <motion.aside initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }} transition={{ type: "spring", stiffness: 380, damping: 26 }} className="absolute z-30 w-72 -translate-x-1/2 rounded-xl border border-border/70 bg-popover p-3.5 shadow-xl" style={{ left: Math.max(140, Math.min(pos.x, (host.current?.clientWidth ?? 600) - 140)), bottom: pos.bottom }}>
            <p className="flex items-start gap-2 text-sm font-medium leading-snug"><Globe aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />{sources.find((s) => s.n === open)!.title}</p>
            <p className="mt-1.5 line-clamp-3 font-serif text-xs italic text-muted-foreground">“{sources.find((s) => s.n === open)!.snippet}”</p>
            <p className="mt-2 flex items-center justify-between text-xs text-muted-foreground">{sources.find((s) => s.n === open)!.domain}{[0, 1, 2].map((d) => <span key={d} className="size-1 rounded-full bg-current opacity-30" />)}</p>
            {sources.find((s) => s.n === open)!.href && <a href={sources.find((s) => s.n === open)!.href} className="mt-1 flex items-center gap-1 text-xs font-medium text-[hsl(var(--info))] hover:underline">open source <ExternalLink className="size-3" /></a>}
          </motion.aside>
        )}
      </AnimatePresence>
          
          </MotionConfig>
    </div>
  )
}
