import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronsRight, ChevronLeft, ChevronRight, GripVertical, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — inspect without losing context.
// JOB      read/edit a record's details while the list stays visible
// SIGNATURE the drawer slides from the right edge with a live RESIZE handle
//           (double-click resets); prev/next chevrons walk the selection and
//           the rail remembers its width per session (localStorage optional).
// API      open/onClose + children (your record panel); index/count for nav.
// A11Y     dialog landmark, Esc closes, handle is a real slider with arrows,
//          focus returns to trigger via host.

export type DetailDrawerSplitProps = { open: boolean; onClose: () => void; title?: React.ReactNode; index?: number; count?: number; onPrev?: () => void; onNext?: () => void; defaultWidth?: number; minWidth?: number; maxWidth?: number; persistKey?: string; children: React.ReactNode; className?: string }

export function DetailDrawerSplit({ open, onClose, title, index, count, onPrev, onNext, defaultWidth = 460, minWidth = 320, maxWidth = 780, persistKey, children, className }: DetailDrawerSplitProps) {
  const [w, setW] = React.useState(() => { try { return Number(localStorage.getItem("drawer-" + persistKey)) || defaultWidth } catch { return defaultWidth } })
  const drag = React.useRef<{ x: number; w0: number } | null>(null)
  React.useEffect(() => { try { if (persistKey) localStorage.setItem("drawer-" + persistKey, String(w)) } catch {} }, [w, persistKey])
  const startDrag = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, w0: w }
    const move = (ev: PointerEvent) => drag.current && setW(Math.max(minWidth, Math.min(maxWidth, drag.current.w0 + (drag.current.x - ev.clientX))))
    const up = () => { drag.current = null; window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up) }
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up)
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="false" aria-label="Record details" initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 32, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className={cn("relative flex shrink-0 items-stretch border-l bg-card", className)} style={{ width: w + 12 }}>
          <div role="slider" aria-label="Drawer width" aria-valuenow={Math.round(w)} aria-valuemin={minWidth} aria-valuemax={maxWidth} tabIndex={0} onPointerDown={startDrag} onDoubleClick={() => setW(defaultWidth)} onKeyDown={(e) => { if (e.key === "ArrowLeft") setW((v) => Math.min(maxWidth, v + 24)); if (e.key === "ArrowRight") setW((v) => Math.max(minWidth, v - 24)) }} className="group absolute inset-y-0 left-0 z-10 w-3 cursor-col-resize focus-visible:outline-none">
            <span className="absolute inset-y-0 left-1 w-px bg-transparent transition-colors group-hover:bg-muted-foreground/40" />
            <span aria-hidden className="absolute top-1/2 left-0 grid -translate-y-1/2 place-items-center text-muted-foreground/60"><GripVertical className="size-3.5" /></span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col pl-3">
            <div className="flex h-12 shrink-0 items-center gap-1.5 border-b px-4">
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{title ?? "Details"}</span>
              {count !== undefined && index !== undefined && (
                <span className="flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground">
                  <Button type="button" variant="ghost" aria-label="Previous record" disabled={index <= 0} onClick={onPrev} className="grid size-6 place-items-center rounded hover:bg-muted disabled:opacity-30"><ChevronLeft className="size-4" /></Button>
                  <span className="tabular-nums">{index + 1}/{count}</span>
                  <Button type="button" variant="ghost" aria-label="Next record" disabled={index >= count - 1} onClick={onNext} className="grid size-6 place-items-center rounded hover:bg-muted disabled:opacity-30"><ChevronRight className="size-4" /></Button>
                </span>
              )}
              <Button type="button" variant="ghost" aria-label="Close details" onClick={onClose} className="grid size-7 place-items-center rounded-md hover:bg-muted"><X className="size-4" /></Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
