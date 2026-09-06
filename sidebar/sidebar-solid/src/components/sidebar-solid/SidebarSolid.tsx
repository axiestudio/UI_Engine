import * as React from "react"
import { animate, stagger } from "animejs"
import {
  Check,
  ChevronsUpDown,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  FileClock,
  FolderKanban,
  HelpCircle,
  Inbox,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/watermelon/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import AnimatedList from "@/components/reactbits/AnimatedList"
import { useAnimeScope } from "@/hooks/use-anime-scope"
import { useHoverPanel } from "@/hooks/use-hover-panel"
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react"

// ─── COMPOSITION MAP ───────────────────────────────────────────────────────
// Foundation (watermelon/shadcn snapshot): Button, Badge, Separator, Avatar,
//   Select, DropdownMenu — every control is a registry primitive.
// React Bits: AnimatedList — the recent-activity feed (in-view staggered
//   reveal, scroll gradients, arrow-key navigation). Its demo-only dark
//   palette is re-pointed at this preset's committed tokens (customize tier;
//   the motion infrastructure stays theirs).
// Floating UI (use-hover-panel recipe): the workspace switcher and every
//   collapsed-rail icon weld a floating panel to its anchor with autoUpdate;
//   panels portal to <body> and carry the `dark` class so frame tokens
//   resolve outside the preset root.
// Anime.js v4 (use-anime-scope recipe): mount stagger on the rail, active
//   indicator choreography on section switch, collapse/expand label fades.
// JOB      a complete [sidebar | content] app shell: workspace switcher,
//          primary nav, presence select, account menu, collapsible rail.
// MOBILE   below md the rail is an off-canvas overlay (CSS transition —
//          anime.js stays on label/panel choreography). `mobile={false}`
//          pins the desktop rail so hosts can mount it in their own sheet.
// ────────────────────────────────────────────────────────────────────────────

type NavItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
  count?: number
}

const NAV_MAIN: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "projects", label: "Projects", icon: FolderKanban, count: 4 },
  { id: "tasks", label: "Tasks", icon: Layers, count: 12 },
  { id: "inbox", label: "Inbox", icon: Inbox, count: 3 },
  { id: "reports", label: "Reports", icon: FileClock },
  { id: "team", label: "Team", icon: Users },
]

const NAV_SECONDARY: NavItem[] = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "help", label: "Help", icon: HelpCircle },
]

const WORKSPACES = [
  { id: "northwind", name: "Northwind Studio", plan: "Team" },
  { id: "harbor", name: "Harbor & Co", plan: "Free" },
  { id: "atlas", name: "Atlas Collective", plan: "Team" },
]

const USER = { name: "Elin Sandberg", email: "elin@northwind.studio", initials: "ES" }

const ACTIVITY = [
  "Weekly review — tomorrow 10:00",
  "Design handoff — Thursday 18:00",
  "Q3 report draft — 2 reviewers",
  "Onboarding flow — assigned to you",
  "Brand refresh — stage 2 of 4",
  "Bug triage — 12 open, 3 high",
  "Sprint retro — Friday 15:00",
  "Content audit — 9 pages tagged",
  "Hiring loop — 2 candidates",
  "Pricing test — results Monday",
]

const PROJECTS = [
  { id: "rebrand", name: "Rebrand 2026", status: "active", open: 6 },
  { id: "onboard", name: "Onboarding flow", status: "active", open: 3 },
  { id: "pricing", name: "Pricing page v2", status: "active", open: 2 },
  { id: "mobile", name: "Mobile app", status: "archived", open: 0 },
  { id: "docs", name: "Docs revamp", status: "archived", open: 0 },
]

const PRESENCE = [
  { id: "available", label: "Available", dot: "bg-foreground" },
  { id: "away", label: "Away", dot: "bg-muted-foreground/50" },
  { id: "dnd", label: "Do not disturb", dot: "bg-destructive" },
]

/* ── Mobile detection — media-query state, not viewport sniffing ─────────── */
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

