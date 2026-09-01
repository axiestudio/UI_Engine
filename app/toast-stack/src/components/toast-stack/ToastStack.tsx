import * as React from "react"
import { motion, AnimatePresence, MotionConfig, animate, useMotionValue, useTransform } from "motion/react"
import { CircleAlert, CheckCircle2, Info, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — ephemeral feedback that respects the user's time.
// JOB      say "saved ✓" without interrupting anything
// SIGNATURE cards stack with real PHYSICS-ish layout (newest pushes others),
//           swipe-drag or click-x dismisses with velocity throw; hover PAUSES
//           the progress bar (and the timer); actions ride as real buttons.
// API      items [{id, title, body?, tone, action?}], onDismiss(id).
// A11Y     role=status/alert per tone; progress is visual-only.

export type Toast = { id: string; title: string; body?: string; tone?: "ok" | "err" | "warn" | "info"; action?: { label: string; run: () => void }; duration?: number }
export type ToastStackProps = { toasts: Toast[]; onDismiss: (id: string) => void; pos?: "br" | "tr" | "bl" | "tl"; className?: string }

const TONE = { ok: { i: CheckCircle2, c: "hsl(var(--ok))" }, err: { i: XCircle, c: "hsl(var(--err))" }, warn: { i: CircleAlert, c: "hsl(var(--warn))" }, info: { i: Info, c: "hsl(var(--info))" } } as const

export function ToastStack({ toasts, onDismiss, pos = "br", className }: ToastStackProps) {
  return (
    <div className={cn("pointer-events-none fixed z-[125] flex w-[min(92vw,380px)] flex-col gap-2 p-4", pos === "br" && "bottom-0 right-0", pos === "tr" && "top-0 right-0", pos === "bl" && "bottom-0 left-0", pos === "tl" && "top-0 left-0", className)} aria-label="Notifications">
      <MotionConfig reducedMotion="user">
      <AnimatePresence initial={false}>
        {toasts.map((t) => <ToastCard key={t.id} toast={t} onDismiss={onDismiss} />)}
      </AnimatePresence>
          
          </MotionConfig>
    </div>
  )
}

function ToastCard({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-160, 0, 160], [0, 1, 0])
  const [paused, setPaused] = React.useState(false)
  const Icon = (TONE[t.tone ?? "info"] as { i: React.ElementType }).i
  const color = TONE[t.tone ?? "info"].c
  React.useEffect(() => { const iv = setInterval(() => !paused && dismiss(), t.duration ?? 5000); return () => clearInterval(iv) }, [paused, t.duration])
  const dismiss = () => onDismiss(t.id)
  return (
    <motion.div
      layout role={t.tone === "err" ? "alert" : "status"} aria-label={t.title}
      initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
      style={{ x, opacity }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.6}
      onDragEnd={(_, i) => { if (Math.abs(i.offset.x) > 90 || Math.abs(i.velocity.x) > 500) { animate(x, i.offset.x > 0 ? 220 : -220, { duration: 0.2 }); setTimeout(dismiss, 180) } else animate(x, 0, { type: "spring", stiffness: 500, damping: 34 }) }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      className="pointer-events-auto relative overflow-hidden rounded-lg border border-border/70 bg-popover shadow-lg"
    >
      <div className="flex gap-3 p-3.5">
        <Icon aria-hidden className="size-5 shrink-0" style={{ color }} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{t.title}</p>
          {t.body && <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{t.body}</p>}
        </div>
        {t.action && <Button type="button" variant="ghost" onClick={() => { t.action!.run(); dismiss() }} className="h-fit shrink-0 rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs font-medium hover:bg-muted">{t.action.label}</Button>}
        <Button type="button" variant="ghost" aria-label="Dismiss" onClick={dismiss} className="grid size-6 shrink-0 place-items-center self-start rounded-md text-muted-foreground hover:bg-muted"><X className="size-3.5" /></Button>
      </div>
      <motion.div className="absolute bottom-0 left-0 h-[3px] w-full origin-left" style={{ background: color }} animate={{ scaleX: paused ? undefined : 0 }} initial={{ scaleX: 1 }} transition={{ duration: (t.duration ?? 5000) / 1000, ease: "linear" }} />
    </motion.div>
  )
}
