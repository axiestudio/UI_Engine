import * as React from "react"
import { Minus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type NumberStepperProps = {
  label?: string
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  /** Optional unit caption, e.g. "guests", "portions". */
  unit?: string
  format?: (v: number) => string
  onChange?: (value: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

// ── NumberStepper ────────────────────────────────────────────────────────────

/**
 * Accessible quantity stepper for booking/menus.
 * - controlled (`value`) or uncontrolled (`defaultValue`)
 * - click or hold-to-repeat on the buttons; arrow keys + wheel when focused
 * - real number input underneath for screen readers and text entry
 */
export function NumberStepper({
  label,
  value,
  defaultValue = 0,
  min = 0,
  max = 99,
  step = 1,
  unit,
  format,
  onChange,
  disabled = false,
  size = "md",
  className,
}: NumberStepperProps) {
  const controlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultValue)
  const current = controlled ? value! : internal
  const [holding, setHolding] = React.useState<0 | 1 | -1>(0)
  const currentRef = React.useRef(current)
  currentRef.current = current

  React.useEffect(() => {
    if (!holding) return
    const id = holding as 1 | -1
    // immediate step already happened on pointerdown; schedule accelerated repeats
    let delay = 320
    let timer: number
    const tick = () => {
      set(currentRef.current + id * step)
      delay = Math.max(70, delay - 45)
      timer = window.setTimeout(tick, delay)
    }
    timer = window.setTimeout(tick, delay)
    return () => window.clearTimeout(timer)
  }, [holding, step, min, max])

  const set = (n: number) => {
    const clamped = Math.min(max, Math.max(min, n))
    if (!controlled) setInternal(clamped)
    if (clamped !== currentRef.current) onChange?.(clamped)
  }
  const single = (id: 1 | -1) => {
    if (disabled || (id === 1 && current >= max) || (id === -1 && current <= min)) return
    set(current + id * step)
  }

  const dims = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10"
  const valCls = size === "sm" ? "w-12 text-sm" : size === "lg" ? "w-20 text-[26px]" : "w-14 text-lg"

  const btnHandlers = (id: 1 | -1) => ({
    onClick: (e: React.MouseEvent) => { if (holding) e.preventDefault(); },
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      if (disabled) return
      e.preventDefault()
      single(id)
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      setHolding(id)
    },
    onPointerUp: () => setHolding(0),
    onPointerCancel: () => setHolding(0),
    onLostPointerCapture: () => setHolding(0),
  })

  return (
    <div className={cn("inline-flex flex-col items-center gap-0.5", className)}>
      {label && (
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      )}
      <div className={cn("flex items-center gap-1 rounded-full border bg-card p-1 shadow-xs", disabled && "pointer-events-none opacity-50")}>
        <button type="button" aria-label={`Decrease${label ? ` ${label.toLowerCase()}` : ""}`} disabled={current <= min} {...btnHandlers(-1)} className={cn("flex items-center justify-center rounded-full transition-colors hover:bg-accent active:scale-95 disabled:opacity-30", dims)}>
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={label ?? "quantity"}
          value={format ? format(current) : current}
          readOnly={!format}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); single(1) }
            if (e.key === "ArrowDown") { e.preventDefault(); single(-1) }
          }}
          onWheel={(e) => {
            if (document.activeElement !== e.currentTarget) return
            e.preventDefault()
            single(e.deltaY < 0 ? 1 : -1)
          }}
          className={cn("bg-transparent text-center font-display font-black tabular-nums tracking-tight text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none", valCls)}
        />
        <button type="button" aria-label={`Increase${label ? ` ${label.toLowerCase()}` : ""}`} disabled={current >= max} {...btnHandlers(1)} className={cn("flex items-center justify-center rounded-full transition-colors hover:bg-accent active:scale-95 disabled:opacity-30", dims)}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {unit && (
        <span aria-hidden className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {unit}
        </span>
      )}
      <span aria-live="polite" className="sr-only">
        {current} {unit ?? label ?? ""}
      </span>
    </div>
  )
}
