import * as React from "react"
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Users,
  Settings,
  LifeBuoy,
  Search,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Menu,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { InView } from "@/components/primitives/in-view"
import {
  Disclosure,
  DisclosureTrigger,
  DisclosureContent,
} from "@/components/primitives/disclosure"

// COMPOSITE — watermelon button/badge/input/separator/avatar (shadcn kit) +
// motion-primitives in-view/disclosure.
// JOB      the calm working sidebar, showcased in context: rail + content
//          column inside one framed surface
// MOVE     InView staggers each nav group on mount; collapse is instant
//          (rail discipline); disclosure owns the growing projects list
// MOBILE   below md the rail becomes an off-canvas overlay (backdrop,
//          Escape, inert when closed). `mobile={false}` disables that —
//          the rail renders fixed-width at every size so a host can mount
//          it inside its own sheet/drawer instead.

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

type NavItem = {
  label: string
  icon: React.ElementType
  count?: number
}

const WORKSPACES: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Projects", icon: FolderKanban, count: 12 },
  { label: "Calendar", icon: CalendarDays, count: 3 },
  { label: "People", icon: Users },
]

const PROJECTS: NavItem[] = [
  { label: "Northline rebuild", icon: FolderKanban },
  { label: "Studio rebrand", icon: FolderKanban },
  { label: "Ops handbook", icon: FolderKanban },
]

const BRIEFS = [
  { title: "Cohort 12 launch checklist", meta: "Updated 2h ago", tag: "In review" },
  { title: "Front-desk hotel — table specs", meta: "Updated 5h ago", tag: "Draft" },
  { title: "Annual report photography", meta: "Updated yesterday", tag: "Shooting" },
  { title: "Menu typography pass", meta: "Updated Mon", tag: "In review" },
]

export type SidebarQuietRailProps = {
  className?: string
  /**
   * Built-in mobile layout (default true): below `md` the rail becomes an
   * off-canvas overlay opened from the content header. Set `false` to
   * disable it — the rail then renders at fixed width on every screen and
   * the host owns mobile (e.g. mount the rail inside its own sheet).
   */
  mobile?: boolean
}

