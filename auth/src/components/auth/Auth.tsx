import * as React from "react"
import { TextEffect } from "@/components/primitives/text-effect"
import { Spotlight } from "@/components/primitives/spotlight"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type SocialProvider = {
  id: string
  label: string
  icon?: React.ReactNode
  onClick?: () => void
}

export type AuthFooter = {
  text: string
  linkLabel: string
  href: string
}

export type AuthAside = {
  title: string
  description?: string
  quote?: string
  quoteAuthor?: string
  imageSrc?: string
  imageAlt?: string
}

export type AuthProps = {
  mode?: "login" | "signup"
  title?: string
  subtitle?: string
  providers?: SocialProvider[]
  showRemember?: boolean
  termsLabel?: string
  termsHref?: string
  onSubmit?: (values: { name?: string; email: string; password: string }) => void | Promise<void>
  footer?: AuthFooter
  /** split = full-height two-column with promo aside; card = centered single card. */
  layout?: "card" | "split"
  aside?: AuthAside
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function ProviderButton({ provider, ink }: { provider: SocialProvider; ink?: boolean }) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={provider.onClick}
      className={cn("w-full", ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
    >
      {provider.icon}
      {provider.label}
    </Button>
  )
}

function AsidePanel({ aside }: { aside: AuthAside }) {
  return (
    <aside className="relative hidden overflow-hidden bg-foreground lg:flex lg:flex-col lg:justify-between">
      <Spotlight size={420} className="bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_80%)] blur-2xl" />
      {aside.imageSrc && (
        <img
          src={aside.imageSrc}
          alt={aside.imageAlt ?? ""}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
      )}
      <p className="relative z-10 p-10 font-mono text-[11px] font-bold uppercase tracking-widest text-background/50">
        {aside.title}
      </p>
      <div className="relative z-10 p-10">
        <TextEffect preset="blur" per="word" className="font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] text-background">
          {aside.description ?? aside.title}
        </TextEffect>
        {aside.quote && (
          <figure className="mt-8 border-l-2 border-background/25 pl-4">
            <blockquote className="text-sm font-medium leading-relaxed text-background/80">{aside.quote}</blockquote>
            {aside.quoteAuthor && <figcaption className="mt-2 text-xs font-semibold text-background/50">{aside.quoteAuthor}</figcaption>}
          </figure>
        )}
      </div>
    </aside>
  )
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function Auth({
  mode = "login",
  title,
  subtitle,
  providers = [],
  showRemember = true,
  termsLabel = "I agree to the terms of service and privacy policy.",
  termsHref = "#",
  onSubmit,
  footer,
  layout = "card",
  aside,
  className,
}: AuthProps) {
  const isSignup = mode === "signup"
  const [values, setValues] = React.useState({ name: "", email: "", password: "" })
  const [remember, setRemember] = React.useState(true)
  const [agreed, setAgreed] = React.useState(false)
  const [pending, setPending] = React.useState(false)

  const heading = title ?? (isSignup ? "Create your account" : "Welcome back")
  const subline = subtitle ?? (isSignup ? "Start building in minutes. No credit card required." : "Sign in to continue to your account.")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit) return
    setPending(true)
    try {
      await onSubmit(isSignup ? values : { email: values.email, password: values.password })
    } finally {
      setPending(false)
    }
  }

  const form = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {isSignup && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="auth-name">Name</Label>
          <Input
            id="auth-name"
            name="name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            required
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="auth-email">Email</Label>
        <Input
          id="auth-email"
          name="email"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="auth-password">Password</Label>
          {!isSignup && (
            <a href="#" className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Forgot password?
            </a>
          )}
        </div>
        <Input
          id="auth-password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete={isSignup ? "new-password" : "current-password"}
          required
          minLength={8}
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
        />
      </div>

      {isSignup && (
        <label className="flex items-start gap-2.5 text-xs font-medium leading-relaxed text-muted-foreground">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} className="mt-0.5" />
          <span>
            {termsLabel}{" "}
            <a href={termsHref} className="font-semibold text-foreground underline underline-offset-4">
              Learn more
            </a>
          </span>
        </label>
      )}

      {isSignup ? (
        <Button type="submit" size="lg" disabled={!agreed || pending} className="w-full">
          {pending ? "Creating account…" : "Create account"}
        </Button>
      ) : (
        <div className="flex items-center justify-between gap-4">
          {showRemember && (
            <label className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
              <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
              Remember me
            </label>
          )}
          <Button type="submit" disabled={pending} className="min-w-28">
            {pending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      )}

      {providers.length > 0 && (
        <div className="flex flex-col gap-5">
          <div className="relative flex items-center justify-center">
            <Separator className="absolute inset-x-0" />
            <span className="relative bg-card px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              or
            </span>
          </div>
          <div className={cn("grid gap-2", providers.length > 1 ? "sm:grid-cols-2" : "grid-cols-1")}>
            {providers.map((p) => (
              <ProviderButton key={p.id} provider={p} />
            ))}
          </div>
        </div>
      )}
    </form>
  )

  const inner = (
    <div className={cn("flex w-full flex-col", layout === "card" ? "items-center" : "items-start")}>
      <div className={cn("w-full", layout === "card" ? "max-w-[400px]" : "max-w-[440px] p-6 sm:p-10 lg:p-14")}>
        <TextEffect
          as="h1"
          preset="blur"
          per="char"
          delay={0.05}
          className="font-display text-3xl font-extrabold tracking-[-0.03em] text-foreground"
        >
          {heading}
        </TextEffect>
        <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{subline}</p>
        <div className={cn(layout === "card" && "mt-8 rounded-[24px] border bg-card p-6 shadow-sm sm:p-8")}>
          {form}
        </div>
        {footer && (
          <p className="mt-6 text-center text-sm font-medium text-muted-foreground">
            {footer.text}{" "}
            <a href={footer.href} className="font-semibold text-foreground underline-offset-4 hover:underline">
              {footer.linkLabel}
            </a>
          </p>
        )}
      </div>
    </div>
  )

  if (layout === "split") {
    return (
      <section className={cn("grid min-h-svh w-full lg:grid-cols-2", className)} aria-label={heading}>
        {inner}
        <AsidePanel aside={aside ?? { title: heading, description: subline }} />
      </section>
    )
  }

  return (
    <section className={cn("flex w-full justify-center px-4 py-16 sm:py-24", className)} aria-label={heading}>
      <Card className="border-none bg-transparent shadow-none">
        <CardContent className="p-0">{inner}</CardContent>
      </Card>
    </section>
  )
}
