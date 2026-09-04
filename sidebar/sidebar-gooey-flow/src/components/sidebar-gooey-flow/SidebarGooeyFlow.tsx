import * as React from "react"
import { animate, stagger } from "animejs"
import {
  Inbox,
  Send,
  FileEdit,
  Archive,
  Trash2,
  Star,
  Pin,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import GooeyNav from "@/components/reactbits/GooeyNav"
import { useAnimeScope } from "@/hooks/use-anime-scope"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// COMPOSITE — react-bits GooeyNav (SVG-goo section switcher, particle burst)
// + anime.js v4 engine (scope-staggered panel entrances via use-anime-scope
// recipe) + watermelon button/badge/separator (shadcn kit).
// JOB      a mail/inbox rail where switching sections is the delight:
//          the gooey filter blob + particles fly between section tabs
// MOVE     anime.js owns panel choreography — items pop in with a
//          staggered spring on every section change; GooeyNav owns
//          the section-switch burst (its own CSS keyframes)
// MOBILE   below md the rail is an off-canvas overlay (CSS transition —
//          anime.js stays on panel choreography). `mobile={false}` pins
//          the rail at fixed width so the host can use its own sheet.

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 767px)").matches,
  )
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const onChange = () => setIsMobile(mq.matches)
    onChange()
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [])
  return isMobile
}

const SECTIONS = [
  { id: "inbox", label: "Inbox", icon: Inbox, count: 14 },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: FileEdit, count: 3 },
  { id: "archive", label: "Archive", icon: Archive },
]

const THREADS: Record<string, { from: string; subject: string; time: string; unread?: boolean }[]> = {
  inbox: [
    { from: "M. Okafor", subject: "Reel 04 — color pass notes", time: "09:41", unread: true },
    { from: "Lindqvist Studio", subject: "Contract addendum for autumn block", time: "08:17", unread: true },
    { from: "Poster Dept.", subject: "Premiere typography — two routes", time: "Tue", unread: true },
    { from: "Unit B", subject: "Rushes ingest complete — 42 clips", time: "Mon" },
    { from: "Finance", subject: "Q3 production ledger is open", time: "Mon" },
  ],
  sent: [
    { from: "You → M. Okafor", subject: "Approved — locking the grade", time: "09:12" },
    { from: "You → Unit B", subject: "Friday call sheet v2", time: "08:55" },
    { from: "You → Finance", subject: "Ledger questions — two lines", time: "Mon" },
  ],
  drafts: [
    { from: "Draft", subject: "Premiere speech — opening lines…", time: "10:02" },
    { from: "Draft", subject: "Letter to the projection team", time: "Sun" },
    { from: "Draft", subject: "Studio newsletter — September", time: "Sat" },
  ],
  archive: [
    { from: "M. Okafor", subject: "Reel 03 — locked", time: "Sep 12" },
    { from: "Poster Dept.", subject: "Key art route A chosen", time: "Sep 08" },
    { from: "Sound Dept.", subject: "Foley library handoff", time: "Aug 30" },
  ],
}

export type SidebarGooeyFlowProps = {
  className?: string
  /**
   * Built-in mobile layout (default true): below `md` the rail becomes an
   * off-canvas overlay opened from the content header. Set `false` to
   * disable it — the rail then renders at fixed width on every screen and
   * the host owns mobile (e.g. mount the rail inside its own sheet).
   */
  mobile?: boolean
}

