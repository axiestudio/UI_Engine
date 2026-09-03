import * as React from "react"
import { motion } from "motion/react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — power users discover power only if you show the map.
// JOB      answer "what are the shortcuts here?" with one key
// SIGNATURE press "?" (or call toggle) → the registry DIALOG dims and shortcut
//           CARDS fly in; press any bound key in the overlay and the matching
//           card flashes. Modal uses the watermelon Dialog registry item, so
//           it is the sanctioned viewport-level overlay — not a handcraft.
// API      bindings [{keys, description, where?, run?}] ; `show` controlled.
// A11Y     aria-modal while open, focus trapped to the dialog, Esc closes.

export type KeyBinding = { keys: string[]; description: string; where?: string }
export type KeyboardMapOverlayProps = { bindings: KeyBinding[]; title?: string; show?: boolean; onToggle?: (v: boolean) => void; className?: string }

export function KeyboardMapOverlay({ bindings, title = "Keyboard map", show: showProp, onToggle, className }: KeyboardMapOverlayProps) {
  const [inner, setInner] = React.useState(false)
  const show = showProp ?? inner
  const [flash, setFlash] = React.useState<string | null>(null)
  React.useEffect(() => {
    if (showProp !== undefined) return
    const k = (e: KeyboardEvent) => { if (e.key === "?" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) { e.preventDefault(); setInner((v) => !v) } }
    window.addEventListener("keydown", k)
    return () => window.removeEventListener("keydown", k)
  }, [showProp])

  const onOwn = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return
    const combo = (e.metaKey ? "⌘" : "") + (e.ctrlKey ? "⌃" : "") + (e.shiftKey && e.key !== "?" ? "⇧" : "") + (e.key.length === 1 && !e.metaKey && !e.ctrlKey ? e.key.toUpperCase() : e.key === "Enter" ? "↵" : e.key === "Escape" ? "esc" : "")
    if (e.metaKey || e.ctrlKey) {
      const hit = bindings.find((b) => b.keys.some((k) => k.toUpperCase() === combo.toUpperCase()))
      if (hit) { setFlash(hit.description); setTimeout(() => setFlash(null), 700); e.preventDefault() }
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (showProp === undefined) setInner(open)
    else onToggle?.(open)
  }

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        onKeyDown={onOwn}
        className={cn("max-h-[80vh] w-full max-w-[720px] overflow-y-auto rounded-xl border bg-background p-6 shadow-2xl outline-none", className)}
      >
        <DialogHeader className="mb-5 flex-row items-center justify-between space-y-0 text-left">
          <div>
            <DialogTitle className="font-display text-lg font-semibold tracking-tight">{title}</DialogTitle>
            <p className="text-xs text-muted-foreground">try a combo — it flashes here</p>
          </div>
          <Button type="button" variant="ghost" aria-label="Close keyboard map" onClick={() => handleOpenChange(false)} className="grid size-8 place-items-center rounded-md hover:bg-muted"><X className="size-4" /></Button>
        </DialogHeader>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {bindings.map((b) => (
            <motion.li
              key={b.description}
              animate={flash === b.description ? { scale: [1, 1.02, 1] } : { scale: 1 }}
              transition={{ duration: 0.5 }}
              className={cn("flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3.5 py-2.5 text-sm transition-colors", flash === b.description && "border-border bg-accent")}
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{b.description}</span>
                {b.where && <span className="text-xs text-muted-foreground">{b.where}</span>}
              </span>
              <span className="flex shrink-0 gap-1">
                {b.keys.map((k) => (
                  <kbd key={k} className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium shadow-[inset_0_-2px_0_hsl(var(--foreground)/0.06)]">{k}</kbd>
                ))}
              </span>
            </motion.li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}