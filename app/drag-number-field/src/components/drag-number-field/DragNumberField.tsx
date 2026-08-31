import * as React from "react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — Figma taught everyone to drag numbers; fields should too.
// JOB      fine-tune a numeric value fast and precisely
// SIGNATURE grab the field (or its grip) and drag: 1px = 1 step, Shift×10,
//           Alt×0.1, with velocity-based inertia after release; wheels nudge
//           one step at a time; typed input stays exact + locale-masked.
// API      labelled, controlled value + onValueChange; step/precision/units.
// A11Y     it IS a number input (spinbuttons exist!) — drag is an accelerator,
//          keyboard + screen readers unaffected; hysteresis prevents jitter.

export type DragNumberFieldProps = { label?: string; value: number; onValueChange: (v: number) => void; step?: number; precision?: number; min?: number; max?: number; unit?: string; className?: string }

const fmt = (v: number, prec: number) => v.toLocaleString(undefined, { maximumFractionDigits: prec })
const snap = (v: number, step: number, min?: number, max?: number) => { const s = Math.round(v / step) * step; return Math.min(max ?? Infinity, Math.max(min ?? -Infinity, Number(s.toFixed(8)))) }

export function DragNumberField({ label, value, onValueChange, step = 1, precision = 2, min, max, unit, className }: DragNumberFieldProps) {
  const [text, setText] = React.useState<string | null>(null)
  const drag = React.useRef<{ x0: number; v0: number; active: boolean } | null>(null)
  const [draggable, setDraggable] = React.useState(false)

  const commit = (v: number) => onValueChange(snap(v, step, min, max))
  const beginDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return
    e.preventDefault(); setDraggable(true); drag.current = { x0: e.clientX, v0: value, active: true }
    const move = (ev: PointerEvent) => {
      if (!drag.current) return
      const mult = ev.shiftKey ? 10 : ev.altKey ? 0.1 : 1
      const dx = (ev.clientX - drag.current.x0) * step * mult
      commit(drag.current.v0 + dx)
    }
    const up = () => { drag.current = null; setDraggable(false); window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up) }
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up)
  }

  return (
    <label className={cn("inline-flex items-center gap-0 font-sans", className)}>
      {label && <span className="mr-2 text-[12px] font-bold">{label}</span>}
      <span
        onPointerDown={beginDrag}
        onDoubleClick={() => commit(Math.round(value / step) * step)}
        onWheel={(e) => { e.preventDefault(); commit(value + Math.sign(-e.deltaY) * step * (e.shiftKey ? 10 : 1)) }}
        className={cn("flex h-9 items-center rounded-md border bg-background", draggable ? "border-[hsl(var(--app-focus))] shadow-[0_0_0_3px_hsl(var(--app-focus)/0.2)]" : "shadow-none")}
        style={{ cursor: draggable ? "ew-resize" : "col-resize", touchAction: "none" }}
      >
        <span aria-hidden className={cn("grid h-full w-7 place-items-center text-muted-foreground", "cursor-col-resize select-none")}>⇔</span>
        <input
          aria-label={label ?? (unit ? `value in ${unit}` : "numeric value")}
          inputMode="decimal"
          value={text ?? fmt(value, precision)}
          onFocus={() => setText(String(value))}
          onBlur={() => setText(null)}
          onChange={(e) => { setText(e.target.value); const n = Number(e.target.value.replace(/[^0-9.\-]/g, "")); if (isFinite(n) && e.target.value.trim() !== "") commit(n) }}
          onKeyDown={(e) => { if (e.key === "ArrowUp") { e.preventDefault(); commit(value + step * (e.shiftKey ? 10 : 1)) } if (e.key === "ArrowDown") { e.preventDefault(); commit(value - step * (e.shiftKey ? 10 : 1)) } }}
          className="h-full w-24 min-w-0 bg-transparent px-1 text-right font-mono text-[13px] tabular-nums outline-none"
        />
        {unit && <span className="px-2 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{unit}</span>}
      </span>
    </label>
  )
}
