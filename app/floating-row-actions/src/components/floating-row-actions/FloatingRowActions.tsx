import * as React from "react"
import { FloatingPortal, useFloating, useInteractions, useRole, shift, offset, autoUpdate } from "@floating-ui/react"
import { CalendarClock, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Put each booking's tools exactly where the row is.
// ═══ EMOTION     The ledger answering back — quiet, precise, unhurried.
// ═══ SIGNATURE   Rest on a row and a toolbar floats in from its left edge,
//                 welded on with autoUpdate. Actions are demo-only; the
//                 receipt is inked into an aria-live mono status line.

export type Booking = { id: string; client: string; treatment: string; time: string; chair: string }
export type RowAction = { kind: "edit" | "move" | "cancel"; label: string; verb: string; icon: React.ElementType }

export type FloatingRowActionsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  bookings?: Booking[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_BOOKINGS: Booking[] = [
  { id: "Visit #4809", client: "Maja Ekström", treatment: "Balayage & gloss", time: "09:00", chair: "Chair 1" },
  { id: "Visit #4810", client: "Jonas Wiklund", treatment: "Skin fade", time: "10:30", chair: "Chair 3" },
  { id: "Visit #4811", client: "Freja Holm", treatment: "Bridal updo trial", time: "11:15", chair: "Chair 2" },
  { id: "Visit #4812", client: "Tove Abrahamsson", treatment: "Full colour & cut", time: "13:00", chair: "Chair 1" },
  { id: "Visit #4813", client: "Sven Lagergren", treatment: "Beard trim & shape", time: "15:45", chair: "Chair 4" },
]

const ACTIONS: RowAction[] = [
  { kind: "edit", label: "Edit booking", verb: "editing", icon: Pencil },
  { kind: "move", label: "Move booking", verb: "moved", icon: CalendarClock },
  { kind: "cancel", label: "Cancel booking", verb: "cancelled", icon: X },
]

export function FloatingRowActions({
  eyebrow = "FLOATING UI · ROW ACTIONS",
  title = "Actions live where the row is.",
  subtitle = "Rest on any booking and its toolbar floats in from the left edge of the row — flip and shift keep it on stage, so the chair column never hides a button. Actions here are demo-only; the receipt is spoken, not shipped.",
  bookings = DEFAULT_BOOKINGS,
  caption = "HOVER A ROW · THE BAR FOLLOWS THE ROW, NOT THE CURSOR",
  tone = "paper",
  className,
}: FloatingRowActionsProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [hoveredId, setHoveredId] = React.useState<string | null>(null)
  const [status, setStatus] = React.useState(`${bookings.length} visits on the board — hover a row to act`)
  const closeTimer = React.useRef<number | null>(null)

  const cancelClose = React.useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])
  const scheduleClose = React.useCallback(() => {
    cancelClose()
    closeTimer.current = window.setTimeout(() => setHoveredId(null), 120)
  }, [cancelClose])
  React.useEffect(() => () => cancelClose(), [cancelClose])

  const { refs, floatingStyles, context } = useFloating({
    open: hoveredId !== null,
    placement: "left-start",
    middleware: [offset(10), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getFloatingProps } = useInteractions([useRole(context, { role: "toolbar" })])

  return (
    <SectionShell tone={tone} width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10">
          <div className={cn("overflow-hidden rounded-[16px] border bg-card shadow-[0_24px_52px_-30px_hsl(var(--foreground)/0.45)]", ink ? "border-background/15" : "border-border")}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    {["Visit", "Client", "Treatment", "Time", "Chair"].map((h) => (
                      <th key={h} scope="col" className="px-5 py-3.5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const hovered = hoveredId === b.id
                    return (
                      <tr
                        key={b.id}
                        ref={hovered ? refs.setReference : undefined}
                        onMouseEnter={() => {
                          cancelClose()
                          setHoveredId(b.id)
                        }}
                        onMouseLeave={scheduleClose}
                        className={cn("border-t border-border transition-colors first:border-t-0", hovered ? "bg-muted" : "bg-transparent")}
                      >
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-muted-foreground">{b.id}</td>
                        <td className="px-5 py-3.5 text-[14px] font-semibold text-foreground">{b.client}</td>
                        <td className="px-5 py-3.5 text-[13px] font-medium text-muted-foreground">{b.treatment}</td>
                        <td className="px-5 py-3.5 font-mono text-[12px] font-bold text-foreground">{b.time}</td>
                        <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-muted-foreground">{b.chair}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p aria-live="polite" className="flex items-center gap-2.5 border-t border-border px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <span aria-hidden className="inline-block size-[5px] rotate-45 bg-primary" />
              {status}
            </p>
          </div>

          {caption && (
            <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </p>
          )}
        </div>
      </InView>

      {hoveredId && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            aria-label={`Actions for ${hoveredId}`}
            className="z-50 flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-[0_18px_44px_-16px_hsl(var(--foreground)/0.45)]"
          >
            {ACTIONS.map(({ kind, label, verb, icon: Icon }) => (
              <button
                key={kind}
                type="button"
                title={label}
                aria-label={`${label} — ${hoveredId}`}
                onClick={() => {
                  setStatus(`${verb} ${hoveredId}`)
                  setHoveredId(null)
                }}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-4" strokeWidth={2.25} aria-hidden />
              </button>
            ))}
          </div>
        </FloatingPortal>
      )}
    </SectionShell>
  )
}
