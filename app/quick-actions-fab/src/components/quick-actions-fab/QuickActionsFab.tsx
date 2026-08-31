import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { BellRing, BookOpen, CalendarPlus, Plus, UserPlus, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

export type QuickAction = {
  label: string
  icon: LucideIcon
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: "New booking", icon: CalendarPlus },
  { label: "Add client", icon: UserPlus },
  { label: "Send reminder", icon: BellRing },
  { label: "Open ledger", icon: BookOpen },
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
  className?: string
}

export function QuickActionsFab({ eyebrow = "Board · October", actions = DEFAULT_ACTIONS, className }: QuickActionsFabProps) {
  const reduce = React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  )
  const [open, setOpen] = React.useState(false)
  const stageRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current
    if (!open || !stage) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    stage.addEventListener("keydown", onKey)
    return () => stage.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div ref={stageRef} className={cn("relative h-[420px] overflow-hidden rounded-xl border border-dashed bg-muted/20", className)}>
      <div className="flex items-center justify-between border-b border-border bg-background/70 px-4 py-3">
        <MonoLabel className="text-muted-foreground">{eyebrow}</MonoLabel>
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
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close quick actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-10 cursor-default bg-background/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open &&
          actions.map((action, i) => {
            const offset = arcOffset(i, actions.length)
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                type="button"
                title={action.label}
                aria-label={action.label}
                onClick={() => setOpen(false)}
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                animate={{ x: offset.x, y: offset.y, scale: 1, opacity: 1 }}
                exit={{ x: 0, y: 0, scale: 0.4, opacity: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 30, delay: open ? i * 0.045 : (actions.length - 1 - i) * 0.03 }
                }
                className="absolute bottom-6 right-6 z-20 flex size-10 items-center justify-center rounded-full border border-border bg-card shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="size-4" strokeWidth={2.25} aria-hidden />
                <span className="sr-only">{action.label}</span>
              </motion.button>
            )
          })}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={open}
        aria-label="Quick actions"
        onClick={() => setOpen((o) => !o)}
        animate={{ rotate: open ? 45 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 26 }}
        className="absolute bottom-5 right-5 z-30 flex size-12 items-center justify-center rounded-full bg-foreground text-background shadow-xl ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Plus className="size-5" strokeWidth={2.5} aria-hidden />
      </motion.button>
    </div>
  )
}
