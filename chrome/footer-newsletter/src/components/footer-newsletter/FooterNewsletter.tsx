import * as React from "react"
import { Send } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Footer newsletter — a footer-embedded email capture.
// ═══ EMOTION     Stay close after the page.
// ═══ SIGNATURE   A slim footer with an integrated signup field.

export type FooterNewsletterProps = {
  brand?: string
  tagline?: string
  note?: string
  cta?: string
  onSubmit?: (email: string) => void
  tone?: "paper" | "ink"
  className?: string
}

export function FooterNewsletter({ brand = "STUDIO", tagline = "One good email a month — sections, resources, no noise.", note = "By signing up you agree to our terms.", cta = "Subscribe", onSubmit, tone = "paper", className }: FooterNewsletterProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [done, setDone] = React.useState(false)
  return (
    <footer className={cn("relative isolate", ink && "bg-foreground text-background", className)}>
      <div className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="grid gap-8 border-b pb-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-display text-xl font-black tracking-tight">{brand}</p>
              <p className={cn("mt-2 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{tagline}</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(email); setDone(true) }} className="flex gap-2">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className={cn("w-full rounded-full border bg-background px-5 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring", ink ? "border-background/25 text-background" : "border-border")} />
              <Button type="submit" className="h-11 shrink-0 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-widest">{done ? "Done ✓" : cta}<Send className="h-4 w-4" /></Button>
            </form>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">© 2026 {brand}</p>
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{note}</p>
          </div>
        </InView>
      </div>
    </footer>
  )
}
