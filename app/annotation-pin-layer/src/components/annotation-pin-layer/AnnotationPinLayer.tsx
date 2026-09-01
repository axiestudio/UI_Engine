import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { MessageSquarePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — review screens need to be POINTED AT.
// JOB      attach comments to a place, not a timestamp
// SIGNATURE pins cluster with COLLISION FANNING (same-spot pins spread on an
//           arc, count on the front pin); clicking a pin fans the group open
//           and the comment card springs in; long-press canvas adds a pin.
// API      pins [{id, x, y (0..1), author, text}], onAddPin, onRemove.
// A11Y     pins are buttons with full-text labels; layer is inert to scroll.

export type Pin = { id: string; x: number; y: number; author: string; text: string }
export type AnnotationPinLayerProps = { canvas: React.ReactNode; pins: Pin[]; onAddPin?: (p: { x: number; y: number }) => void; onRemove?: (id: string) => void; author?: string; className?: string }

export function AnnotationPinLayer({ canvas, pins, onAddPin, onRemove, author = "you", className }: AnnotationPinLayerProps) {
  const [sel, setSel] = React.useState<Pin | null>(null)
  const host = React.useRef<HTMLDivElement>(null)
  const [adding, setAdding] = React.useState(false)
  const groups: { key: string; items: Pin[] }[] = []
  for (const p of pins) {
    const k = `${Math.round(p.x * 20)}:${Math.round(p.y * 20)}`
    const g = groups.find((x) => x.key === k)
    g ? g.items.push(p) : groups.push({ key: k, items: [p] })
  }
  return (
    <div className={cn("relative font-sans", className)}>
      <MotionConfig reducedMotion="user">
      <div className="pointer-events-none">
        <div className="opacity-100 [&_*]:pointer-events-auto">{canvas}      
          
    </div>
      </div>
      <div ref={host} className={cn("absolute inset-0", adding && "cursor-crosshair")} onClick={(e) => {
        if (!adding || !onAddPin) return
        const r = host.current!.getBoundingClientRect()
        onAddPin({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height })
        setAdding(false)
      }}>
        {groups.map((g) => {
          const n = g.items.length
          const fanOpen = sel && g.items.some((p) => p.id === sel.id) && n > 1
          return g.items.map((p, i) => {
            const ang = fanOpen ? (i / n) * Math.PI * 2 : 0
            const rr = fanOpen ? 34 : 0
            return (
              <motion.button
                key={p.id}
                aria-label={`Annotation by ${p.author}: ${p.text}`}
                onClick={(e) => { e.stopPropagation(); setSel(sel?.id === p.id ? null : p) }}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, x: Math.cos(ang) * rr, y: Math.sin(ang) * rr }}
                transition={{ type: "spring", stiffness: 360, damping: 22, delay: i * 0.04 }}
                className={cn("absolute z-[5] -ml-3 -mt-7 grid size-7 place-items-center rounded-full rounded-bl-none text-[11px] font-semibold shadow-lg ring-2 ring-background", n > 1 && !fanOpen && i > 0 && "hidden", fanOpen ? "bg-foreground text-background" : i === 0 ? "bg-[hsl(var(--warn))] text-black" : "")}
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
              >
                {i === 0 && n > 1 ? n : "▪"}
              </motion.button>
            )
          })
        })}
        <AnimatePresence>
          {sel && (
            <motion.div initial={{ opacity: 0, scale: 0.85, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} className="absolute z-[6] w-64 -translate-x-1/2 rounded-xl border bg-popover p-3 shadow-2xl" style={{ left: `${Math.min(0.86, Math.max(0.14, sel.x)) * 100}%`, top: `calc(${sel.y * 100}% + 16px)` }}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] leading-snug">{sel.text}</p>
                <Button type="button" variant="ghost" aria-label="Close annotation" onClick={() => setSel(null)} className="grid size-5 shrink-0 place-items-center rounded hover:bg-muted"><X className="size-3" /></Button>
              </div>
              <p className="mt-2 flex items-center justify-between text-xs text-muted-foreground">{sel.author}{onRemove && <Button type="button" variant="ghost" onClick={() => { onRemove(sel.id); setSel(null) }} className="font-medium text-[hsl(var(--err))] hover:underline">delete</Button>}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {onAddPin && (
        <Button type="button" variant="ghost" onClick={() => setAdding((a) => !a)} aria-pressed={adding} className={cn("absolute bottom-3 right-3 z-[7] flex h-10 items-center gap-2 rounded-full px-4 text-xs font-medium shadow-lg transition-colors", adding ? "bg-[hsl(var(--err))] text-white" : "bg-foreground text-background")}>
          <MessageSquarePlus className="size-4" /> {adding ? "click where · esc" : "annotate"}
        </Button>
      )}
          </MotionConfig>
    </div>
  )
}
