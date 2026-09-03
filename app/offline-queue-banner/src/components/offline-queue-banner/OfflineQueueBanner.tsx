import * as React from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { CloudOff, RefreshCw, Wifi } from "lucide-react"
import { toast, Toaster } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — the connection lie-detector.
// JOB      tell the truth about sync without panicking anyone
// SIGNATURE while offline the strip slides down and a PENDING COUNT ticks up
//           with each queued write (odometer flash per increment); on reconnect
//           the strip morphs into "pushing N changes…" with a streaming bar,
//           then politely vanishes on empty. Reconnect RESUMES the flush for
//           real (fires the host retry itself) and the outcome is reported as
//           transient feedback via Sonner — the persistent surface stays the
//           banner (sonner manifest: in-layout status is not a toast).
// API      online + queued + flushing flags (host owns fetch layer);
//          optional lastError lets the host report failed syncs per item.
// A11Y     status role, text always says the truth.

export type OfflineQueueBannerProps = { online: boolean; queued: number; flushing?: boolean; onRetryNow?: () => void; lastError?: string; className?: string }

const TOASTER_ID = "offline-queue-banner"

export function OfflineQueueBanner({ online, queued, flushing, onRetryNow, lastError, className }: OfflineQueueBannerProps) {
  const [prevQueued, setPrevQueued] = React.useState(queued)
  React.useEffect(() => { setPrevQueued(queued) }, [queued])

  const queuedRef = React.useRef(queued)
  queuedRef.current = queued
  const onlineRef = React.useRef(online)
  onlineRef.current = online
  const flushingRef = React.useRef(flushing)
  flushingRef.current = flushing
  const wasOnline = React.useRef(online)
  const flushInFlight = React.useRef(false)
  const errorSeen = React.useRef(lastError)

  // Resolves when the queue truly drains (queue empty AND the host stopped
  // flushing). Survives mid-flush disconnects: progress pauses, resumes on
  // reconnect — the watch never reports a lie.
  const watchDrain = () =>
    new Promise<void>((resolve, reject) => {
      flushInFlight.current = true
      const iv = setInterval(() => {
        if (queuedRef.current === 0 && !flushingRef.current) { clearInterval(iv); flushInFlight.current = false; resolve() }
      }, 200)
      setTimeout(() => { clearInterval(iv); if (flushInFlight.current) { flushInFlight.current = false; reject(new Error("the sync stalled")) } }, 60_000)
    })

  const flushWithToast = (n: number) => {
    onRetryNow?.()
    toast.promise(watchDrain(), {
      loading: `Pushing ${n} pending change${n === 1 ? "" : "s"}…`,
      success: `Queued ${n} synced`,
      error: `Sync of ${n} change${n === 1 ? "" : "s"} didn't finish`,
      duration: 4500,
      toasterId: TOASTER_ID,
    })
  }

  const retryNow = () => { if (queued > 0) flushWithToast(queued) }

  // Reconnect actually resumes: if anything is still queued and no flush is
  // running, kick the host's flush on the offline→online edge.
  React.useEffect(() => {
    const was = wasOnline.current
    wasOnline.current = online
    if (was || !online) return
    if (queued > 0 && !flushing && !flushInFlight.current) {
      const n = queued
      toast("Back online — releasing the queue", { id: "oqb-reconnect", description: "Syncing what piled up while you were away.", duration: 2600, toasterId: TOASTER_ID })
      flushWithToast(n)
    }
  }, [online])

  // A flush that finished underneath the banner (host drained the queue on
  // its own) still earns its receipt — banner-initiated drains toast through
  // their own toast.promise instead.
  React.useEffect(() => {
    if (prevQueued > 0 && queued === 0 && !flushing && !flushInFlight.current) {
      toast.success(`Queued ${prevQueued} synced`, { description: prevQueued === 1 ? "The pending change is on the server." : "All pending changes are on the server.", duration: 4000, toasterId: TOASTER_ID })
    }
  }, [queued, flushing, prevQueued])

  // Per-item sync failures the host reports → transient error feedback.
  React.useEffect(() => {
    const prev = errorSeen.current
    errorSeen.current = lastError
    if (lastError && lastError !== prev) {
      toast.error("A queued change failed to sync", { description: lastError, duration: 7000, toasterId: TOASTER_ID, action: onRetryNow && queued > 0 ? { label: "Retry", onClick: () => flushWithToast(queuedRef.current) } : undefined })
    }
  }, [lastError])

  const paused = !!flushing && !online
  const show = !online || queued > 0 || !!flushing
  return (
    <>
      <AnimatePresence initial={false}>
        <MotionConfig reducedMotion="user">
          {show && (
            <motion.div role="status" aria-live="polite" initial={{ y: -34, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -34, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}               className={cn("relative isolate w-full overflow-hidden font-sans", className)}>
              <div className={cn("flex items-center gap-2.5 px-4 py-2 text-sm font-medium", !online ? "bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]" : flushing ? "bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))]" : "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]")}>
                {online ? <Wifi aria-hidden className="size-4" /> : <CloudOff aria-hidden className="size-4" />}
                {!online ? <>You’re offline — <motion.span key={queued} initial={{ scale: 1.35, color: "inherit" }} animate={{ scale: 1 }} className="font-mono font-semibold tabular-nums">{queued}</motion.span> change{queued === 1 ? "" : "s"} will sync when you’re back</> : paused ? <>Sync paused — the connection dropped mid-push; <span className="font-mono font-semibold tabular-nums">{queued}</span> still pending</> : flushing ? <>Pushing {queued} pending change{queued === 1 ? "" : "s"}…</> : <>{queued} change{queued === 1 ? "" : "s"} queued — retry now?</>}
                {online && !flushing && onRetryNow && <Button type="button" variant="ghost" onClick={retryNow} className="ml-auto flex items-center gap-1.5 rounded-full bg-current/10 px-3 py-1 text-xs font-medium hover:bg-current/20"><RefreshCw className="size-3" /> retry</Button>}
                {flushing && !paused && <motion.span aria-hidden animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 left-0 h-[2.5px] w-1/3 bg-current" />}
                {paused && <span aria-hidden className="absolute bottom-0 left-0 h-[2.5px] w-1/3 bg-current opacity-30" />}
              </div>
            </motion.div>
          )}
        </MotionConfig>
      </AnimatePresence>
      <Toaster id={TOASTER_ID} position="bottom-center" richColors closeButton />
    </>
  )
}
