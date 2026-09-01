import * as React from "react"
import { motion, AnimatePresence, MotionConfig, animate, useMotionValue, useTransform } from "motion/react"
import { Archive, BellOff, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — notification INBOXES, not pop-ups.
// JOB      clear a day of pings in under a minute
// SIGNATURE swipe a row right = DONE (it flies to a counter that bumps),
//           swipe left = SNOOZE chips popover (10m/tomorrow); grouped by
//           unread-today/yesterday; digest line offers "see 14 more".
// A11Y     every swipe has a button twin (Complete / Snooze), announce live.

export type InboxItem = { id: string; title: string; body?: string; at: string; read?: boolean }
export type InboxSnoozeCenterProps = { items: InboxItem[]; onComplete: (id: string) => void; onSnooze: (id: string, span: string) => void; completed: number; className?: string }

export function InboxSnoozeCenter({ items, onComplete, onSnooze, completed, className }: InboxSnoozeCenterProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card font-sans", className)} role="region" aria-label="Notification inbox">
      <MotionConfig reducedMotion="user">
      <header className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
        <p className="text-sm font-semibold">Inbox <span className="text-xs font-medium text-muted-foreground">{items.length} open · {completed} done today</span></p>
        <BellOff aria-hidden className="size-4 text-muted-foreground" />
      </header>
      <AnimatePresence initial={false}>
        {items.length === 0 && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6 py-10 text-center text-sm text-muted-foreground">Inbox zero — wild.</motion.p>}
        {items.map((it) => <SwipeRow key={it.id} it={it} onComplete={onComplete} onSnooze={onSnooze} />)}
      </AnimatePresence>
          </MotionConfig>
    </div>
  )
}
function SwipeRow({ it, onComplete, onSnooze }: { it: InboxItem; onComplete: (id: string) => void; onSnooze: (id: string, s: string) => void }) {
  const x = useMotionValue(0)
  const [menu, setMenu] = React.useState(false)
  const doneOp = useTransform(x, [40, 110], [0, 1])
  const snzOp = useTransform(x, [-110, -40], [1, 0])
  return (
    <div className="relative overflow-hidden border-b last:border-0">
      <motion.div aria-hidden style={{ opacity: doneOp }} className="absolute inset-y-0 left-0 flex w-28 items-center gap-2 bg-[hsl(var(--ok)/0.14)] px-4 text-[hsl(var(--ok))]"><Archive className="size-4" /><span className="text-xs font-semibold uppercase">done</span></motion.div>
      <motion.div aria-hidden style={{ opacity: snzOp }} className="absolute inset-y-0 right-0 flex w-32 items-center justify-end gap-2 bg-[hsl(var(--info)/0.14)] px-4 text-[hsl(var(--info))]"><span className="text-xs font-semibold uppercase">snooze</span><CalendarClock className="size-4" /></motion.div>
      <motion.article drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.5} style={{ x }} onDragEnd={(_, i) => { if (i.offset.x > 100) { onComplete(it.id) } else if (i.offset.x < -100) { setMenu(true); animate(x, 0) } else animate(x, 0, { type: "spring", stiffness: 500, damping: 32 }) }} className="relative flex items-start gap-3 bg-card p-4">
        {!it.read && <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-[hsl(var(--info))]" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{it.title}</p>
          {it.body && <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">{it.body}</p>}
          <p className="mt-1.5 text-xs text-muted-foreground">{it.at} · swipe → done, ← snooze</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Button type="button" variant="ghost" onClick={() => onComplete(it.id)} aria-label={`Mark ${it.title} done`} className="rounded-md border border-border/70 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">done</Button>
          <Button type="button" variant="ghost" onClick={() => setMenu(true)} aria-label={`Snooze ${it.title}`} className="rounded-md border border-border/70 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">zzz</Button>
        </div>
      </motion.article>
      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-1.5 border-t border-border/60 bg-popover/95 p-3 backdrop-blur">
            <span className="mr-auto text-xs text-muted-foreground">snooze until</span>
            {["10 min", "2 hr", "tonight", "tomorrow"].map((s) => <Button type="button" variant="ghost" key={s} onClick={() => { setMenu(false); onSnooze(it.id, s) }} className="rounded-full border border-border/60 px-2.5 py-1 text-xs font-medium hover:bg-accent">{s}</Button>)}
            <Button type="button" variant="ghost" aria-label="Close snooze menu" onClick={() => setMenu(false)} className="px-2 text-xs font-medium text-muted-foreground">✕</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
