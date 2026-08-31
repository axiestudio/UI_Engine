import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CloudOff, RefreshCw, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — the connection lie-detector.
// JOB      tell the truth about sync without panicking anyone
// SIGNATURE while offline the strip slides down and a PENDING COUNT ticks up
//           with each queued write (odometer flash per increment); on reconnect
//           the strip morphs into "pushing N changes…" with a streaming bar,
//           then politely vanishes on empty.
// API      online + queued + flushing flags (host owns fetch layer) — this is
//          a purely presentational state machine that never lies.
// A11Y     status role, text always says the truth.

export type OfflineQueueBannerProps = { online: boolean; queued: number; flushing?: boolean; onRetryNow?: () => void; className?: string }

export function OfflineQueueBanner({ online, queued, flushing, onRetryNow, className }: OfflineQueueBannerProps) {
  const [prevQueued, setPrevQueued] = React.useState(queued)
  React.useEffect(() => { setPrevQueued(queued) }, [queued])
  const show = !online || queued > 0 || !!flushing
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div role="status" aria-live="polite" initial={{ y: -34, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -34, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className={cn("relative w-full overflow-hidden font-sans", className)}>
          <div className={cn("flex items-center gap-2.5 px-4 py-2 text-sm font-medium", !online ? "bg-[hsl(var(--warn)/0.15)] text-[hsl(var(--warn))]" : flushing ? "bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))]" : "bg-[hsl(var(--ok)/0.12)] text-[hsl(var(--ok))]")}>
            {online ? <Wifi aria-hidden className="size-4" /> : <CloudOff aria-hidden className="size-4" />}
            {!online ? <>You’re offline — <motion.span key={queued} initial={{ scale: 1.35, color: "inherit" }} animate={{ scale: 1 }} className="font-mono font-semibold tabular-nums">{queued}</motion.span> change{queued === 1 ? "" : "s"} will sync when you’re back</> : flushing ? <>Pushing {queued} pending change{queued === 1 ? "" : "s"}…</> : <>{queued} change{queued === 1 ? "" : "s"} queued — retry now?</>}
            {online && !flushing && onRetryNow && <button onClick={onRetryNow} className="ml-auto flex items-center gap-1.5 rounded-full bg-current/10 px-3 py-1 text-xs font-medium hover:bg-current/20"><RefreshCw className="size-3" /> retry</button>}
            {flushing && <motion.span aria-hidden animate={{ x: ["-100%", "100%"] }} transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 left-0 h-[2.5px] w-1/3 bg-current" />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
