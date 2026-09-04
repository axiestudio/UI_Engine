import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type StickyCookieProps = {
  message?: React.ReactNode
  accept?: string
  decline?: string
  storageKey?: string
  hasSeenDefault?: boolean
  onAccept?: () => void
  onDecline?: () => void
  className?: string
}

export function StickyCookie({
  message = "We use a few cookies to make this site feel right. Read our policy, then choose.",
  accept = "Accept",
  decline = "Decline",
  storageKey = "sticky-cookie-seen",
  hasSeenDefault,
  onAccept,
  onDecline,
  className,
}: StickyCookieProps) {
  const [seen, setSeen] = React.useState<boolean>(() => {
    if (hasSeenDefault !== undefined) return hasSeenDefault
    if (typeof window === "undefined") return false
    return window.localStorage.getItem(storageKey) === "1"
  })
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const persist = (value: string) => {
    try {
      window.localStorage.setItem(storageKey, value)
    } catch {}
  }

  const handleAccept = () => {
    setSeen(true)
    persist("1")
    onAccept?.()
  }
  const handleDecline = () => {
    setSeen(true)
    persist("1")
    onDecline?.()
  }

  return (
    <div className={cn("relative isolate flex min-h-[320px] w-full flex-col overflow-hidden", className)}>
      <div className="relative isolate mx-auto w-full max-w-3xl flex-1 overflow-hidden px-5 pb-44 pt-16 text-center sm:px-8">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">Scroll — cookies at the foot</p>
      </div>
      <AnimatePresence>
        {!seen && (
          <motion.div
            role="region"
            aria-label="Cookie consent"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] z-10 p-4"
          >
            <div className="mx-auto flex max-w-[760px] flex-col items-center justify-between gap-4 rounded-xl border bg-card p-4 shadow-lg sm:flex-row">
              <p className="text-sm font-medium leading-relaxed text-foreground">{message}</p>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={handleDecline}>
                  {decline}
                </Button>
                <Button size="sm" onClick={handleAccept}>
                  {accept}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
