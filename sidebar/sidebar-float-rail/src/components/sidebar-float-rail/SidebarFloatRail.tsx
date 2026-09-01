import * as React from "react"
import { gsap } from "gsap"
import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronsLeft,
  PanelLeftOpen,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useHoverPanel } from "@/hooks/use-hover-panel"
import { usePrefersReducedMotion } from "@/hooks/with-gsap"

// COMPOSITE — watermelon button/badge/separator (shadcn kit) +
// floating-ui engine (hover labels via use-hover-panel recipe) +
// gsap engine (width choreography on expand/collapse).
// JOB      the icon-first rail that collapses to a thin strip: labels live
//          in Floating UI panels so the collapsed state stays fully usable
// MOVE     GSAP tweens the rail width and staggers the labels out on
//          collapse / in on expand; Floating UI owns label positioning
// MOBILE   the 72px rail is already pocket-sized — below md the rail is
//          pinned collapsed and the desktop expand toggle hides.
//          `mobile={false}` removes that clamp: the rail expands at every
//          width and the host owns mobile (e.g. its own sheet).

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

const RAIL = [
  { label: "Overview", icon: LayoutDashboard, badge: "9" },
  { label: "Projects", icon: FolderKanban },
  { label: "Calendar", icon: CalendarDays, badge: "3" },
  { label: "People", icon: Users },
  { label: "Reports", icon: BarChart3 },
]

const FOOTER = [
  { label: "Notifications", icon: Bell, badge: "5" },
  { label: "Support", icon: LifeBuoy },
  { label: "Settings", icon: Settings },
]

type RailButtonProps = {
  it: { label: string; icon: React.ElementType; badge?: string }
  active: boolean
  expanded: boolean
  onSelect: () => void
}

