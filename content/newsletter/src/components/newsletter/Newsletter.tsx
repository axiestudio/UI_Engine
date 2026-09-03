import * as React from "react"
import { ArrowRight, Check } from "lucide-react"

import { Magnetic } from "@/components/primitives/magnetic"
import { BorderTrail } from "@/components/primitives/border-trail"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Noise from "@/components/primitives/noise"

// ── Types ────────────────────────────────────────────────────────────────────
export type NewsletterProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  placeholder?: string
  buttonLabel?: string
  successTitle?: string
  successDescription?: string
  finePrint?: string
  onSubmit?: (email: string) => void | Promise<void>
  /** ink = dark band with card; paper = bordered card on light bg. Default ink. */
  tone?: "paper" | "ink"
  className?: string
}

// ── Newsletter ───────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · The card reads like a mailed subscription slip: torn-edge dashed rule on
//   the left, a rotated mono "stamp" top-right, ruled baseline grid.
// · Headline carries one serif-italic turn ("first") so the grotesk doesn't
//   read as a template.
// · Input sits ON a rule line (borderless bottom line), like signing the slip.
// · The button is magnetic with a hard offset shadow on hover — tactile.

// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_NEWSLETTER_ONSUBMIT = () => {}

export function Newsletter({
  eyebrow = "The letter",
  title = "Get the good stuff",
  subtitle = "One considered email a week — what shipped, what we learned, what's next. No noise, no growth-hack theatre.",
  placeholder = "you@company.com",
  buttonLabel = "Subscribe",
  successTitle = "You're on the list",
  successDescription = "Check your inbox to confirm — the next letter lands Sunday.",
  finePrint = "Unsubscribe with one click. We never share your address.",
  onSubmit = DEMO_NEWSLETTER_ONSUBMIT,
  tone = "ink",
  className,
}: NewsletterProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "pending" | "done">("idle")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status !== "idle") return
    setStatus("pending")
    try {
      await onSubmit(email)
      setStatus("done")
    } catch {
      setStatus("idle")
    }
  }

  return (
    <section className={cn(ink ? "bg-foreground" : "bg-background", "relative isolate w-full overflow-hidden", className)} aria-label="Newsletter">
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><Noise patternAlpha={Math.round((ink ? 0.07 : 0.04) * 255)} patternSize={240} patternRefreshInterval={3} /></span>
      <div className="mx-auto w-full max-w-[880px] px-4 py-20 sm:px-6 sm:py-28">
        <div
          className={cn(
            "relative grid gap-10 overflow-hidden border p-8 sm:grid-cols-[1.1fr_1fr] sm:gap-12 sm:p-12",
            ink ? "border-background/15 bg-background/[0.03]" : "border-border bg-card shadow-sm",
          )}
        >
          {!ink && <span aria-hidden className={cn("pointer-events-none absolute inset-0", "text-foreground/20")}>
    <span className="absolute border-current top-[8px] left-[8px] border-t border-l" style={{ width: 12, height: 12 }} />
    <span className="absolute border-current top-[8px] right-[8px] border-t border-r" style={{ width: 12, height: 12 }} />
    <span className="absolute border-current bottom-[8px] left-[8px] border-b border-l" style={{ width: 12, height: 12 }} />
    <span className="absolute border-current bottom-[8px] right-[8px] border-b border-r" style={{ width: 12, height: 12 }} />
  </span>}
          {status === "idle" && <BorderTrail size={36} className={cn(ink ? "bg-background/70" : "bg-foreground/70")} />}

          {/* rotated mono stamp — the hand-placed seal */}
          <span
            aria-hidden
            className={cn(
              "absolute right-6 top-6 hidden rotate-3 select-none border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.22em] sm:block",
              ink ? "border-background/30 text-background/50" : "border-border text-muted-foreground/70",
            )}
          >
            no. {String(new Date().getFullYear()).slice(2)} — weekly
          </span>

          <div className="relative">
            <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", cn(ink ? "text-background/55" : "text-muted-foreground"))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
            <TextEffect
              as="h2"
              preset="slide"
              per="word"
              speedReveal={1.3}
              className={cn("mt-4 font-display text-[30px] font-bold leading-[1.02] tracking-[-0.035em] sm:text-4xl", ink ? "text-background" : "text-foreground")}
            >
              {title}
            </TextEffect>
            <p className={cn("mt-4 max-w-sm text-sm font-medium leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
              {subtitle}
            </p>
            <p className={cn("mt-6 hidden items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] sm:inline-flex", ink ? "text-background/35" : "text-muted-foreground/60")}>
              <span aria-hidden className="inline-block h-px w-8 bg-current opacity-40" />
              2,400+ readers
            </p>
          </div>

          <div className="relative sm:border-l sm:pl-10 sm:[border-style:dashed]">
            {status === "done" ? (
              <div className="flex h-full flex-col items-start justify-center py-4">
                <span className={cn("inline-flex size-11 items-center justify-center rounded-full", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
                  <Check className="size-5" strokeWidth={3} />
                </span>
                <p className={cn("mt-4 font-display text-lg font-bold tracking-tight", ink ? "text-background" : "text-foreground")}>
                  {successTitle}
                </p>
                <p className={cn("mt-1.5 text-sm font-medium leading-relaxed", ink ? "text-background/60" : "text-muted-foreground")}>
                  {successDescription}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="flex h-full flex-col justify-center gap-5">
                {/* signing-line input: bottom rule only */}
                <label className="block">
                  <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/45" : "text-muted-foreground/70")}>
                    Email
                  </span>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="email"
                    aria-label="Email address"
                    className={cn(
                      "mt-1 h-auto w-full rounded-none border-x-0 border-b border-t-0 bg-transparent pb-2 pt-1 font-mono text-sm font-semibold focus-visible:ring-0",
                      ink
                        ? "border-background/30 text-background focus-visible:border-background/70"
                        : "border-border text-foreground focus-visible:border-foreground/70",
                    )}
                  />
                </label>
                <Magnetic intensity={0.3} range={70}>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={status === "pending"}
                    className={cn(
                      "group relative w-full justify-between overflow-hidden rounded-none border px-5 font-mono text-xs font-bold uppercase tracking-[0.18em]",
                      "transition-all duration-300 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[3px_3px_0_0_currentColor]",
                      ink
                        ? "border-background bg-background text-foreground hover:bg-background/90"
                        : "border-foreground bg-foreground text-background hover:bg-foreground/90",
                    )}
                  >
                    {status === "pending" ? "Signing…" : buttonLabel}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Button>
                </Magnetic>
                {finePrint && (
                  <p className={cn("text-[11px] font-medium leading-relaxed", ink ? "text-background/35" : "text-muted-foreground/70")}>
                    {finePrint}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
