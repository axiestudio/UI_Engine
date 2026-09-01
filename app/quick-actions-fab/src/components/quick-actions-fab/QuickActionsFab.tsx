import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import {
  FloatingArrow,
  FloatingPortal,
  arrow,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react"
import { toast, Toaster } from "sonner"
import { BellRing, BookOpen, CalendarPlus, Plus, UserPlus, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — the board's "new thing" muscle, one tap deep.
// JOB      start the four actions you start all day without hunting the app
// SIGNATURE the FAB springs open into a quarter-arc of actions (preset flair —
//           motion transforms, not positioning-engine), each wearing a label
//           pill welded on with Floating UI (hover/focus → anchored tooltip).
// POSITIONING every hint panel is a useFloating surface: reference = the action
//           button, middleware [offset → flip → shift(8) → arrow → hide],
//           whileElementsMounted autoUpdate, useHover + useFocus + useRole.
//           The arc math is entrance choreography of the buttons themselves —
//           they are the references, not an anchored surface.
// API      actions [{label, icon, hint?, run?}] + onAction — additive.
// A11Y     registry buttons throughout; tooltips reachable by keyboard focus;
//          Escape collapses; reduced motion snaps the arc; completed actions
//          report to a preset-scoped Sonner toast.

const TOASTER_ID = "quick-actions-fab"

export type QuickAction = {
  label: string
  icon: LucideIcon
  hint?: string
  run?: () => void
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "New booking", icon: CalendarPlus, hint: "Open the composer — press N" },
  { label: "Add client", icon: UserPlus, hint: "Start a client card" },
  { label: "Send reminder", icon: BellRing, hint: "SMS the day’s board" },
  { label: "Open ledger", icon: BookOpen, hint: "Jump to the money page" },
]

const RADIUS = 96

function arcOffset(index: number, count: number) {
  const t = count <= 1 ? 0 : index / (count - 1)
  const rad = ((180 + t * 90) * Math.PI) / 180
  return { x: Math.cos(rad) * RADIUS, y: Math.sin(rad) * RADIUS }
}

export type QuickActionsFabProps = {
  eyebrow?: string
  actions?: QuickAction[]
  onAction?: (a: QuickAction) => void
  className?: string
}

function ActionOrb({
  action, index, count, open, reduce, onFire,
}: {
  action: QuickAction
  index: number
  count: number
  open: boolean
  reduce: boolean
  onFire: () => void
}) {
  const arc = arcOffset(index, count)
  const Icon = action.icon
  const [tipOpen, setTipOpen] = React.useState(false)
  const arrowRef = React.useRef<SVGSVGElement>(null)

  const { refs, floatingStyles, context } = useFloating({
    open: tipOpen,
    onOpenChange: setTipOpen,
    placement: "top",
    middleware: [offset(8), flip({ padding: 8 }), shift({ padding: 8 }), arrow({ element: arrowRef }), hide()],
    whileElementsMounted: autoUpdate,
  })
  const hover = useHover(context, { delay: { open: 200, close: 120 }, restMs: 60 })
  const focus = useFocus(context)
  const role = useRole(context, { role: "tooltip" })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, role])

  return (
    <>
      <motion.span
        className="absolute bottom-20 right-7 z-20"
        initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
        animate={{ x: arc.x, y: arc.y, scale: 1, opacity: open ? 1 : 0, pointerEvents: open ? ("auto" as const) : ("none" as const) }}
        exit={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30, delay: open ? index * 0.045 : (count - 1 - index) * 0.03 }}
      >
        <Button
          type="button"
          ref={refs.setReference}
          variant="outline"
          aria-label={action.label}
          title={action.label}
          onClick={onFire}
          {...getReferenceProps()}
          className={cn(
            "flex size-10 items-center justify-center rounded-full border-border bg-card p-0 text-foreground shadow-md hover:bg-accent",
            !open && "pointer-events-none",
          )}
        >
          <Icon className="size-4" strokeWidth={2.25} aria-hidden />
          <span className="sr-only">{action.label}</span>
        </Button>
      </motion.span>
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles, opacity: tipOpen && open ? 1 : 0, visibility: tipOpen && open ? "visible" as const : "hidden" as const }}
          className={cn("relative z-[96] w-max max-w-[220px] rounded-md border border-border/70 bg-popover px-2.5 py-1.5 text-[12px] font-medium text-popover-foreground shadow-lg transition-opacity", !tipOpen && "pointer-events-none")}
          {...getFloatingProps()}
        >
          {action.label}
          {action.hint && <span className="mt-0.5 block text-[11px] font-normal text-muted-foreground">{action.hint}</span>}
          <FloatingArrow ref={arrowRef} context={context} fill="hsl(var(--popover))" stroke="hsl(var(--border))" strokeWidth={1} width={12} height={6} />
        </div>
      </FloatingPortal>
    </>
  )
}

export function QuickActionsFab({ eyebrow = "Board · October", actions = DEFAULT_ACTIONS, onAction, className }: QuickActionsFabProps) {
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const [open, setOpen] = React.useState(false)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const fabRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current
    if (!open || !stage) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); fabRef.current?.focus() }
    }
    stage.addEventListener("keydown", onKey)
    return () => stage.removeEventListener("keydown", onKey)
  }, [open])

  const fire = (a: QuickAction) => {
    setOpen(false)
    a.run?.()
    if (onAction) onAction(a)
    else toast(`${a.label} — started`, { description: "Quick action fired from the board FAB.", duration: 2600, toasterId: TOASTER_ID })
  }

  return (
    <div ref={stageRef} className={cn("relative h-[420px] overflow-hidden rounded-xl border border-dashed bg-muted/20", className)}>
      <div className="flex items-center justify-between border-b border-border bg-background/70 px-4 py-3">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Quiet Times Studio · 18:42</span>
      </div>

      <ul className="space-y-1.5 px-4 pt-4">
        {["09:00 · Maja — Chair 1", "10:30 · Jonas — Chair 3", "13:00 · Tove — Chair 1", "15:15 · Waldo — Chair 2"].map((row) => (
          <li key={row} className="flex items-center gap-2.5 text-[12px] font-medium text-muted-foreground">
            <span aria-hidden className="size-[5px] shrink-0 rotate-45 bg-foreground/40" />
            {row}
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-10 bg-background/40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && actions.map((action, i) => (
          <ActionOrb key={action.label} action={action} index={i} count={actions.length} open={open} reduce={reduce} onFire={() => fire(action)} />
        ))}
      </AnimatePresence>

      <Button
        ref={fabRef}
        type="button"
        variant="ghost"
        aria-expanded={open}
        aria-label={open ? "Close quick actions" : "Quick actions"}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "absolute bottom-5 right-5 z-30 size-12 rounded-full bg-foreground p-0 text-background shadow-xl ring-offset-background transition-transform duration-200 hover:bg-foreground/90 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "rotate-45",
        )}
      >
        <Plus className="size-5" strokeWidth={2.5} aria-hidden />
      </Button>
      <Toaster id={TOASTER_ID} position="top-right" visibleToasts={2} />
    </div>
  )
}