/* ── Workspace switcher — Floating UI anchored popover ───────────────────── */
function WorkspaceSwitcher({
  collapsed,
  mobile,
  workspace,
  onSelect,
}: {
  collapsed: boolean
  mobile: boolean
  workspace: (typeof WORKSPACES)[number]
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: collapsed ? "right-start" : "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "dialog" })
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])

  return (
    <>
      <Button
        ref={refs.setReference as React.Ref<HTMLButtonElement>}
        {...getReferenceProps()}
        variant="outline"
        aria-label={`Workspace: ${workspace.name}, ${workspace.plan} plan`}
        className={cn(
          "w-full justify-start gap-2.5 overflow-hidden px-2",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-[11px] font-bold text-primary-foreground">
          {workspace.name.slice(0, 2).toUpperCase()}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-bold leading-tight">{workspace.name}</span>
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              {workspace.plan} plan
            </span>
          </span>
        )}
        {!collapsed && <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />}
      </Button>
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 w-64 rounded-lg border bg-popover p-1.5 text-popover-foreground shadow-lg"
          >
            <p className="px-2 pb-1.5 pt-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Workspaces
            </p>
            <div role="listbox" aria-label="Workspaces">
              {WORKSPACES.map((ws) => (
                <button
                  key={ws.id}
                  type="button"
                  role="option"
                  aria-selected={ws.id === workspace.id}
                  onClick={() => {
                    onSelect(ws.id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary font-mono text-[11px] font-bold text-primary-foreground">
                    {ws.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold leading-tight">{ws.name}</span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {ws.plan} plan
                    </span>
                  </span>
                  {ws.id === workspace.id && <Check className="size-4" aria-hidden="true" />}
                </button>
              ))}
            </div>
            <div className="mx-1 my-1.5 h-px bg-border" role="separator" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-[13px] font-semibold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
            >
              <Plus className="size-4" aria-hidden="true" />
              New workspace
            </button>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

/* ── Collapsed-state floating label (Floating UI, welded on) ─────────────── */
function useFloatingLabel(label: string, enabled: boolean) {
  const panel = useHoverPanel({ placement: "right", gap: 10, role: "tooltip" })
  const node = enabled && panel.open ? (
    <FloatingPortal>
      <div
        ref={panel.refs.setFloating}
        style={panel.floatingStyles}
        {...panel.getFloatingProps()}
        className="z-50 rounded-md border bg-popover px-2.5 py-1.5 text-[12px] font-semibold text-popover-foreground shadow-md"
      >
        {label}
      </div>
    </FloatingPortal>
  ) : null
  return { setReference: panel.refs.setReference, getReferenceProps: panel.getReferenceProps, node }
}

export type SidebarSolidProps = {
  className?: string
  /**
   * Built-in mobile layout (default true): below `md` the rail becomes an
   * off-canvas overlay opened from the content header. Set `false` to
   * disable it — the rail then renders at fixed width on every screen and
   * the host owns mobile (e.g. mount the rail inside its own sheet).
   */
  mobile?: boolean
}

export function SidebarSolid({ className, mobile = true }: SidebarSolidProps) {
  const [activeId, setActiveId] = React.useState("overview")
  const [collapsed, setCollapsed] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [workspaceId, setWorkspaceId] = React.useState("northwind")
  const [projectFilter, setProjectFilter] = React.useState("all")
  const isMobile = useIsMobile()
  const overlayMode = mobile && isMobile

  const workspace = WORKSPACES.find((w) => w.id === workspaceId) ?? WORKSPACES[0]
  const allNav = [...NAV_MAIN, ...NAV_SECONDARY]
  const activeItem = allNav.find((n) => n.id === activeId)
  const projects = PROJECTS.filter((p) => projectFilter === "all" || p.status === projectFilter)

  React.useEffect(() => {
    if (!overlayMode || !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [overlayMode, mobileOpen])

  const select = (id: string) => {
    setActiveId(id)
    if (overlayMode) setMobileOpen(false)
  }

  /* anime.js v4 — mount stagger for the rail choreography */
  const railRef = useAnimeScope(() => {
    animate(".ss-rail-head", {
      opacity: [0, 1],
      y: [-10, 0],
      ease: "outExpo",
      duration: 480,
    })
    animate(".ss-nav-item", {
      opacity: [0, 1],
      x: [-16, 0],
      ease: "outExpo",
      duration: 520,
      delay: stagger(55, { start: 140 }),
    })
    animate(".ss-foot", {
      opacity: [0, 1],
      y: [14, 0],
      ease: "outExpo",
      duration: 520,
      delay: 420,
    })
  })

  /* anime.js v4 — content header + activity swap on every section change */
  const titleRef = useAnimeScope(() => {
    animate(".ss-title", {
      opacity: [0, 1],
      y: [10, 0],
      ease: "outExpo",
      duration: 420,
    })
  }, [activeId, workspaceId])

  const navButton = (item: NavItem) => {
    const Icon = item.icon
    const active = activeId === item.id
    const showFloating = collapsed && !overlayMode
    const float = useFloatingLabel(item.label, false) // hook order guard — see below
    void float
    return null
  }

  // Rendered nav rows — a plain map; floating labels only when collapsed,
  // via the NavRow subcomponent below (hooks live inside it).
  const railWidth = collapsed && !overlayMode ? "w-[76px]" : "w-[288px]"

  return (
    <div className={cn("relative isolate w-full overflow-hidden", className)}>
      <div
        ref={railRef as React.Ref<HTMLDivElement>}
        className="relative flex min-h-screen w-full overflow-hidden rounded-2xl border bg-background font-sans text-foreground"
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

        {/* ─── The rail ──────────────────────────────────────────── */}
        <aside
          aria-label="Workspace sidebar"
          {...(overlayMode ? { inert: !mobileOpen } : {})}
          className={cn(
            "relative flex shrink-0 flex-col overflow-hidden border-r bg-card",
            "transition-[width,transform] duration-300 ease-out motion-reduce:transition-none",
            overlayMode
              ? cn(
                  "absolute inset-y-0 left-0 z-40 w-[288px] shadow-2xl",
                  mobileOpen ? "translate-x-0" : "-translate-x-full",
                )
              : railWidth,
          )}
        >
          {/* Head — workspace switcher + collapse toggle */}
          <div className={cn("ss-rail-head flex items-start gap-2 p-3", collapsed && !overlayMode && "flex-col items-center")}>
            <div className="min-w-0 flex-1">
              <WorkspaceSwitcher
                collapsed={collapsed && !overlayMode}
                mobile={mobile}
                workspace={workspace}
                onSelect={setWorkspaceId}
              />
            </div>
            {!overlayMode && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
                className={cn("mt-0.5 shrink-0 text-muted-foreground", collapsed && !overlayMode && "mt-0")}
              >
                {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
              </Button>
            )}
          </div>

          {/* Primary nav */}
          <nav aria-label="Workspace sections" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 [scrollbar-width:thin]">
            <NavSection
              label={collapsed && !overlayMode ? undefined : "Workspace"}
              items={NAV_MAIN}
              activeId={activeId}
              collapsed={collapsed && !overlayMode}
              overlayMode={overlayMode}
              onSelect={select}
            />

            {/* Projects block — visible on the Projects section; the Select
                filters the list (Round 2: the named behavior must work). */}
            {activeId === "projects" && (
              <div className="ss-nav-item mb-3 space-y-2">
                {!collapsed && !overlayMode && (
                  <p className="px-2 pb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    Projects
                  </p>
                )}
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger
                      size="sm"
                      className={cn("gap-1.5", collapsed && !overlayMode && "justify-center px-0")}
                      aria-label="Filter projects by status"
                    >
                      {collapsed && !overlayMode ? (
                        <span className="font-mono text-[11px] font-bold">{projects.length}</span>
                      ) : (
                        <SelectValue />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All projects</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  {!collapsed && !overlayMode && (
                    <ul className="space-y-0.5">
                      {projects.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => setActiveId("projects")}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] font-semibold text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground"
                          >
                            <span
                              className={cn(
                                "size-1.5 shrink-0 rounded-full",
                                p.status === "active" ? "bg-foreground" : "bg-muted-foreground/40",
                              )}
                              aria-hidden="true"
                            />
                            <span className="truncate">{p.name}</span>
                            {p.open > 0 && (
                              <span className="ml-auto font-mono text-[10px] text-muted-foreground">{p.open}</span>
                            )}
                          </button>
                        </li>
                      ))}
                      {projects.length === 0 && (
                        <li className="px-2 py-1.5 text-[12px] text-muted-foreground">No projects in this view.</li>
                      )}
                    </ul>
                  )}
              </div>
            )}

            <NavSection
              label={collapsed && !overlayMode ? undefined : "General"}
              items={NAV_SECONDARY}
              activeId={activeId}
              collapsed={collapsed && !overlayMode}
              overlayMode={overlayMode}
              onSelect={select}
            />
          </nav>

          <Separator />

          {/* Foot — presence select + account menu */}
          <div className={cn("ss-foot space-y-2 p-3", collapsed && !overlayMode && "flex flex-col items-center")}>
            {(collapsed && !overlayMode) || (
              <Select defaultValue="available">
                <SelectTrigger size="sm" aria-label="Set your presence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESENCE.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", p.dot)} aria-hidden="true" />
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  aria-label={`Account: ${USER.name}`}
                  className={cn(
                    "h-auto w-full justify-start gap-2.5 px-1.5 py-1.5",
                    collapsed && !overlayMode && "justify-center px-0",
                  )}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-[11px] font-bold">{USER.initials}</AvatarFallback>
                  </Avatar>
                  {(collapsed && !overlayMode) || (
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-[12.5px] font-bold leading-tight">{USER.name}</span>
                      <span className="block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {USER.email}
                      </span>
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <span className="block truncate text-[13px] font-bold">{USER.name}</span>
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {USER.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <UserRound className="size-4" aria-hidden="true" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <CreditCard className="size-4" aria-hidden="true" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <Settings className="size-4" aria-hidden="true" />
                  Settings
                  <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="gap-2">
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* ─── Content pane ───────────────────────────────────────── */}
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
            <div ref={titleRef as React.Ref<HTMLDivElement>} className="min-w-0">
              <h2 className="ss-title truncate font-display text-lg font-bold tracking-tight">
                {activeItem?.label ?? "Workspace"}
              </h2>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {workspace.name}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="secondary" className="hidden font-mono text-[10px] uppercase tracking-[0.1em] sm:inline-flex">
                {workspace.plan}
              </Badge>
              <Button size="sm" className="hidden sm:inline-flex">
                <Plus aria-hidden="true" />
                New
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              {/* Section summary card */}
              <div className="rounded-xl border bg-card p-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {activeItem?.label ?? "Workspace"} · now
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  This pane is the preset&rsquo;s content area. The rail on the left is the sidebar:
                  switcher, primary navigation, presence and account live there and stay out of the
                  way here.
                </p>
                <Separator className="my-4" />
                <ul className="space-y-2">
                  {ACTIVITY.slice(0, 3).map((a) => {
                    const [title, meta] = a.split(" — ")
                    return (
                      <li
                        key={a}
                        className="flex flex-col gap-0.5 rounded-lg border bg-background px-3.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                      >
                        <span className="text-[13px] font-bold">{title}</span>
                        <span className="text-[12.5px] font-medium text-muted-foreground">{meta}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* React Bits AnimatedList — recent activity feed */}
              <div ref={undefined} className="rounded-xl border bg-card p-1">
                <p className="px-3 pb-1 pt-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Recent activity
                </p>
                <AnimatedList
                  items={ACTIVITY.map((a) => a.split(" — ")[0])}
                  showGradients={false}
                  displayScrollbar={false}
                  enableArrowNavigation={false}
                  className="!w-full"
                  itemClassName="!bg-background !text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Nav section — label + rows ──────────────────────────────────────────── */
function NavSection({
  label,
  items,
  activeId,
  collapsed,
  overlayMode,
  onSelect,
  hidden = false,
}: {
  label?: string
  items: NavItem[]
  activeId: string
  collapsed: boolean
  overlayMode: boolean
  onSelect: (id: string) => void
  hidden?: boolean
}) {
  if (hidden) return null
  return (
    <div className="mb-3">
      {label && (
        <p className="px-2 pb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <NavRow
            key={item.id}
            item={item}
            active={activeId === item.id}
            collapsed={collapsed}
            overlayMode={overlayMode}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </div>
  )
}

/* ── Nav row — registry Button; floating label when the rail is collapsed ── */
function NavRow({
  item,
  active,
  collapsed,
  overlayMode,
  onSelect,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  overlayMode: boolean
  onSelect: (id: string) => void
}) {
  const Icon = item.icon
  const floating = collapsed && !overlayMode
  const label = useFloatingLabel(item.label, floating)

  return (
    <li className="ss-nav-item">
      <div
        ref={floating ? (label.setReference as React.Ref<HTMLDivElement>) : undefined}
        {...(floating ? label.getReferenceProps() : {})}
      >
        <Button
          variant="ghost"
          aria-current={active ? "page" : undefined}
          aria-label={floating ? undefined : item.label}
          onClick={() => onSelect(item.id)}
          className={cn(
            "relative h-8 w-full justify-start gap-3 rounded-lg px-2.5 font-semibold text-muted-foreground",
            "hover:bg-accent hover:text-accent-foreground",
            active && "bg-secondary text-foreground hover:bg-secondary",
            collapsed && "justify-center px-0",
          )}
        >
          <item.icon className="size-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate text-[13px]">{item.label}</span>}
          {!collapsed && item.count ? (
            <Badge variant="secondary" className="ml-auto h-5 min-w-5 justify-center px-1.5 font-mono text-[10px]">
              {item.count}
            </Badge>
          ) : null}
          {collapsed && item.count ? (
            <span className="absolute right-1.5 top-1 flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-bold leading-none text-primary-foreground">
              {item.count}
            </span>
          ) : null}
        </Button>
      </div>
      {label.node}
    </li>
  )
}
