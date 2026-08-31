import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Bell, CheckCheck, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type NotificationKind = "info" | "success" | "warning" | "critical"

export type NotificationItem = {
  id: string
  title: string
  message?: string
  /** Relative or absolute time string — host owns locale. */
  time: string
  kind?: NotificationKind
  read?: boolean
  action?: { label: string; href?: string; onClick?: () => void }
}

export type NotificationsProps = {
  eyebrow?: string
  title?: string
  items: NotificationItem[]
  /** Rows fade/slide out when dismissed (animate-presence). Dismiss button needs onDismiss. */
  onDismiss?: (id: string) => void
  onMarkAllRead?: () => void
  /** "2 min"/"now" right-aligned. */
  timeAgo?: (item: NotificationItem) => string
  emptyLabel?: string
  unreadLabel?: (n: number) => string
  markAllLabel?: string
  emptyHint?: string
  className?: string
}

// ── Sub ──────────────────────────────────────────────────────────────────────

const KIND_DOT: Record<NotificationKind, string> = {
  info: "bg-muted-foreground",
  success: "bg-foreground",
  warning: "bg-muted-foreground/70",
  critical: "bg-destructive",
}

const KIND_LABEL: Record<NotificationKind, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  critical: "Critical",
}

function Row({ n, dismissable, onRead, onDismiss, index }: { n: NotificationItem; dismissable?: boolean; onRead?: (id: string) => void; onDismiss?: (id: string) => void; index: number }) {
  const kind = n.kind ?? "info"
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
      className={cn(
        "group flex items-start gap-3 rounded-2xl border p-4 transition-colors",
        n.read ? "border-border bg-card/40" : "border-border bg-card shadow-xs"
      )}
    >
      <span aria-hidden className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", KIND_DOT[kind], n.read && "opacity-35")} />
      <div
        className="min-w-0 flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        onClick={() => !n.read && onRead?.(n.id)}
        onKeyDown={(e) => {
          if (!n.read && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault()
            onRead?.(n.id)
          }
        }}
        role={n.read ? undefined : "button"}
        tabIndex={n.read ? undefined : 0}
        aria-label={n.read ? undefined : `Mark ${n.title} read`}
      >
        <div className="flex items-center gap-2">
          <p className={cn("truncate text-sm font-bold tracking-tight", n.read && "text-muted-foreground")}>{n.title}</p>
          {!n.read && <span className="rounded-full bg-foreground px-1.5 py-px font-mono text-[8px] font-black uppercase tracking-widest text-background">new</span>}
          <span className={cn("ml-auto shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest", KIND_DOT[kind].replace("bg-", "text-"), "opacity-80")}>{KIND_LABEL[kind]}</span>
        </div>
        {n.message && <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground line-clamp-2">{n.message}</p>}
        <div className="mt-1.5 flex items-center gap-3">
          <p className="font-mono text-[10px] font-semibold text-muted-foreground">{n.time}</p>
          {n.action && (
            <a
              href={n.action.href ?? "#"}
              onClick={n.action.onClick}
              className="text-xs font-bold underline-offset-4 hover:underline"
            >
              {n.action.label}
            </a>
          )}
        </div>
      </div>
      {dismissable && onDismiss && (
        <button
          type="button"
          onClick={() => onDismiss(n.id)}
          aria-label={`Dismiss ${n.title}`}
          className="rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.li>
  )
}

// ── Notifications ────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = [
  { id: "n1", title: "Bench time confirmed", message: "Saturday 09:00 — bring the drawings.", time: "2 min ago", kind: "success" },
  { id: "n2", title: "Oak delivery delayed", message: "New ETA Thursday. Nothing on your job slips.", time: "1 h ago", kind: "warning" },
  { id: "n3", title: "Invoice #114 paid", message: "Thank you — receipt attached.", time: "Yesterday", kind: "info", read: true },
]

export function Notifications({
  eyebrow = "Inbox",
  title = "Notifications",
  items = DEFAULT_ITEMS,
  onDismiss,
  onMarkAllRead,
  emptyLabel = "You're all caught up",
  unreadLabel = (n) => `${n} unread`,
  markAllLabel = "Mark all read",
  className,
}: NotificationsProps) {
  const [readMap, setReadMap] = React.useState<Record<string, boolean>>({})
  const merged = items.map((n) => ({ ...n, read: n.read || !!readMap[n.id] }))
  const unread = merged.filter((n) => !n.read)

  const markRead = (id: string) => setReadMap((m) => ({ ...m, [id]: true }))
  const readAll = () => {
    items.forEach((n) => setReadMap((m) => ({ ...m, [n.id]: true })))
    onMarkAllRead?.()
  }

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[680px] px-4 py-16 sm:px-6">
          <header className="mb-6 flex items-end justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  <Bell className="h-3 w-3" /> {eyebrow}
                </p>
              )}
              <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">{title}</h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{unread.length ? unreadLabel(unread.length) : "0 unread"}</span>
              {onMarkAllRead !== undefined || unread.length > 0 ? (
                <button
                  type="button"
                  onClick={readAll}
                  disabled={unread.length === 0}
                  className="inline-flex h-8 items-center gap-1 rounded-full border bg-card px-3 text-xs font-bold transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> {markAllLabel}
                </button>
              ) : null}
            </div>
          </header>

          {merged.length === 0 ? (
            <p role="status" className="rounded-[20px] border border-dashed bg-muted/20 px-6 py-10 text-center text-sm font-medium text-muted-foreground">
              {emptyLabel}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {merged.map((n, i) => (
                  <Row key={n.id} n={n} index={i} dismissable={!!onDismiss} onRead={markRead} onDismiss={onDismiss} />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </InView>
    </section>
  )
}
