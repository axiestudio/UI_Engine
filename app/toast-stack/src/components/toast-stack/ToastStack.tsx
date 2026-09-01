import * as React from "react"
import { toast, Toaster } from "sonner"

// ═══ APP-PRIMARY — ephemeral feedback that respects the user's time.
// JOB      say "saved ✓" without interrupting anything
// SIGNATURE the stack mechanics ARE Sonner now (preset-scoped <Toaster
//           id="toast-stack">): newest pushes from the corner, swipe-drag
//           dismisses, hover pauses the timer, per-tone icons + timer bar,
//           actions ride as real buttons. This file owns voice + position
//           mapping only — no bespoke animation engine.
// API      controlled stays: items [{id,title,body?,tone,action?}],
//          onDismiss(id), pos. Imperative: notify({title,body?,tone?}).
// A11Y     toaster container is labelled; text/timers come from Sonner.

export type Toast = { id: string; title: string; body?: string; tone?: "ok" | "err" | "warn" | "info"; action?: { label: string; run: () => void }; duration?: number }
export type ToastStackProps = { toasts?: Toast[]; onDismiss?: (id: string) => void; pos?: "br" | "tr" | "bl" | "tl"; className?: string }

const TOASTER_ID = "toast-stack"
const POS = { br: "bottom-right", tr: "top-right", bl: "bottom-left", tl: "top-left" } as const

/** Fire one stack-card through the preset-scoped Sonner toaster. Safe to call before unmount; idempotent per id. */
export function fireToast(t: Toast, onDismiss?: (id: string) => void) {
  const act = t.action
  const data = {
    id: `ts-${t.id}`,
    description: t.body,
    duration: t.duration ?? 5000,
    toasterId: TOASTER_ID,
    ...(act ? { action: { label: act.label, onClick: () => act.run() } } : {}),
    ...(onDismiss ? { onDismiss: () => onDismiss(t.id) } : {}),
  }
  switch (t.tone) {
    case "ok": toast.success(t.title, data); break
    case "err": toast.error(t.title, data); break
    case "warn": toast.warning(t.title, data); break
    case "info": toast.info(t.title, data); break
    default: toast(t.title, data)
  }
}

/** Imperative entrypoint: toast-stack notifies without a parent state array. */
export function notify(input: Omit<Toast, "id"> & { id?: string }) {
  fireToast({ id: input.id ?? String(Date.now() + Math.random()), ...input })
}

export function ToastStack({ toasts, onDismiss, pos = "br", className }: ToastStackProps) {
  const dismissRef = React.useRef(onDismiss)
  dismissRef.current = onDismiss
  const seen = React.useRef(new Set<string>())

  // Diff the controlled list against Sonner: fire for items never seen,
  // retract toasts the host dropped by some other route.
  React.useEffect(() => {
    const list = toasts ?? []
    for (const t of list) {
      if (seen.current.has(t.id)) continue
      seen.current.add(t.id)
      fireToast(t, (id) => { seen.current.delete(id); dismissRef.current?.(id) })
    }
    for (const id of [...seen.current]) {
      if (!list.some((t) => t.id === id)) {
        seen.current.delete(id)
        toast.dismiss(`ts-${id}`)
      }
    }
  })

  return (
    <Toaster
      id={TOASTER_ID}
      position={POS[pos]}
      richColors
      closeButton
      visibleToasts={4}
      containerAriaLabel="Notifications"
      className={className}
    />
  )
}
