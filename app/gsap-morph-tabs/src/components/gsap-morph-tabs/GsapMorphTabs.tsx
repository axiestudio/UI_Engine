import * as React from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         One app card whose frame keeps pace with its content —
//                 switching tabs morphs the panel to the height it needs.
// ═══ EMOTION     Calm front-desk software: nothing jumps, everything glides.
// ═══ SIGNATURE   On tab change the incoming panel is measured, the shell's
//                 height tweens to it (0.4s, power2.inOut) while the panels
//                 crossfade in the same breath.

type TabId = "overview" | "bookings" | "notes"

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "bookings", label: "Bookings" },
  { id: "notes", label: "Notes" },
]

const OVERVIEW: { label: string; value: string; hint: string }[] = [
  { label: "Chairs in service", value: "6", hint: "all staffed" },
  { label: "Bookings this week", value: "84", hint: "+12 vs last" },
  { label: "Chair utilisation", value: "72%", hint: "target 70%" },
]

const BOOKINGS: { time: string; client: string; chair: string; service: string; price: string }[] = [
  { time: "09:00", client: "Ingrid Halvorsen", chair: "Chair 02", service: "Cut & finish", price: "640 kr" },
  { time: "10:30", client: "Jonas Wetterberg", chair: "Chair 05", service: "Beard trim", price: "320 kr" },
  { time: "13:00", client: "Amara Sesay", chair: "Chair 01", service: "Colour, full", price: "1 480 kr" },
  { time: "16:15", client: "Tyra Lindqvist", chair: "Chair 04", service: "Wash & blow-dry", price: "480 kr" },
]

const NOTE = `Ingrid wants the same stylist next visit — put her with Maja.
Chair 03 is down Thursday morning for re-upholstery.
Order more silver toner before Friday; we finish the week on four tins.
Quiet hours confirmed Tue–Thu, 10:00–14:00, until further notice.`

export type GsapMorphTabsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  className?: string
}

export function GsapMorphTabs({
  eyebrow = "GSAP · MORPH TABS",
  title = "One card, three heights.",
  subtitle = "Switch tabs and the frame itself moves: the new panel is measured, the shell tweens to its height while both panels crossfade. No jump, no snap.",
  caption = "HEIGHT MORPH · CROSSFADE · MEASURED PANELS",
  className,
}: GsapMorphTabsProps) {
  const [active, setActive] = React.useState<TabId>("overview")
  const shellRef = React.useRef<HTMLDivElement>(null)
  const panelsRef = React.useRef<Record<TabId, HTMLDivElement | null>>({ overview: null, bookings: null, notes: null })
  const firstRef = React.useRef(true)
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )

  React.useLayoutEffect(() => {
    const shell = shellRef.current
    const panel = panelsRef.current[active]
    if (!shell || !panel) return
    const nextH = panel.offsetHeight
    const others = TABS.map((t) => t.id).filter((id) => id !== active)

    if (firstRef.current || reduce) {
      firstRef.current = false
      gsap.set(shell, { height: nextH })
      gsap.set(panel, { opacity: 1 })
      others.forEach((id) => {
        const p = panelsRef.current[id]
        if (p) gsap.set(p, { opacity: 0 })
      })
      return
    }

    const tweens: gsap.core.Tween[] = []
    others.forEach((id) => {
      const p = panelsRef.current[id]
      if (p) tweens.push(gsap.to(p, { opacity: 0, duration: 0.25, ease: "power1.out" }))
    })
    tweens.push(gsap.to(panel, { opacity: 1, duration: 0.35, delay: 0.12, ease: "power1.in" }))
    tweens.push(gsap.to(shell, { height: nextH, duration: 0.4, ease: "power2.inOut" }))
    return () => tweens.forEach((t) => t.kill())
  }, [active, reduce])

  const setPanelRef = (id: TabId) => (el: HTMLDivElement | null) => {
    panelsRef.current[id] = el
  }

  return (
    <SectionShell width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>

      <div className="mt-10 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4 sm:px-6">
          <div>
            <MonoLabel>Quiet Times Studio · Front desk</MonoLabel>
            <p className="mt-1 font-display text-[15px] font-bold tracking-tight text-foreground">The day, at a glance</p>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Jönköping · CET</span>
        </div>

        <div className="px-5 pb-6 pt-4 sm:px-6">
          <div role="tablist" aria-label="Studio panels" className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={active === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setActive(t.id)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div ref={shellRef} className="relative mt-4 overflow-hidden">
            <div className="grid">
              <div
                ref={setPanelRef("overview")}
                role="tabpanel"
                id="panel-overview"
                aria-labelledby="tab-overview"
                aria-hidden={active !== "overview"}
                className={cn("[grid-area:1/1]", active !== "overview" && "pointer-events-none")}
              >
                <div className="divide-y divide-border">
                  {OVERVIEW.map((row) => (
                    <div key={row.label} className="flex items-baseline justify-between gap-4 py-3.5 first:pt-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{row.hint}</span>
                        <span className="font-display text-lg font-bold tabular-nums text-foreground">{row.value}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={setPanelRef("bookings")}
                role="tabpanel"
                id="panel-bookings"
                aria-labelledby="tab-bookings"
                aria-hidden={active !== "bookings"}
                className={cn("[grid-area:1/1]", active !== "bookings" && "pointer-events-none")}
              >
                <div className="divide-y divide-border">
                  {BOOKINGS.map((b) => (
                    <div key={b.time} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3.5 first:pt-0">
                      <span className="w-12 font-mono text-xs font-semibold tabular-nums text-primary">{b.time}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{b.client}</span>
                      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{b.chair}</span>
                      <span className="text-sm text-muted-foreground">{b.service}</span>
                      <span className="w-20 text-right font-mono text-xs font-semibold tabular-nums text-foreground">{b.price}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                ref={setPanelRef("notes")}
                role="tabpanel"
                id="panel-notes"
                aria-labelledby="tab-notes"
                aria-hidden={active !== "notes"}
                className={cn("[grid-area:1/1]", active !== "notes" && "pointer-events-none")}
              >
                <div className="rounded-xl bg-muted p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <MonoLabel tick={false}>Pinned notes</MonoLabel>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">read-only</span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{NOTE}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </SectionShell>
  )
}