/** Rail button; when collapsed, the label is a Floating UI hover panel. */
function RailButton({ it, active, expanded, onSelect }: RailButtonProps) {
  const panel = useHoverPanel({
    placement: "right",
    gap: 10,
    role: "tooltip",
  })
  const Icon = it.icon
  return (
    <>
      <Button
        ref={panel.refs.setReference as React.Ref<HTMLButtonElement>}
        {...panel.getReferenceProps()}
        variant={active ? "secondary" : "ghost"}
        size="icon"
        aria-label={it.label}
        aria-current={active ? "page" : undefined}
        onClick={onSelect}
        className={cn(
          "relative size-10 shrink-0 text-muted-foreground",
          active && "text-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
        {it.badge && (
          <span
            aria-hidden="true"
            className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-bold text-primary-foreground"
          >
            {it.badge}
          </span>
        )}
      </Button>
      {!expanded && panel.open && (
        <div
          ref={panel.refs.setFloating}
          style={panel.floatingStyles}
          {...panel.getFloatingProps()}
          className="z-50 rounded-md border bg-popover px-2.5 py-1.5 text-[12px] font-semibold text-popover-foreground shadow-md"
        >
          {it.label}
          {it.badge && (
            <span className="ml-2 font-mono text-[10px] tabular-nums text-muted-foreground">
              {it.badge}
            </span>
          )}
        </div>
      )}
    </>
  )
}

export type SidebarFloatRailProps = {
  className?: string
  /**
   * Built-in mobile behavior (default true): below `md` the rail is pinned
   * to its 72px collapsed state and the expand toggle hides. Set `false` to
   * disable the clamp — the rail expands at every width and the host owns
   * mobile (e.g. mount the rail inside its own sheet).
   */
  mobile?: boolean
}

export function SidebarFloatRail({
  className,
  mobile = true,
}: SidebarFloatRailProps) {
  const [expanded, setExpanded] = React.useState(false)
  const [active, setActive] = React.useState("Overview")
  const isMobile = useIsMobile()
  const clamp = mobile && isMobile
  const effExpanded = expanded && !clamp
  const reduce = usePrefersReducedMotion()
  const asideRef = React.useRef<HTMLElement>(null)
  const labelRefs = React.useRef<Map<string, HTMLSpanElement>>(new Map())

  // GSAP: width tween + label stagger. Widths live in one place.
  React.useEffect(() => {
    if (!asideRef.current) return
    const labels = Array.from(labelRefs.current.values())
    gsap.to(asideRef.current, {
      width: effExpanded ? 264 : 72,
      duration: reduce ? 0 : 0.4,
      ease: "power3.inOut",
    })
    if (labels.length) {
      gsap.fromTo(
        labels,
        { opacity: effExpanded ? 0 : 1, x: effExpanded ? -8 : 0 },
        {
          opacity: effExpanded ? 1 : 0,
          x: effExpanded ? 0 : -8,
          duration: reduce ? 0 : 0.28,
          delay: reduce ? 0 : effExpanded ? 0.12 : 0,
          stagger: reduce ? 0 : 0.03,
          ease: "power2.out",
        },
      )
    }
  }, [effExpanded, reduce])

  const setLabelRef = (label: string) => (el: HTMLSpanElement | null) => {
    if (el) labelRefs.current.set(label, el)
    else labelRefs.current.delete(label)
  }

  return (
    <div
      className={cn(
        "relative isolate flex w-full min-h-[560px] overflow-hidden rounded-2xl border bg-background font-sans",
        className,
      )}
    >
      {/* ─── The rail ─────────────────────────────────────────────── */}
      <aside
        ref={asideRef}
        aria-label="App sidebar"
        aria-expanded={effExpanded}
        className="relative flex w-[72px] shrink-0 flex-col border-r bg-card"
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-2.5 overflow-hidden border-b px-4">
          <span aria-hidden="true" className="size-8 shrink-0 rounded-lg bg-primary" />
          <span
            ref={setLabelRef("brand")}
            className="min-w-0 whitespace-nowrap font-display text-[15px] font-bold opacity-0 tracking-tight"
          >
            Northline
          </span>
        </div>

        <nav aria-label="Primary" className="flex-1 overflow-hidden px-3.5 py-3">
          <ul className="space-y-1.5">
            {RAIL.map((it) => (
              <li key={it.label} className="flex items-center">
                <RailButton
                  it={it}
                  active={active === it.label}
                  expanded={effExpanded}
                  onSelect={() => setActive(it.label)}
                />
                <span
                  ref={setLabelRef(it.label)}
                  className="ml-3 min-w-0 whitespace-nowrap text-[13px] font-semibold text-foreground opacity-0"
                >
                  {it.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <Separator />

        <div className="overflow-hidden p-3.5">
          <ul className="space-y-1.5">
            {FOOTER.map((it) => (
              <li key={it.label} className="flex items-center">
                <RailButton
                  it={it}
                  active={false}
                  expanded={effExpanded}
                  onSelect={() => setActive(it.label)}
                />
                <span
                  ref={setLabelRef(it.label)}
                  className="ml-3 min-w-0 whitespace-nowrap text-[13px] font-semibold text-foreground opacity-0"
                >
                  {it.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* The toggle — desktop affordance; hidden while mobile-clamped */}
        <div className="border-t p-3.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded((e) => !e)}
            aria-label={effExpanded ? "Collapse sidebar" : "Expand sidebar"}
            aria-expanded={effExpanded}
            className={cn(
              "size-10 shrink-0 text-muted-foreground",
              clamp && "hidden",
            )}
          >
            {effExpanded ? (
              <ChevronsLeft className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </aside>

      {/* ─── Content space ────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
          <h2 className="font-display text-lg font-bold tracking-tight">
            {active}
          </h2>
          <Badge variant="outline" className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.14em] sm:inline-flex">
            hover the icons
          </Badge>
        </header>
        <div className="grid flex-1 gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-6">
          {[
            { k: "Active projects", v: "12", d: "+2 this week" },
            { k: "Reviews due", v: "5", d: "3 today" },
            { k: "Unread pings", v: "9", d: "2 flagged" },
            { k: "Seats in use", v: "8/10", d: "2 invited" },
          ].map((c) => (
            <div key={c.k} className="rounded-xl border bg-card p-4">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {c.k}
              </p>
              <p className="mt-1 font-display text-2xl font-bold tabular-nums">{c.v}</p>
              <p className="text-xs font-semibold text-muted-foreground">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
