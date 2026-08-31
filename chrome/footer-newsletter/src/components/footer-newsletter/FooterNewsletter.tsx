import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type FooterNewsletterProps = {
  brand?: string
  tagline?: string
  note?: string
  cta?: string
  onSubmit?: (email: string) => void
  tone?: "paper" | "ink"
  className?: string
}

export function FooterNewsletter({
  brand = "STUDIO",
  tagline = "One good email a month — sections, resources, no noise.",
  note = "By signing up you agree to our terms.",
  cta = "Subscribe",
  onSubmit,
  tone = "paper",
  className,
}: FooterNewsletterProps) {
  const ink = tone === "ink"
  const [email, setEmail] = React.useState("")
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const id = React.useId()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@") || !email.includes(".")) {
      setError("Enter a valid email")
      return
    }
    setError(null)
    onSubmit?.(email)
    setDone(true)
  }

  return (
    <footer className={cn("relative isolate border-t", ink ? "bg-foreground text-background" : "bg-card", className)}>
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="font-display text-xl font-bold tracking-tight">{brand}</p>
              <p className={cn("mt-2 max-w-sm text-sm leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{tagline}</p>
            </div>
            <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="flex-1">
                <Label htmlFor={`${id}-email`} className="sr-only">
                  Email address
                </Label>
                <Input
                  id={`${id}-email`}
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@studio.com"
                  className={cn("h-11", ink && "bg-background text-foreground placeholder:text-muted-foreground")}
                />
                {error && (
                  <p id={`${id}-error`} role="alert" className="mt-2 text-xs font-medium text-destructive">
                    {error}
                  </p>
                )}
                {done && !error && (
                  <p role="status" className="mt-2 text-xs font-medium text-muted-foreground">
                    Check your inbox — you’re on the list.
                  </p>
                )}
              </div>
              <Button type="submit" className="h-11 shrink-0">
                {done ? "Done" : cta}
              </Button>
            </form>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-6">
            <p className="font-mono text-xs text-muted-foreground">© 2026 {brand}</p>
            <p className="font-mono text-xs text-muted-foreground">{note}</p>
          </div>
        </InView>
      </div>
    </footer>
  )
}
