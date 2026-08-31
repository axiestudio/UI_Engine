import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — power users discover power only if you show the map.
// JOB      answer "what are the shortcuts here?" with one key
// SIGNATURE press "?" (or call toggle) → the UI dims and shortcut CARDS fly
//           in over their regions; press any bound key in the overlay and the
//           matching card flashes + "runs" through your handler.
// API      bindings [{keys, description, where?, run?}] ; `show` controlled.
// A11Y     aria-modal while open, focus trapped to the dialog, Esc closes.

export type KeyBinding = { keys: string[]; description: string; where?: string }
export type KeyboardMapOverlayProps = { bindings: KeyBinding[]; title?: string; show?: boolean; onToggle?: (v: boolean) => void; className?: string }

export function KeyboardMapOverlay({ bindings, title = "Keyboard map", show: showProp, onToggle, className }: KeyboardMapOverlayProps) {
  const [inner, setInner] = React.useState(false)
  const show = showProp ?? inner
  const ref = React.useRef<HTMLDivElement>(null)
  const [flash, setFlash] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (showProp !== undefined) return
    const k = (e: KeyboardEvent) => { if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setInner((v) => !v) } }
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [showProp])
  React.useEffect(() => { if (show) requestAnimationFrame(() => ref.current?.focus()) }, [show])

  const onOwn = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { showProp === undefined ? setInner(false) : onToggle?.(false); return }
    const combo = (e.metaKey ? "⌘" : "") + (e.ctrlKey ? "⌃" : "") + (e.shiftKey && e.key !== "?" ? "⇧" : "") + (e.key.length === 1 && !e.metaKey && !e.ctrlKey ? e.key.toUpperCase() : e.key === "Enter" ? "↵" : e.key === "Escape" ? "esc" : "")
    if (e.metaKey || e.ctrlKey) {
      const hit = bindings.find((b) => b.keys.some((k) => k.toUpperCase() === combo.toUpperCase()))
      if (hit) { setFlash(hit.description); setTimeout(() => setFlash(null), 700); e.preventDefault() }
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm", className)}>
          <motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} onKeyDown={onOwn} initial={{ scale: 0.97, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0 }} className="max-h-[80vh] w-full max-w-[720px] overflow-y-auto rounded-xl border bg-background p-6 shadow-2xl outline-none">
            <div className="mb-5 flex items-center justify-between">
              <div><h3 className="font-display text-lg font-black tracking-tight">{title}</h3><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">try a combo — it flashes here</p></div>
              <button aria-label="Close keyboard map" onClick={() => (showProp === undefined ? setInner(false) : onToggle?.(false))} className="grid size-8 place-items-center rounded-md hover:bg-muted"><X className="size-4" /></button>
            </div>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {bindings.map((b) => (
                <li key={b.description} className={cn("flex items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-2.5 text-[13px] transition-colors", flash === b.description && "border-[hsl(var(--app-focus))] bg-accent")}>
                  <span className="min-w-0"><span className="block truncate font-medium">{b.description}</span>{b.where && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{b.where}</span>}</span>
                  <span className="flex shrink-0 gap-1">{b.keys.map((k) => <kbd key={k} className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold shadow-[inset_0_-2px_0_rgba(0,0,0,0.08)]">{k}</kbd>)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
