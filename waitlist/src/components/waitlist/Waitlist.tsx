import * as React from "react"
import { ArrowRight, Check } from "lucide-react"
import { GlowEffect } from "@/components/primitives/glow-effect"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type WaitlistProps = {
  eyebrow?: string
  /** Solid first line, e.g. "Something good". */
  title: string
  /** Blur-revealed second line, e.g. "is coming soon". */
  titleHighlight?: string
  subtitle?: string
  placeholder?: string
  buttonLabel?: string
  successTitle?: string
  successDescription?: string
  onSubmit: (email: string) => void | Promise<void>
  /** Optional signup counter, e.g. 1841 — rendered +1 style. */
  count?: number
  countLabel?: string
  launchLabel?: string
  tone?: "paper" | "ink"
  fullPage?: boolean
  className?: string
}

// ── Waitlist ─────────────────────────────────────────────────────────────────

export function Waitlist({
  eyebrow,
  title,
  titleHighlight,
  subtitle = "Be first through the door. One email when we launch, nothing else.",
  placeholder = "you@company.com",
  buttonLabel = "Join waitlist",
  successTitle = "You're in line!",
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

  return (
    <section
      className={cn(ink && "bg-foreground", fullPage && "min-h-svh", "relative flex w-full items-center justify-center overflow-hidden", className)}
      aria-label={eyebrow ?? "Waitlist"}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,var(--tw-gradient-from)_1px,transparent_0)] [background-size:28px_28px] opacity-[0.14]",
          ink ? "[--tw-gradient-from:hsl(0_0%_100%)]" : "[--tw-gradient-from:hsl(0_0%_9%)]",
        )}
      />
      <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
        {eyebrow && (
          <InView variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.45 }} viewOptions={{ once: true }}>
            <span className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "border-background/25 text-background/70" : "border-border bg-secondary text-muted-foreground")}>
              <span className={cn("size-1.5 animate-pulse rounded-full", ink ? "bg-background" : "bg-foreground")} aria-hidden />
              {launchLabel}
            </span>
          </InView>
        )}

        <h1 className={cn("mt-6 font-display text-5xl font-black leading-[0.95] tracking-[-0.05em] sm:text-6xl lg:text-7xl", ink ? "text-background" : "text-foreground")}>
          {title}
          {titleHighlight && (
            <TextEffect as="span" preset="blur" per="word" delay={0.2} className={cn("block", ink ? "text-background/55" : "text-muted-foreground")}>
              {titleHighlight}
            </TextEffect>
          )}
        </h1>

        {subtitle && (
          <InView
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <p className={cn("mt-5 max-w-md text-base font-medium leading-relaxed", ink ? "text-background/65" : "text-muted-foreground")}>
              {subtitle}
            </p>
          </InView>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
          as="div"
        >
          {status === "done" ? (
            <div className={cn("mt-9 flex items-center gap-3 rounded-full border py-2.5 pl-4 pr-6", ink ? "border-background/25 bg-background/5" : "border-border bg-card")}>
              <span className={cn("inline-flex size-8 items-center justify-center rounded-full", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
                <Check className="size-4" strokeWidth={3} />
              </span>
              <span className="text-left">
                <span className={cn("block font-display text-sm font-extrabold", ink ? "text-background" : "text-foreground")}>{successTitle}</span>
                <span className={cn("block text-xs font-medium", ink ? "text-background/60" : "text-muted-foreground")}>{successDescription}</span>
              </span>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-9 flex w-full max-w-md flex-col gap-2.5 sm:flex-row">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                aria-label="Email address"
                autoComplete="email"
                className={cn("h-12 flex-1 rounded-full", ink && "border-background/25 bg-background/5 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/30")}
              />
              <span className="relative inline-flex shrink-0 rounded-full">
                <GlowEffect
                  colors={ink ? ["#ffffff", "#a3a3a3", "#ffffff"] : ["#121212", "#525252", "#121212"]}
                  mode="breathe"
                  blur="medium"
                  duration={4}
                  className="rounded-full opacity-60"
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "pending"}
                  className={cn("relative h-12 rounded-full px-7", ink && "bg-background text-foreground hover:bg-background/90")}
                >
                  {status === "pending" ? "Joining…" : buttonLabel}
                  {status === "idle" && <ArrowRight className="size-4" />}
                </Button>
              </span>
            </form>
          )}
        </InView>

        {typeof count === "number" && status !== "done" && (
          <p className={cn("mt-6 font-mono text-xs font-bold uppercase tracking-widest", ink ? "text-background/45" : "text-muted-foreground")}>
            <span className={cn("text-sm", ink ? "text-background" : "text-foreground")}>{count.toLocaleString()}</span> {countLabel}
          </p>
        )}
      </div>
    </section>
  )
}
