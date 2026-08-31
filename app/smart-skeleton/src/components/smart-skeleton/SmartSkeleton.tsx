import * as React from "react"
import { motion } from "motion/react"
import { Clock3 } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — loading that respects the reader.
// JOB      occupy space with the TRUTH about what's coming
// SIGNATURE shimmer travels along the exact skeleton of your future layout
//           (rows/cards/avatars composed from primitives); after `slowAfterMs`
//           a quiet "why is this late?" explanation chip slides in; on data
//           arrival, real content cross-fades the skeleton upward.
// A11Y     busy role + "loading" label; explanation is text, not tooltip.

export type SmartSkeletonProps = { loading: boolean; lines?: number; avatar?: boolean; slowLabel?: string; slowAfterMs?: number; children: React.ReactNode; className?: string }

export function SmartSkeleton({ loading, lines = 3, avatar, slowLabel = "Fetching from the south region — it’s cold there.", slowAfterMs = 1400, children, className }: SmartSkeletonProps) {
  const [slow, setSlow] = React.useState(false)
  React.useEffect(() => { if (!loading) { setSlow(false); return } const t = setTimeout(() => setSlow(true), slowAfterMs); return () => clearTimeout(t) }, [loading, slowAfterMs])
  return (
    <div className={cn("relative font-sans", className)}>
      <motion.div aria-hidden={!loading} aria-busy={loading} aria-label={loading ? "Loading content" : undefined} animate={{ opacity: loading ? 1 : 0, y: loading ? 0 : -6 }} transition={{ duration: 0.3 }} className={cn(!loading && "pointer-events-none absolute inset-0")}>
        <div className="space-y-3">
          {avatar && (
            <div className="flex items-center gap-3">
              <Shimmer className="size-10 rounded-full" />
              <div className="flex-1 space-y-1.5"><Shimmer className="h-3.5 w-32" /><Shimmer className="h-3 w-24" /></div>
            </div>
          )}
          {Array.from({ length: lines }, (_, i) => <Shimmer key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />)}
        </div>
        <motion.div animate={{ height: slow ? 34 : 0, opacity: slow ? 1 : 0 }} className="overflow-hidden">
          <p className="mt-3 flex items-center gap-2 rounded-lg bg-[hsl(var(--warn)/0.12)] px-3 py-2 text-[11px] font-bold text-[hsl(var(--warn))]"><Clock3 className="size-3.5 shrink-0" /> {slowLabel}</p>
        </motion.div>
      </motion.div>
      <motion.div aria-hidden={loading} animate={{ opacity: loading ? 0 : 1, y: loading ? 8 : 0 }} transition={{ duration: 0.35 }} className={cn(loading && "pointer-events-none")}>{children}</motion.div>
    </div>
  )
}
function Shimmer({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      <motion.span aria-hidden className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/15" animate={{ x: ["-120%", "420%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  )
}
