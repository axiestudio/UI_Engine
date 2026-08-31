import * as React from "react"
import { cn } from "@/lib/utils"

// ── RECEIPT BASE — the bottom bun. Barcode + thank-you sign-off. ────────────

export type ReceiptBaseProps = {
  signOff?: string
  className?: string
}

export function ReceiptBase({ signOff = "Thank you — see you soon", className }: ReceiptBaseProps) {
  return (
    <div className={cn("px-6 pb-5 pt-4 text-center", className)}>
      {/* pseudo barcode — content data, not theming */}
      <div
        aria-hidden
        className="mx-auto h-9 w-44 opacity-80 [background-image:repeating-linear-gradient(90deg,hsl(var(--foreground))_0,hsl(var(--foreground))_2px,transparent_2px,transparent_5px)]"
      />
      <p className="mt-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{signOff}</p>
    </div>
  )
}
