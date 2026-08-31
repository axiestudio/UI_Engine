import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
import { Dots, Grain, MonoLabel } from "@/components/primitives/handcraft"
import { GlowEffect } from "@/components/primitives/glow-effect"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type WaitlistProps = {
  eyebrow?: string
  /** Solid first line, e.g. "Something good". */
  title: string
  /** Second line, e.g. "is coming soon" — words rise one by one. */
  titleHighlight?: string
  subtitle?: string
  placeholder?: string
  buttonLabel?: string
  successTitle?: string
  successDescription?: string
  onSubmit: (email: string) => void | Promise<void>
  /** Optional signup counter — rendered as a flip-style mono readout. */
  count?: number
  countLabel?: string
  launchLabel?: string
  tone?: "paper" | "ink"
  fullPage?: boolean
  className?: string
}

// ── Waitlist ─────────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · One emotion: ANTICIPATION. Everything is quiet except three signals —
//   the pulsing beacon, the dotted horizon line behind the headline, and the
//   odometer counter (tabular-nums, per-digit cells).
// · Headline is deliberately over-sized (clamp to 7rem) with tracking so tight
//   it almost touches — urgency in the letterforms themselves.
// · The form is a single signing line: input + hard-cornered button, no card
//   wrapper. Less chrome = more tension.
export function Waitlist({
  eyebrow,
  title,
  titleHighlight,
  subtitle = "Join the waitlist — one email at launch.",
  placeholder = "you@company.com",
  buttonLabel = "Join waitlist",
  successTitle = "You're in line",
  successDescription = "Watch your inbox — we'll ping you the moment doors open.",
  onSubmit,
  count,
  countLabel = "already waiting",
  launchLabel = "Launching soon",
  tone = "ink",
  fullPage = true,
  className,
}: WaitlistProps) {
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

  const digits = String(count ?? "").padStart(5, "0")

  return (
    <section
      className={cn(ink && "bg-foreground", fullPage && "min-h-svh", "relative isolate flex w-full items-center justify-center overflow-hidden", className)}
      aria-label="Waitlist"
    >
      <Grain opacity={ink ? 0.08 : 0.045} />
      {/* dotted horizon: fades out left+right, sits behind the headline midline */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-[46%] h-40 w-[140%] -translate-x-1/2 [background-image:radial-gradient(circle_at_1px_1px,var(--dot)_1px,transparent_0)] [background-size:20px_20px] opacity-[0.14] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black_20%,transparent_80%)]",
        )}
        style={{ ["--dot" as string]: ink ? "hsl(0 0% 100%)" : "hsl(0 0% 9%)" }}
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <InView variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5 }} viewOptions={{ once: true }}>
          <span className={cn("inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]", ink ? "border-background/25 text-background/70" : "border-border bg-card text-muted-foreground")}>
            <span className="relative flex size-1.5">
              <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-60", ink ? "bg-background" : "bg-foreground")} />
              <span className={cn("relative inline-flex size-1.5 rounded-full", ink ? "bg-background" : "bg-foreground")} />
            </span>
            {launchLabel}
          </span>
        </InView>

        <h1
          className={cn(
            "mt-8 font-display text-[clamp(3rem,9vw,7rem)] font-semibold leading-[0.9] tracking-[-0.05em]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {title}
          {titleHighlight && (
            <TextEffect as="span" preset="slide" per="word" delay={0.3} speedReveal={1.2} className="block">
              {titleHighlight}
            </TextEffect>
          )}
        </h1>

        {subtitle && (
          <p className={cn("mt-6 max-w-md text-[15px] font-medium leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
            {subtitle}
          </p>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          {status === "done" ? (
            <div className={cn("mt-10 inline-flex items-center gap-3 rounded-full border py-2.5 pl-4 pr-6", ink ? "border-background/25 bg-background/5" : "border-border bg-card")}>
              <span className={cn("inline-flex size-8 items-center justify-center rounded-full", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span className="text-left">
                <span className={cn("block font-display text-sm font-semibold", ink ? "text-background" : "text-foreground")}>{successTitle}</span>
                <span className={cn("block text-xs font-medium", ink ? "text-background/55" : "text-muted-foreground")}>{successDescription}</span>
              </span>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                autoComplete="email"
                aria-label="Email address"
                className={cn(
                  "h-[52px] flex-1 border bg-transparent px-5 py-3.5 font-mono text-sm font-semibold outline-none transition-colors placeholder:font-medium placeholder:opacity-40",
                  ink
                    ? "border-background/30 text-background focus:border-background/70"
                    : "border-border bg-card text-foreground focus:border-foreground/70",
                )}
              />
              <span className="relative inline-flex shrink-0">
                <GlowEffect
                  colors={
                    ink
                      ? ["hsl(var(--background))", "hsl(var(--muted-foreground))", "hsl(var(--background))"]
                      : ["hsl(var(--foreground))", "hsl(var(--muted-foreground))", "hsl(var(--foreground))"]
                  }
                  mode="breathe"
                  blur="medium"
                  duration={4}
                  className="opacity-50"
                />
                <Button
                  type="submit"
                  disabled={status === "pending"}
                  className={cn(
                    "group relative h-full min-w-40 justify-between gap-3 overflow-hidden rounded-md border px-6 font-mono text-xs font-bold uppercase tracking-[0.08em]",
                    ink
                      ? "border-background bg-background text-foreground hover:bg-background/90"
                      : "border-foreground bg-foreground text-background hover:bg-foreground/90",
                  )}
                >
                  {status === "pending" ? "Joining…" : buttonLabel}
                  {status === "idle" && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />}
                </Button>
              </span>
            </form>
          )}
        </InView>

        {typeof count === "number" && status !== "done" && (
          <div className="mt-8 flex items-center gap-3">
            {/* odometer readout: per-digit cells, tabular */}
            <span className={cn("inline-flex gap-1", ink ? "text-background" : "text-foreground")} aria-label={`${count} ${countLabel}`}>
              {digits.split("").map((d, i) => (
                <span
                  key={i}
                  className={cn(
                    "inline-flex size-7 items-center justify-center border font-mono text-xs font-bold tabular-nums",
                    ink ? "border-background/25 bg-background/5" : "border-border bg-card",
                  )}
                >
                  {d}
                </span>
              ))}
            </span>
            <MonoLabel className={cn(ink ? "text-background/45" : "text-muted-foreground")}>{countLabel}</MonoLabel>
          </div>
        )}
      </div>
    </section>
  )
}
