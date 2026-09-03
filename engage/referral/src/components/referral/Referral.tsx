import * as React from "react"
import { Users, Copy, Check, AlertCircle } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Referral — a share-and-earn invite with clipboard feedback.
// ═══ EMOTION     Bring a friend.

export type ReferralProps = {
  eyebrow?: string
  title?: React.ReactNode
  body?: React.ReactNode
  amount?: string
  link?: string
  cta?: string
  tone?: "paper" | "ink"
  className?: string
}

export function Referral({
  eyebrow = "REFER",
  title = "Give a month, get a month.",
  body = "Share your link. When a friend joins, you both get a month free.",
  amount = "1 month free",
  link = "https://studio.com/r/you",
  cta = "Copy link",
  tone = "paper",
  className,
}: ReferralProps) {
  const ink = tone === "ink"
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const timerRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setError(null)
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("Copy failed — select the link manually.")
      setCopied(false)
    }
  }

  return (
    <SectionShell tone={tone} width={760} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
        <div className={cn("relative isolate overflow-hidden rounded-2xl border p-8 text-center shadow-sm sm:p-8", ink ? "border-background/20 bg-background/5" : "border-border bg-card")}>
          <span className={cn("mx-auto flex h-12 w-12 items-center justify-center rounded-full ring-1", ink ? "bg-background/10 ring-background/15" : "bg-accent ring-border")}>
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <p className={cn("mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.24em]", ink ? "text-background/60" : "text-muted-foreground")}>{eyebrow}</p>
          <h2 className="mt-3 font-display text-2xl font-black tracking-[-0.02em] sm:text-3xl">{title}</h2>
          <p className={cn("mx-auto mt-3 max-w-sm text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{body}</p>

          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 font-display text-lg font-black text-emerald-600 ring-1 ring-emerald-500/15">{amount}</span>

          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2">
            <code
              className={cn(
                "min-w-0 flex-1 truncate rounded-xl border bg-muted/50 px-3 py-2.5 text-left font-mono text-xs font-medium shadow-inner",
                ink ? "border-background/15 bg-background/10" : "border-border",
              )}
              aria-label={`Referral link: ${link}`}
            >
              {link}
            </code>
            <Button variant="outline" size="sm" onClick={copy} aria-live="polite" className="h-10 shrink-0 rounded-full border px-4 font-mono text-[10px] font-bold uppercase tracking-widest shadow-xs">
              {copied ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5" aria-hidden /> Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3.5 w-3.5" aria-hidden /> {cta}
                </>
              )}
            </Button>
          </div>
          <div className="mx-auto mt-2 min-h-[20px] max-w-md">
            {copied ? (
              <p className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-600" role="status" aria-live="polite">
                <Check className="h-3 w-3" aria-hidden /> Link copied to clipboard
              </p>
            ) : error ? (
              <p className="flex items-center justify-center gap-1 text-xs font-medium text-destructive" role="alert">
                <AlertCircle className="h-3 w-3" aria-hidden />
                {error}
              </p>
            ) : (
              <p className="text-xs font-medium text-muted-foreground">Earn credit when they join — they’ll thank you too.</p>
            )}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