export function SidebarGooeyFlow({
  className,
  mobile = true,
}: SidebarGooeyFlowProps) {
  const [section, setSection] = React.useState("inbox")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const overlayMode = mobile && isMobile
  const threads = THREADS[section] ?? []

  React.useEffect(() => {
    if (!overlayMode || !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [overlayMode, mobileOpen])

  // anime.js v4: stagger the panel items on every section change.
  // createScope roots selectors to this component; revert-safe on unmount.
  const listRef = useAnimeScope(() => {
    animate(".sgf-item", {
      opacity: [0, 1],
      y: [18, 0],
      ease: "outExpo",
      duration: 520,
      delay: stagger(55, { start: 40 }),
    })
  }, [section])

  return (
    <div className={cn("relative isolate w-full overflow-hidden", className)}>
      <div className="flex w-full min-h-[560px] overflow-hidden rounded-2xl border bg-background font-sans text-foreground [--color-1:hsl(var(--primary))] [--color-2:hsl(var(--muted-foreground))] [--color-3:hsl(var(--accent-foreground))] [--color-4:hsl(var(--secondary-foreground))]">
        {/* Mobile backdrop */}
        {overlayMode && mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 z-30 bg-foreground/40"
          />
        )}

        {/* ─── The rail ──────────────────────────────────────────── */}
        <aside
          aria-label="Mail sidebar"
          {...(overlayMode ? { inert: !mobileOpen } : {})}
          className={cn(
            "relative flex shrink-0 flex-col border-r bg-card",
            overlayMode
              ? cn(
                  "absolute inset-y-0 left-0 z-40 w-[300px] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
                  mobileOpen ? "translate-x-0" : "-translate-x-full",
                )
              : "w-[300px]",
          )}
        >
          <div className="flex items-center gap-2.5 px-4 pt-5 pb-1">
            <span
              aria-hidden="true"
              className="size-8 shrink-0 rounded-lg bg-primary"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] font-bold leading-tight">
                Postroom
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Northline Studio
              </p>
            </div>
            {overlayMode ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground"
              >
                <X />
              </Button>
            ) : (
              <Badge variant="secondary" className="tabular-nums">
                {threads.length}
              </Badge>
            )}
          </div>

          {/* Gooey section switcher — its lighten-blend filter needs a dark
              plate so the white text reads; --color-* vars feed the
              particles. The pill switches sections via captured click
              (single source of truth with the section state). The
              sgf-plate hook aligns the effect-overlay font with the links
              so the active label doesn't double. */}
          <div
            className="sgf-plate relative mx-3 mt-4 overflow-hidden rounded-xl border border-border bg-[hsl(var(--background))] px-1 py-4 [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:px-2 [&_a]:text-[12px] [&_a]:font-bold"
            onClick={(e) => {
              const a = (e.target as HTMLElement).closest("a")
              if (!a) return
              e.preventDefault()
              const hit = SECTIONS.find((s) => `#${s.id}` === a.getAttribute("href"))
              if (hit) setSection(hit.id)
            }}
          >
            <GooeyNav
              items={SECTIONS.map((s) => ({ label: s.label, href: `#${s.id}` }))}
              initialActiveIndex={0}
              particleCount={14}
              particleDistances={[64, 10]}
              particleR={80}
              colors={[1, 2, 3, 1, 2]}
              animationTime={500}
            />
          </div>

          <div className="space-y-2 px-4 pb-5 pt-4">
            <Button size="sm" className="w-full">
              <FileEdit aria-hidden="true" />
              Compose
            </Button>
            <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-[12px] font-semibold text-muted-foreground">
              <Pin className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Cinema release — locked</span>
              <Star className="ml-auto size-3.5 shrink-0 text-foreground" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 text-[12px] font-semibold text-muted-foreground">
              <Trash2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Swept 2 days ago</span>
            </div>
          </div>

          {/* Account — every sidebar closes with the person using it */}
          <div className="flex items-center gap-3 border-t p-4">
            <Avatar className="size-9">
              <AvatarFallback className="text-[11px] font-bold">KA</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">
                Kim Andersson
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                kim@northline.co
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em]">
              pro
            </Badge>
          </div>
        </aside>

        {/* ─── Content space ─────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
            {mobile && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                className="md:hidden"
              >
                <Menu />
              </Button>
            )}
            <h2 className="font-display text-lg font-bold capitalize tracking-tight">
              {section}
            </h2>
            <p className="ml-auto font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {threads.length} threads
            </p>
          </header>
          <div ref={listRef as React.Ref<HTMLDivElement>} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <ul className="space-y-2">
              {threads.map((t) => (
                <li key={t.subject} className="sgf-item">
                  <Button
                    variant="ghost"
                    className={cn(
                      "h-auto w-full justify-start gap-4 rounded-lg border bg-card px-4 py-3.5 text-left font-normal hover:bg-muted",
                      t.unread && "border-l-2 border-l-primary",
                    )}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-bold text-foreground">
                        {t.from}
                      </span>
                      <span className="block truncate text-[13px] font-medium text-muted-foreground">
                        {t.subject}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                      {t.time}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
