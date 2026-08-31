import * as React from "react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Keep the day's news one bell away from the chrome.
// ═══ EMOTION     A quiet dock: nothing blinks, nothing nags.
// ═══ SIGNATURE   bottom-end w-80 popover, notices grouped Today / Earlier
//                 with ink dots graded by kind; mark-all fades the list and
//                 drops the badge. Outside click puts it away.

export type NotifKind = "success" | "warn" | "info"
export type NotifItem = { id: string; kind: NotifKind; title: string; body: string; time: string; group: "Today" | "Earlier" }

export type FloatingNotifDockProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  items?: NotifItem[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ITEMS: NotifItem[] = [
  { id: "n1", kind: "success", group: "Today", title: "Visit #4812 confirmed", body: "Tove Abrahamsson · full colour & cut · Chair 1 · 13:00.", time: "09:12" },
  { id: "n2", kind: "warn", group: "Today", title: "Chair 2 running ten late", body: "Freja Holm's bridal trial is behind — the board wants a heads-up.", time: "08:47" },
  { id: "n3", kind: "info", group: "Today", title: "Walk-in window opened", body: "Two chair hours held back until 12:30 — first come, first seated.", time: "08:30" },
  { id: "n4", kind: "info", group: "Earlier", title: "Ledger closed for Tuesday", body: "Eleven chair hours booked, two moved, one cancelled. All inked.", time: "Tue 18:05" },
  { id: "n5", kind: "success", group: "Earlier", title: "Backbar restocked", body: "Klara's toner order landed — the shelf is honest again.", time: "Mon 16:40" },
]

export function FloatingNotifDock({
  eyebrow = "FLOATING UI · NOTIF DOCK",
  title = "The day's news, one bell away.",
  subtitle = "Reception chrome, docked bell. Open it for grouped notices, mark them all read and watch the badge drop — outside click puts it away.",
  items = DEFAULT_ITEMS,
  caption = "BOTTOM-END ANCHOR · ROLE DIALOG · OUTSIDE DISMISS",
  tone = "ink",
  className,
}: FloatingNotifDockProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [open, setOpen] = React.useState(false)
  const [read, setRead] = React.useState<string[]>(["n4", "n5"])
  const unread = items.filter((i) => !read.includes(i.id)).length

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: "dialog" })])

  const markAllRead = () => setRead(items.map((i) => i.id))
  const markOne = (id: string) => setRead((r) => (r.includes(id) ? r : [...r, id]))
  const groups: ("Today" | "Earlier")[] = ["Today", "Earlier"]

  return (
    <SectionShell tone={tone} width={760} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10">
          <div className={cn("mx-auto w-full max-w-md overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]", ink ? "border-background/15" : "border-border")}>
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <MonoLabel className="text-muted-foreground">Quiet Times · Reception</MonoLabel>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[11px] font-bold text-muted-foreground">09:12</span>
                <button
                  type="button"
                  ref={refs.setReference}
                  {...getReferenceProps()}
                  aria-expanded={open}
                  aria-label={`Notifications, ${unread} unread`}
                  className="relative flex size-9 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Bell className="size-4" strokeWidth={2.25} aria-hidden />
                  {unread > 0 && (
                    <span aria-hidden className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-black text-background">
                      {unread}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">On the board</p>
              <ul className="mt-2.5 space-y-1.5">
                {["09:00 · Maja — Chair 1", "10:30 · Jonas — Chair 3", "13:00 · Tove — Chair 1"].map((row) => (
                  <li key={row} className="flex items-center gap-2.5 text-[12px] font-medium text-muted-foreground">
                    <span aria-hidden className="size-[5px] shrink-0 rotate-45 bg-foreground/40" />
                    {row}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[12px] font-medium text-muted-foreground">Open the bell — the day's news sits in one floating panel, anchored bottom-end.</p>
            </div>
          </div>

          {caption && (
            <p className="mx-auto mt-8 flex w-full max-w-md items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </p>
          )}
        </div>
      </InView>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            aria-label="Notifications"
            className="z-50 w-80 rounded-2xl border border-border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Notifications</p>
              <button
                type="button"
                onClick={markAllRead}
                className="rounded-md px-2 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Mark all read
              </button>
            </div>

            {groups.map((group) => {
              const groupItems = items.filter((i) => i.group === group)
              if (groupItems.length === 0) return null
              return (
                <div key={group} className="p-2">
                  <p className="px-2 pb-1 pt-1.5 font-mono text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">{group}</p>
                  <ul>
                    {groupItems.map((item) => {
                      const isRead = read.includes(item.id)
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => markOne(item.id)}
                            className={cn(
                              "flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                              isRead && "opacity-60",
                            )}
                          >
                            <span
                              aria-hidden
                              className={cn("mt-1.5 size-2 shrink-0 rounded-full bg-primary", item.kind === "warn" ? "opacity-70" : item.kind === "info" ? "opacity-40" : undefined, isRead && "opacity-25")}
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-[13px] font-semibold text-foreground">{item.title}</span>
                              <span className="mt-0.5 block text-[12px] font-medium leading-snug text-muted-foreground">{item.body}</span>
                              <span className="mt-1 block font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{item.time}</span>
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}

            <p className="border-t border-border px-4 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {unread} unread · quiettimes.example
            </p>
          </div>
        </FloatingPortal>
      )}
    </SectionShell>
  )
}
