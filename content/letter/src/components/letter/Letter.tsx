import * as React from "react"
import { useInView, useReducedMotion } from "motion/react"
import { Check, Loader2, Stamp } from "lucide-react"
import { ProgressiveBlur } from "@/components/primitives/progressive-blur"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: convert "occasional guest" into "kept in the loop" — the email is
//   the quietest retention asset a small studio owns.
// EMOTION: the post that arrives addressed to you by hand. Warm, slower,
//   real paper; email as correspondence, not broadcast.
// SIGNATURE MOVE: the letter FOCUSES on arrival — content rises behind a
//   ProgressiveBlur veil that dissolves once (mp blur-to-focus), then a
//   wax-stamp chip sits tilted on the corner of the envelope border. The
//   greeting is set in display serif, italic-first, signed at the bottom
//   like it actually came from someone.
// ─────────────────────────────────────────────────────────────────────────────

export type LetterProps = {
  /** Who it's signed from ("Astrid & the Tuesday table"). */
  signedBy?: string
  greeting?: string
  body?: string
  title?: string
  placeholder?: string
  subscribeLabel?: string
  successLabel?: string
  note?: string
  /** required — no fake "subscribed!". Rejects keep the card in error mode. */
  onSubmit: (email: string) => Promise<void> | void
  className?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Letter({
  signedBy,
  greeting = "Dear friend of the studio,",
  body = "One note a month — what we learned about bodies this month, what changed here, and the quiet offer we run for whoever reads it. You can walk away from it in a click.",
  title = "The monthly letter",
  placeholder = "you@example.com",
  subscribeLabel = "Post it to me",
  successLabel = "Addressed. It'll arrive with the next month.",
  note = "Monthly. No sales theatre. Unsubscribe in one click, no hard feelings.",
  onSubmit,
  className,
}: LetterProps) {
  const reduce = useReducedMotion()
  const paperRef = React.useRef<HTMLDivElement>(null)
  const inView = useInView(paperRef, { once: true, margin: "-80px" })
  const [appeared, setAppeared] = React.useState(false)
  React.useEffect(() => {
    if (!inView || reduce) return
    const t = window.setTimeout(() => setAppeared(true), 420)
    return () => window.clearTimeout(t)
  }, [inView, reduce])
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "busy" | "done" | "err">("idle")
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === "busy") return
    if (!EMAIL_RE.test(email)) {
      setStatus("err")
      return
    }
    setStatus("busy")
    try {
      await onSubmit(email)
      setStatus("done")
    } catch {
      setStatus("err")
    }
  }

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[680px] px-4 py-16 sm:px-6 lg:py-24">
          <div className="relative rounded-[24px] border border-border bg-card shadow-[0_24px_60px_-30px_rgba(0,0,0,0.4)]">
            {/* stamp corner */}
            <span aria-hidden className="absolute -top-4 -right-3 flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-lg border-2 border-dashed border-foreground/30 bg-background text-foreground shadow-sm">
              <Stamp className="h-5 w-5 opacity-70" />
            </span>

            {/* the postmark rule */}
            <div aria-hidden className="absolute inset-x-6 top-8 border-t border-dashed border-border" />

            <div className="relative px-6 pb-6 pt-12 sm:px-9 sm:pb-9 sm:pt-16">
              {!reduce && (
                <div
                  aria-hidden
                  className={cn("pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[24px] transition-opacity duration-1000 ease-out", appeared ? "opacity-0" : "opacity-100")}
                >
                  <ProgressiveBlur direction="top" blurLayers={5} blurIntensity={0.45} className="absolute inset-0" />
                </div>
              )}
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
              <p className="mt-4 font-display text-2xl font-black italic leading-[1.15] tracking-tight">{greeting}</p>
              <p className="mt-4 max-w-prose text-[15px] font-medium leading-[1.8] text-muted-foreground">{body}</p>
              {signedBy && (
                <p className="mt-6 font-display text-sm font-bold tracking-tight">
                  — {signedBy}
                </p>
              )}

              <form onSubmit={submit} noValidate className="mt-7 border-t pt-6">
                {status === "done" ? (
                  <p role="status" className="flex items-center gap-2 text-sm font-bold tracking-tight">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                    {successLabel}
                  </p>
                ) : (
                  <div className="flex max-w-sm flex-col gap-3 sm:flex-row">
                    <Input
                      type="email"
                      autoComplete="email"
                      aria-label="Email address"
                      aria-invalid={status === "err"}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (status === "err") setStatus("idle") }}
                      placeholder={placeholder}
                      disabled={status === "busy"}
                      className="h-11 flex-1 rounded-full bg-background shadow-none"
                    />
                    <Button type="submit" disabled={status === "busy"} className="h-11 shrink-0 rounded-full px-6 font-display text-sm font-extrabold tracking-tight">
                      {status === "busy" ? <><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />Addressing…</> : subscribeLabel}
                    </Button>
                  </div>
                )}
                {status === "err" && <p role="alert" className="mt-2 text-xs font-semibold text-destructive">{EMAIL_RE.test(email) ? "The post office refused it — try again?" : "That address doesn't look real."}</p>}
                {note && <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{note}</p>}
              </form>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
