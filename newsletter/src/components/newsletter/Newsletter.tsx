import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
import { BorderTrail } from "@/components/primitives/border-trail"
import { Spotlight } from "@/components/primitives/spotlight"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

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
  onSubmit: (email: string) => void | Promise<void>
  /** ink = dark band with card; paper = bordered card on light bg. Default ink. */
  tone?: "paper" | "ink"
  className?: string
}

// ── Newsletter ───────────────────────────────────────────────────────────────

export function Newsletter({
  eyebrow,
  title = "Get the good stuff first",
  subtitle = "Product updates, no spam — unsubscribe whenever. Join readers getting one useful email a week.",
  placeholder = "you@company.com",
  buttonLabel = "Subscribe",
  successTitle = "You're on the list!",
  successDescription = "Check your inbox to confirm your subscription.",
  finePrint = "By subscribing you agree to our privacy policy.",
  onSubmit,
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
    <section className={cn(ink ? "bg-foreground" : "bg-background", "w-full", className)} aria-label="Newsletter">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div
          className={cn(
            "relative mx-auto max-w-3xl overflow-hidden rounded-[24px] border p-8 text-center sm:p-12",
            ink ? "border-background/15 bg-transparent" : "border-border bg-card shadow-sm",
          )}
        >
          {!ink && <Spotlight size={420} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.05),transparent_75%)] blur-2xl" />}
          {status === "idle" && <BorderTrail size={40} className={cn(ink ? "bg-background" : "bg-foreground")} />}

          {status === "done" ? (
            <div className="relative flex flex-col items-center py-6">
              <span className={cn("inline-flex size-12 items-center justify-center rounded-full", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
                <Check className="size-6" strokeWidth={2.5} />
              </span>
              <h2 className={cn("mt-5 font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl", ink ? "text-background" : "text-foreground")}>
                {successTitle}
              </h2>
              <p className={cn("mt-2 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                {successDescription}
              </p>
            </div>
          ) : (
            <div className="relative">
              {eyebrow && (
                <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>
                  {eyebrow}
                </p>
              )}
              <TextEffect
                as="h2"
                preset="blur"
                per="word"
                className={cn("mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}
              >
                {title}
              </TextEffect>
              <p className={cn("mx-auto mt-3 max-w-lg text-sm font-medium leading-relaxed sm:text-base", ink ? "text-background/70" : "text-muted-foreground")}>
                {subtitle}
              </p>
              <form onSubmit={submit} className="mx-auto mt-7 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  aria-label="Email address"
                  autoComplete="email"
                  className={cn("h-11 flex-1", ink && "border-background/25 bg-background/5 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/30")}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "pending"}
                  className={cn("h-11 min-w-32", ink && "bg-background text-foreground hover:bg-background/90")}
                >
                  {status === "pending" ? "Subscribing…" : buttonLabel}
                  {status !== "pending" && <ArrowRight className="size-4" />}
                </Button>
              </form>
              {finePrint && (
                <p className={cn("mt-4 text-xs font-medium", ink ? "text-background/40" : "text-muted-foreground/80")}>
                  {finePrint}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
