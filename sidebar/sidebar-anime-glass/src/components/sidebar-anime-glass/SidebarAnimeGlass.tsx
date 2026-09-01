import * as React from "react"
import { animate, stagger } from "animejs"
import {
  Palette,
  Clapperboard,
  Mic2,
  Shapes,
  Camera,
  PenTool,
  ArrowUpRight,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import GlassIcons from "@/components/reactbits/GlassIcons"
import { useAnimeScope } from "@/hooks/use-anime-scope"
import { useHoverPanel } from "@/hooks/use-hover-panel"
import { FloatingPortal } from "@floating-ui/react"

// COMPOSITE — react-bits GlassIcons (3D-tilt glass tiles) +
// floating-ui engine (preview cards via use-hover-panel recipe) +
// anime.js v4 engine (stagger entrance + label slide via use-anime-scope).
// JOB      a creative launcher rail: six studio "spaces" as glass tiles,
//          each revealing a preview card on hover
// MOVE     anime.js staggers the tiles in; Floating UI anchors the preview
//          cards; GlassIcons owns the tile tilt/parallax feel
// MOBILE   below md the rail is an off-canvas overlay (CSS transition —
//          anime.js stays on tile/label choreography). `mobile={false}`
//          pins the rail at fixed width so the host can use its own sheet.

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

type Space = {
  label: string
  icon: React.ReactElement
  /** token-based gradient string — resolved from the preset's own palette */
  glass: string
  meta: string
  blurb: string
}

const SPACES: Space[] = [
  {
    label: "Brandlab",
    icon: <Palette aria-hidden="true" />,
    glass: "linear-gradient(hsl(var(--glass-1)), hsl(var(--glass-1) / 0.62))",
    meta: "38 assets · updated 1h ago",
    blurb: "Wordmarks, lockups and the type ramp for the rebrand.",
  },
  {
    label: "Screening",
    icon: <Clapperboard aria-hidden="true" />,
    glass: "linear-gradient(hsl(var(--glass-2)), hsl(var(--glass-2) / 0.62))",
    meta: "7 reels · premiere 0.9",
    blurb: "Cut-by-cut review room with timecoded comments.",
  },
  {
    label: "Soundstage",
    icon: <Mic2 aria-hidden="true" />,
    glass: "linear-gradient(hsl(var(--glass-3)), hsl(var(--glass-3) / 0.62))",
    meta: "2 mixes · v3 in review",
    blurb: "Foley, ADR and the final mix approval chain.",
  },
  {
    label: "Typeforge",
    icon: <Shapes aria-hidden="true" />,
    glass: "linear-gradient(hsl(var(--glass-4)), hsl(var(--glass-4) / 0.62))",
    meta: "12 families · 4 pending",
    blurb: "Custom letterforms and the variable font proofs.",
  },
  {
    label: "Darkroom",
    icon: <Camera aria-hidden="true" />,
    glass: "linear-gradient(hsl(var(--glass-5)), hsl(var(--glass-5) / 0.62))",
    meta: "214 stills · 3 selects",
    blurb: "Contact sheets and the grading pipeline queue.",
  },
  {
    label: "Pressdesk",
    icon: <PenTool aria-hidden="true" />,
    glass: "linear-gradient(hsl(var(--glass-6)), hsl(var(--glass-6) / 0.62))",
    meta: "9 drafts · 2 embargoed",
    blurb: "Programme notes, press kit and the premiere speech.",
  },
]

/** Tile + Floating UI preview card. The card portals to <body>, so it
 *  carries its own `dark` class — the frame's forced-dark tokens must
 *  resolve there too. */
function SpaceTile({ space }: { space: Space }) {
  const panel = useHoverPanel({ placement: "right-start", gap: 12, role: "tooltip" })
  return (
    <>
      <div
        ref={panel.refs.setReference}
        {...panel.getReferenceProps()}
      >
        <GlassIcons
          items={[
            {
              icon: space.icon,
              color: space.glass,
              label: space.label,
              customClass: "!h-14 !w-14 !rounded-2xl",
            },
          ]}
          className="!grid-cols-1 !gap-0 !py-0 !mx-0"
        />
      </div>
      {panel.open && (
        <FloatingPortal>
          <div
            ref={panel.refs.setFloating}
            style={panel.floatingStyles}
            {...panel.getFloatingProps()}
            className="dark z-50 w-60 rounded-xl border bg-popover p-3.5 text-popover-foreground shadow-lg"
          >
            <p className="font-display text-[14px] font-bold">{space.label}</p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {space.meta}
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
              {space.blurb}
            </p>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export type SidebarAnimeGlassProps = {
  className?: string
  /**
   * Built-in mobile layout (default true): below `md` the rail becomes an
   * off-canvas overlay opened from the content header. Set `false` to
   * disable it — the rail then renders at fixed width on every screen and
   * the host owns mobile (e.g. mount the rail inside its own sheet).
   */
  mobile?: boolean
}

export function SidebarAnimeGlass({
  className,
  mobile = true,
}: SidebarAnimeGlassProps) {
  const [open, setOpen] = React.useState("Brandlab")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const overlayMode = mobile && isMobile
  const active = SPACES.find((s) => s.label === open) ?? SPACES[0]

  React.useEffect(() => {
    if (!overlayMode || !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [overlayMode, mobileOpen])

  const select = (label: string) => {
    setOpen(label)
    if (overlayMode) setMobileOpen(false)
  }

  // anime.js v4 entrance: tiles pop in with a staggered spring.
  const railRef = useAnimeScope(() => {
    animate(".sag-tile", {
      opacity: [0, 1],
      y: [22, 0],
      scale: [0.86, 1],
      ease: "out(3)",
      duration: 640,
      delay: stagger(70, { start: 120 }),
    })
    animate(".sag-head", {
      opacity: [0, 1],
      y: [-10, 0],
      ease: "outExpo",
      duration: 480,
    })
  })

  // anime.js v4: the active label slides through on every switch.
  const labelRef = useAnimeScope(() => {
    animate(".sag-label", {
      opacity: [0, 1],
      y: [12, 0],
      ease: "outExpo",
      duration: 420,
    })
  }, [open])

  return (
    <div className={cn("dark relative isolate w-full", className)}>
      <div className="flex w-full min-h-[560px] overflow-hidden rounded-2xl border bg-background font-sans text-foreground">
        {/* Mobile backdrop */}
        {overlayMode && mobileOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 z-30 bg-foreground/40 backdrop-blur-[2px]"
          />
        )}

        {/* ─── The rail ──────────────────────────────────────────── */}
        <aside
          aria-label="Spaces sidebar"
          ref={railRef}
          {...(overlayMode ? { inert: !mobileOpen } : {})}
          className={cn(
            "relative flex shrink-0 flex-col border-r bg-card",
            overlayMode
              ? cn(
                  "absolute inset-y-0 left-0 z-40 w-[296px] shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none",
                  mobileOpen ? "translate-x-0" : "-translate-x-full",
                )
              : "w-[296px]",
          )}
        >
          <div className="sag-head flex items-start justify-between px-5 pt-6">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                The studio floor
              </p>
              <h2 className="mt-1 font-display text-[22px] font-bold tracking-tight">
                Spaces
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Hover a tile — every space keeps its own desk.
              </p>
            </div>
            {overlayMode && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="text-muted-foreground"
              >
                <X />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-5 gap-y-4 px-5 py-6">
            {SPACES.map((s) => (
              <div
                key={s.label}
                onClick={() => select(s.label)}
                aria-current={open === s.label ? "true" : undefined}
                title={`Open ${s.label}`}
                className={cn(
                  "sag-tile flex cursor-pointer justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  open === s.label && "sag-tile-active",
                )}
              >
                <SpaceTile space={s} />
              </div>
            ))}
          </div>

          <Separator className="mx-5" />

          <div className="mt-auto p-5">
            <div
              ref={labelRef as React.Ref<HTMLDivElement>}
              className="mb-4 rounded-xl border bg-background p-4"
            >
              <p className="sag-label font-display text-[15px] font-bold">
                {active.label}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {active.meta}
              </p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                {active.blurb}
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Manage spaces
              <ArrowUpRight aria-hidden="true" />
            </Button>
            <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              house plan · 6 / 8 seats
            </p>
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
            <h2 className="font-display text-lg font-bold tracking-tight">
              {active.label}
            </h2>
            <Badge className="hidden bg-primary font-mono text-[9px] uppercase tracking-[0.12em] text-primary-foreground sm:inline-flex">
              open
            </Badge>
            <p className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              northline studio
            </p>
          </header>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="rounded-xl border bg-card p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Now in {active.label.toLowerCase()}
              </p>
              <ul className="mt-3 space-y-2">
                {[
                  { t: "Weekly review", m: "Tomorrow · 10:00 · Screening B" },
                  { t: "Handoff window", m: "Thu · assets freeze at 18:00" },
                  { t: "Housekeeping", m: "Archive anything older than 30 days" },
                ].map((r) => (
                  <li
                    key={r.t}
                    className="flex flex-col gap-0.5 rounded-lg border bg-background px-3.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-3"
                  >
                    <span className="text-[13px] font-bold">{r.t}</span>
                    <span className="text-[12.5px] font-medium text-muted-foreground">
                      {r.m}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
