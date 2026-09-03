import * as React from "react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useClick,
  useDismiss,
  useRole,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Peek before promising: chairs at a slot, one rest away.
// ═══ EMOTION     A diary that shows its hand — nothing gets booked twice.
// ═══ SIGNATURE   Open slots pop a chair card to the right (flip + shift);
//                 booking inks the slot solid and closes the popover behind
//                 you. Booked rows go dark and stop answering.

export type ChairSlot = { chair: string; free: boolean }
export type DaySlot = { time: string; booked?: string; chairs: ChairSlot[] }

export type FloatingSlotPopoverProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  slots?: DaySlot[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const chairs = (one: boolean, two: boolean, three: boolean): ChairSlot[] => [
  { chair: "Chair 1 · Ingrid", free: one },
  { chair: "Chair 2 · Vera", free: two },
  { chair: "Chair 3 · Mika", free: three },
]

const DEFAULT_SLOTS: DaySlot[] = [
  { time: "09:00", chairs: chairs(true, true, true) },
  { time: "09:45", chairs: chairs(true, false, true) },
  { time: "10:30", booked: "Maja Ekström · Balayage", chairs: chairs(false, false, false) },
  { time: "11:15", chairs: chairs(true, true, false) },
  { time: "12:45", chairs: chairs(false, true, true) },
  { time: "13:30", booked: "Jonas Wiklund · Skin fade", chairs: chairs(false, false, false) },
  { time: "14:15", chairs: chairs(true, true, true) },
  { time: "15:00", chairs: chairs(false, false, true) },
]

function SlotRow({ time, client, chairs: slotChairs, onBook }: { time: string; client?: string; chairs: ChairSlot[]; onBook: () => void }) {
  const [open, setOpen] = React.useState(false)
  const booked = Boolean(client)
  const freeCount = slotChairs.filter((c) => c.free).length

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "right",
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ])

  if (booked) {
    return (
      <div className="flex w-full items-center justify-between rounded-lg bg-foreground px-4 py-3 text-background">
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="font-mono text-[13px] font-black">{time}</span>
          <span className="truncate text-[12px] font-medium text-background/80">{client}</span>
        </span>
        <span className="ml-3 shrink-0 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-background/60">booked</span>
      </div>
    )
  }

  return (
    <>
      <Button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-expanded={open}
        aria-label={`${time}, ${freeCount} of 3 chairs free`}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border bg-card px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open ? "border-foreground/50 bg-muted" : "border-border hover:border-foreground/40 hover:bg-muted",
        )}
      >
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-[13px] font-black text-foreground">{time}</span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">45 min</span>
        </span>
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-primary">
          {freeCount} chair{freeCount === 1 ? "" : "s"} free
        </span>
      </Button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            aria-label={`Chairs at ${time}`}
            className="z-50 w-60 rounded-xl border border-border bg-card p-3.5 shadow-[0_18px_44px_-16px_hsl(var(--foreground)/0.45)]"
          >
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">Chairs at {time}</p>
            <ul className="mt-2.5 space-y-1.5">
              {slotChairs.map((c) => (
                <li key={c.chair} className="flex items-center justify-between gap-3 text-[12px] font-medium">
                  <span className="text-foreground">{c.chair}</span>
                  <span className={cn("relative isolate overflow-hidden font-mono text-[11px] font-black", c.free ? "text-primary" : "text-muted-foreground opacity-50")}>
                    <span aria-hidden>{c.free ? "✓" : "–"}</span>
                    <span className="sr-only">{c.free ? "free" : "taken"}</span>
                  </span>
                </li>
              ))}
            </ul>
            <Button
              type="button"
              onClick={() => {
                setOpen(false)
                onBook()
              }}
              className="mt-3 w-full rounded-lg px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em]"
            >
              Book {time}
            </Button>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export function FloatingSlotPopover({
  eyebrow = "FLOATING UI · SLOT POPOVER",
  title = "Free before you promise it.",
  subtitle = "Rest on an open slot to peek at the three chairs — book straight from the popover and the slot inks itself onto the board. The 11:45 lunch gap stays dark.",
  slots = DEFAULT_SLOTS,
  caption = "45-MIN GRID · 09:00–16:30 · RIGHT-ANCHORED, FLIP + SHIFT",
  tone = "paper",
  className,
}: FloatingSlotPopoverProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [held, setHeld] = React.useState<string[]>([])

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10 grid gap-2.5 sm:grid-cols-2">
          {slots.map((slot) => (
            <SlotRow
              key={slot.time}
              time={slot.time}
              client={slot.booked ?? (held.includes(slot.time) ? "You · demo hold" : undefined)}
              chairs={slot.chairs}
              onBook={() => setHeld((h) => (h.includes(slot.time) ? h : [...h, slot.time]))}
            />
          ))}
        </div>

        {caption && (
          <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        )}
      </InView>
    </SectionShell>
  )
}