export function SidebarQuietRail({
  className,
  mobile = true,
}: SidebarQuietRailProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [active, setActive] = React.useState("Overview")
  const [projectsOpen, setProjectsOpen] = React.useState(true)
  const [query, setQuery] = React.useState("")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()

  const overlayMode = mobile && isMobile
  const railCollapsed = !overlayMode && collapsed

  React.useEffect(() => {
    if (!overlayMode || !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [overlayMode, mobileOpen])

  const matches = (it: NavItem) =>
    !query || it.label.toLowerCase().includes(query.trim().toLowerCase())

  // 2026 currency: arrow-key nav on the primary list (↑↓ move, Home/End
  // jump) — buttons stay in tab order; arrows are an accelerator.
  const navListRef = React.useRef<HTMLUListElement>(null)
  const onNavKeyDown = (e: React.KeyboardEvent) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return
    const items = Array.from(
      navListRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
    )
    if (!items.length) return
    e.preventDefault()
    const i = items.indexOf(document.activeElement as HTMLButtonElement)
    const next =
      e.key === "ArrowDown"
        ? items[(i + 1) % items.length]
        : e.key === "ArrowUp"
          ? items[(i - 1 + items.length) % items.length]
          : e.key === "Home"
            ? items[0]
            : items[items.length - 1]
    next?.focus()
  }

  const select = (label: string) => {
    setActive(label)
    if (overlayMode) setMobileOpen(false)
  }

  const navRow = (it: NavItem) => (
    <Button
      key={it.label}
      variant={active === it.label ? "secondary" : "ghost"}
      size="sm"
      onClick={() => select(it.label)}
      aria-current={active === it.label ? "page" : undefined}
      title={railCollapsed ? it.label : undefined}
      className={cn(
        "w-full text-[13px] font-semibold text-muted-foreground",
        railCollapsed ? "justify-center px-0" : "justify-start gap-2.5 px-2.5",
        active === it.label && "text-foreground",
      )}
    >
      <it.icon className="size-4 shrink-0" aria-hidden="true" />
      {!railCollapsed && <span className="truncate">{it.label}</span>}
      {!railCollapsed && it.count !== undefined && (
        <Badge variant="secondary" className="ml-auto tabular-nums">
          {it.count}
        </Badge>
      )}
    </Button>
  )

  return (
    <div
      className={cn(
        "relative isolate flex w-full min-h-[560px] overflow-hidden rounded-2xl border bg-background font-sans text-foreground",
        className,
      )}
    >
      {/* Mobile backdrop */}
      {overlayMode && mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 z-30 bg-foreground/40"
        />
      )}

      {/* ─── The rail ─────────────────────────────────────────────── */}
      <aside
        aria-label="Workspace sidebar"
        {...(overlayMode ? { inert: !mobileOpen } : {})}
        className={cn(
          "relative flex shrink-0 flex-col border-r bg-card",
          overlayMode
            ? cn(
                "absolute inset-y-0 left-0 z-40 w-[264px] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
                mobileOpen ? "translate-x-0" : "-translate-x-full",
              )
            : cn(
                "transition-[width] duration-200 ease-out motion-reduce:transition-none",
                collapsed ? "w-[68px]" : "w-[264px]",
              ),
        )}
      >
        {/* Brand row */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center gap-2.5 border-b px-4",
            railCollapsed && "justify-center px-0",
          )}
        >
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg text-[11px] font-bold">
              NL
            </AvatarFallback>
          </Avatar>
          {!railCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] font-bold leading-tight">
                Northline
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Studio workspace
              </p>
            </div>
          )}
          {!railCollapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Switch workspace"
              className="text-muted-foreground"
            >
              <ChevronDown />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className={cn("shrink-0", railCollapsed ? "px-3 py-3" : "p-3")}>
          {railCollapsed ? (
            <Button variant="ghost" size="icon-sm" aria-label="Search" className="mx-auto flex">
              <Search />
            </Button>
          ) : (
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Filter navigation"
                placeholder="Filter…"
                className="h-9 pl-8"
              />
            </div>
          )}
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Workspace">
          <InView
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <ul ref={navListRef} onKeyDown={onNavKeyDown} className="space-y-1">
              {WORKSPACES.filter(matches).map(navRow)}
            </ul>
          </InView>

          {!railCollapsed && <Separator className="my-3" />}

          <InView
            delay={0.08}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <Disclosure open={projectsOpen} onOpenChange={setProjectsOpen}>
              <DisclosureTrigger>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-expanded={projectsOpen}
                  className={cn(
                    "w-full px-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground",
                    railCollapsed && "justify-center px-0",
                  )}
                >
                  {railCollapsed ? (
                    <FolderKanban className="size-4" aria-hidden="true" />
                  ) : (
                    <>
                      <span>Projects</span>
                      <ChevronDown
                        aria-hidden="true"
                        className={cn(
                          "ml-auto size-3.5 transition-transform",
                          projectsOpen && "rotate-180",
                        )}
                      />
                    </>
                  )}
                </Button>
              </DisclosureTrigger>
              {railCollapsed ? null : (
                <DisclosureContent>
                  <ul className="space-y-1 pt-1">
                    {PROJECTS.filter(matches).map(navRow)}
                  </ul>
                </DisclosureContent>
              )}
            </Disclosure>
          </InView>
        </nav>

        {/* Footer */}
        <div className="shrink-0 border-t p-3">
          <ul className="space-y-1">
            <li>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full text-[13px] font-semibold text-muted-foreground",
                  railCollapsed ? "justify-center px-0" : "justify-start gap-2.5 px-2.5",
                )}
              >
                <LifeBuoy className="size-4 shrink-0" aria-hidden="true" />
                {!railCollapsed && <span>Support</span>}
              </Button>
            </li>
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => select("Settings")}
                className={cn(
                  "w-full text-[13px] font-semibold text-muted-foreground",
                  railCollapsed ? "justify-center px-0" : "justify-start gap-2.5 px-2.5",
                )}
              >
                <Settings className="size-4 shrink-0" aria-hidden="true" />
                {!railCollapsed && <span>Settings</span>}
              </Button>
            </li>
          </ul>
          <Separator className="my-3" />
          <div
            className={cn(
              "flex items-center gap-2.5",
              railCollapsed && "justify-center",
            )}
          >
            <div className="relative shrink-0">
              <Avatar className="size-8">
                <AvatarFallback>ES</AvatarFallback>
              </Avatar>
              <span
                aria-hidden="true"
                className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-[hsl(var(--ok))]"
              />
            </div>
            {!railCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold leading-tight">
                  Elin Sandberg
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  elin@northline.co
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse control — desktop affordance */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className={cn(
            "absolute -right-3 top-[72px] z-10 size-6 rounded-full text-muted-foreground",
            overlayMode && "hidden",
          )}
        >
          {collapsed ? (
            <ChevronsRight className="size-3.5" aria-hidden="true" />
          ) : (
            <ChevronsLeft className="size-3.5" aria-hidden="true" />
          )}
        </Button>
      </aside>

      {/* ─── Content space ────────────────────────────────────────── */}
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
          <h2 className="font-display text-lg font-bold tracking-tight">
            {active}
          </h2>
          <Badge variant="outline" className="ml-auto font-mono text-[10px] uppercase tracking-[0.14em]">
            4 briefs
          </Badge>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <ul className="divide-y rounded-xl border">
            {BRIEFS.map((b) => (
              <li key={b.title}>
                <Button
                  variant="ghost"
                  className="h-auto w-full justify-start gap-4 rounded-none px-4 py-3.5 text-left font-normal hover:bg-muted"
                >
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-semibold text-foreground">
                      {b.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {b.meta}
                    </span>
                  </span>
                  <Badge variant="secondary" className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] sm:inline-flex">
                    {b.tag}
                  </Badge>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
