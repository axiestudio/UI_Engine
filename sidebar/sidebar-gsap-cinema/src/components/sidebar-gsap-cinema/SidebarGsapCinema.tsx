import * as React from "react"
import { gsap } from "gsap"
import {
  Clapperboard,
  Film,
  CalendarClock,
  MessageSquare,
  BarChart3,
  Settings,
  Radio,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import SplitText from "@/components/reactbits/SplitText"
import { useGsapScope, usePrefersReducedMotion } from "@/hooks/with-gsap"

// COMPOSITE — react-bits SplitText (GSAP SplitText plugin char-entrance) +
// gsap engine (scoped, reduced-motion-aware timelines via with-gsap recipe) +
// watermelon button/badge (shadcn kit).
// JOB      a cinema-grade nav for a production pipeline: numbered rail,
//          character-split wordmark, choreographed entrance
// MOVE     GSAP owns the timeline — items slide in on a stagger, the active
//          marker glides with power3.inOut; SplitText breaks the wordmark
//          into chars for the reveal
// MOBILE   below md the rail is an off-canvas overlay; GSAP tweens the
//          x-transform. `mobile={false}` pins the rail at fixed width so
//          the host can mount it inside its own sheet.

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

const NAV = [
  { n: "01", label: "Screenings", icon: Clapperboard },
  { n: "02", label: "Rushes", icon: Film, live: true },
  { n: "03", label: "Schedule", icon: CalendarClock },
  { n: "04", label: "Dailies chat", icon: MessageSquare, count: 6 },
  { n: "05", label: "Box office", icon: BarChart3 },
]

const LOG = [
  { time: "14:02", msg: "Reel 04 — color pass approved by M. Okafor" },
  { time: "13:41", msg: "Sound mix v3 uploaded to screening room B" },
  { time: "12:58", msg: "Rushes from unit B ingested — 42 clips" },
  { time: "11:30", msg: "Poster typography locked for the premiere" },
  { time: "09:15", msg: "Second unit call sheet published for Friday" },
]

export type SidebarGsapCinemaProps = {
  className?: string
  /**
   * Built-in mobile layout (default true): below `md` the rail becomes an
   * off-canvas overlay opened from the content header. Set `false` to
   * disable it — the rail then renders at fixed width on every screen and
   * the host owns mobile (e.g. mount the rail inside its own sheet).
   */
  mobile?: boolean
}

export function SidebarGsapCinema({
  className,
  mobile = true,
}: SidebarGsapCinemaProps) {
  const [active, setActive] = React.useState("Rushes")
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMobile = useIsMobile()
  const overlayMode = mobile && isMobile
  const activeRef = React.useRef<HTMLButtonElement>(null)
  const markerRef = React.useRef<HTMLSpanElement>(null)
  const asideRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!overlayMode || !mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [overlayMode, mobileOpen])

  // Entrance: one timeline staggers the rail in — chars, rows, footer.
  const entranceRef = useGsapScope(() => {
    gsap
      .timeline({ defaults: { ease: "power3.out" } })
      .from(".sgc-row", { x: -24, opacity: 0, duration: 0.5, stagger: 0.07 })
      .from(
        ".sgc-footer",
        { y: 14, opacity: 0, duration: 0.4 },
        "-=0.25",
      )
  })

  // Active marker: glides to the active row (direct ref tween — no selector
  // scope needed; reduced motion snaps instead of gliding).
  const reduce = usePrefersReducedMotion()
  React.useLayoutEffect(() => {
    const row = activeRef.current
    const marker = markerRef.current
    if (!row || !marker) return
    gsap.to(marker, {
      y: row.offsetTop,
      duration: reduce ? 0 : 0.45,
      ease: "power3.inOut",
    })
  }, [active, reduce])

  // Mobile: GSAP owns the off-canvas slide (xPercent) — same engine as the
  // desktop marker, one motion language. First overlay paint sets the state
  // instantly (no slide-out flash); leaving overlay mode clears the inline
  // transform. Reduced motion snaps.
  const slideInit = React.useRef(false)
  React.useLayoutEffect(() => {
    if (!asideRef.current) return
    if (!overlayMode) {
      gsap.set(asideRef.current, { clearProps: "xPercent" })
      slideInit.current = false
      return
    }
    if (!slideInit.current) {
      gsap.set(asideRef.current, { xPercent: mobileOpen ? 0 : -105 })
      slideInit.current = true
      return
    }
    gsap.to(asideRef.current, {
      xPercent: mobileOpen ? 0 : -105,
      duration: reduce ? 0 : 0.42,
      ease: "power3.inOut",
    })
  }, [mobileOpen, overlayMode, reduce])

  const select = (label: string) => {
    setActive(label)
    if (overlayMode) setMobileOpen(false)
  }

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
          aria-label="Production sidebar"
          ref={(el) => {
            // two refs, one element: gsap scope + slide tween
            entranceRef.current = el
            asideRef.current = el
          }}
          {...(overlayMode ? { inert: !mobileOpen } : {})}
          className={cn(
            "relative flex shrink-0 flex-col border-r bg-card",
            overlayMode
              ? "absolute inset-y-0 left-0 z-40 w-[288px] shadow-2xl"
              : "w-[288px]",
          )}
        >
          {/* Marker behind the active row */}
          <span
            ref={markerRef}
            aria-hidden="true"
            className="absolute left-0 top-0 h-11 w-full border-l-2 border-primary bg-accent"
          />

          <div className="flex items-start justify-between px-5 pb-2 pt-6">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                Studio / 24
              </p>
              <SplitText
                text="Signal Desk"
                tag="h2"
                splitType="chars"
                textAlign="left"
                delay={60}
                duration={0.9}
                className="mt-1 font-display text-[26px] font-bold leading-tight tracking-tight"
              />
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

          <nav aria-label="Production" className="relative mt-4 flex-1 px-3">
            <ul className="space-y-1">
              {NAV.map((it) => {
                const isActive = active === it.label
                return (
                  <li key={it.label} className="sgc-row">
                    <Button
                      ref={isActive ? activeRef : undefined}
                      variant="ghost"
                      size="sm"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => select(it.label)}
                      className={cn(
                        "h-11 w-full justify-start gap-3 px-3",
                        isActive
                          ? "text-foreground hover:bg-transparent"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="font-mono text-[10px] tabular-nums opacity-60">
                        {it.n}
                      </span>
                      <it.icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="truncate text-[13.5px] font-semibold">
                        {it.label}
                      </span>
                      {it.live && (
                        <Badge className="ml-auto gap-1 bg-primary px-1.5 py-0 font-mono text-[9px] uppercase tracking-[0.12em] text-primary-foreground">
                          <Radio className="size-2.5 motion-safe:animate-pulse" aria-hidden="true" />
                          live
                        </Badge>
                      )}
                      {!it.live && it.count !== undefined && (
                        <Badge variant="secondary" className="ml-auto tabular-nums">
                          {it.count}
                        </Badge>
                      )}
                    </Button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="sgc-footer flex items-center gap-2.5 border-t p-4">
            <Button variant="ghost" size="icon-sm" aria-label="Settings" className="text-muted-foreground">
              <Settings />
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight">
                Premiere build 0.9
              </p>
              <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                session · m-okafor
              </p>
            </div>
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
              {active}
            </h2>
            <p className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              reel 04 · day 19 of 62
            </p>
          </header>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <ul className="space-y-2">
              {LOG.map((l) => (
                <li
                  key={l.time}
                  className="flex flex-col gap-1 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {l.time}
                  </span>
                  <span className="text-[13.5px] font-semibold">{l.msg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
