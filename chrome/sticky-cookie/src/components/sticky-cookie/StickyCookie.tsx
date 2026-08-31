import * as React from "react"
import { Cookie } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Sticky cookie — a dismissible consent bar.
// ═══ EMOTION     Compliant without being a wall.
// ═══ SIGNATURE   A sticky bottom consent bar with accept / decline.

export type StickyCookieProps = {
  message?: React.ReactNode
  accept?: string
  decline?: string
  hasSeenDefault?: boolean
  onAccept?: () => void
  onDecline?: () => void
  className?: string
}

export function StickyCookie({ message = "We use a few cookies to make this site feel right. Read our policy, then choose.", accept = "Accept", decline = "Decline", hasSeenDefault, onAccept, onDecline, className }: StickyCookieProps) {
  const [seen, setSeen] = React.useState<boolean>(hasSeenDefault ?? false)
  return (
    <div className={cn("relative", className)}>
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">SCROLL — COOKIES AT THE FOOT</p>
      </div>
      {!seen && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4">
          <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <div className="mx-auto flex max-w-[760px] flex-col items-center justify-between gap-4 rounded-2xl border bg-card/95 p-4 shadow-2xl backdrop-blur sm:flex-row">
              <div className="flex items-center gap-3 text-left">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent"><Cookie className="h-4 w-4" /></span>
                <p className="text-sm font-medium leading-relaxed text-foreground">{message}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSeen(true); onDecline?.() }} className="rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{decline}</Button>
                <Button size="sm" onClick={() => { setSeen(true); onAccept?.() }} className="rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{accept}</Button>
              </div>
            </div>
          </InView>
        </div>
      )}
    </div>
  )
}
