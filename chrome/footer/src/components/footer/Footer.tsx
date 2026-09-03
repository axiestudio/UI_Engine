import * as React from "react"
import { useScroll, useMotionValueEvent } from "motion/react"
import { ArrowUp, Check, Loader2, Lock } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { Magnetic } from "@/components/primitives/magnetic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
// Link/LinkGroup shapes follow the vendored Watermelon `footer-1` registry item.
export type FooterLink = {
  label: string
  href: string
  badge?: string
}

export type FooterColumn = {
  title: string
  links: FooterLink[]
}

export type FooterSocial = {
  label: string
  href: string
  icon: React.ElementType
}

export type FooterInfo = {
  title: string
  lines: React.ReactNode[]
}

export type FooterNewsletter = {
  title?: string
  description?: string
  placeholder?: string
  buttonLabel?: string
  successMessage?: string
  /** Async subscribe handler. No handler → the form renders locked (no fake success). */
  onSubmit?: (email: string) => Promise<void> | void
}

export type FooterProps = {
  brandName?: string
  tagline?: string
  /** Custom logo node. Falls back to an initials mark built from `brandName`. */
  logo?: React.ReactNode
  columns?: FooterColumn[]
  info?: FooterInfo
  socials?: FooterSocial[]
  newsletter?: FooterNewsletter
  legal?: {
    year?: number
    notice?: string
    links?: FooterLink[]
  }
  /** Floating scroll-to-top button (page-level control — render the footer once per page). */
  showScrollTop?: boolean
  /** Shimmer the newsletter heading while idle. Default true. */
  shimmerHeading?: boolean
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function BrandMark({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  return (
    <span className="relative isolate overflow-hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-foreground font-mono text-sm font-black text-background shadow-sm">
      {initials}
    </span>
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function NewsletterForm({ config }: { config: Required<Pick<FooterNewsletter, "title" | "description" | "placeholder" | "buttonLabel" | "successMessage">> & FooterNewsletter }) {
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<"idle" | "submitting" | "done" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)
  const disabled = !config.onSubmit

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!config.onSubmit) return
    if (!EMAIL_RE.test(email)) {
      setStatus("error")
      setError("Please enter a valid email address.")
      return
    }
    setError(null)
    setStatus("submitting")
    try {
      await config.onSubmit(email)
      setStatus("done")
    } catch {
      setStatus("error")
      setError("Something went wrong. Please try again.")
    }
  }

  if (status === "done") {
    return (
      <div role="status" className="flex h-[42px] items-center gap-2 text-sm font-semibold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
          <Check className="h-3.5 w-3.5 stroke-[3]" />
        </span>
        {config.successMessage}
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <div className="flex max-w-sm items-center gap-2">
        <Input
          type="email"
          autoComplete="email"
          placeholder={config.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === "error") setStatus("idle")
          }}
          aria-invalid={status === "error"}
          aria-describedby={status === "error" ? "footer-newsletter-error" : undefined}
          disabled={disabled}
          className="h-[42px] bg-muted/50 shadow-none"
        />
        <Button type="submit" size="sm" disabled={disabled || status === "submitting"} className="h-[42px] shrink-0 rounded-lg px-5 font-display text-sm font-extrabold tracking-tight">
          {disabled ? (
            <>
              <Lock className="mr-1.5 h-3.5 w-3.5" />
              {config.buttonLabel}
            </>
          ) : status === "submitting" ? (
            <>
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              Joining…
            </>
          ) : (
            config.buttonLabel
          )}
        </Button>
      </div>
      {status === "error" && error && (
        <p id="footer-newsletter-error" role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
      {disabled && (
        <p className="text-xs font-medium text-muted-foreground">Wire the `onSubmit` prop to enable subscriptions.</p>
      )}
    </form>
  )
}

function ScrollTop() {
  const [show, setShow] = React.useState(false)
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 480))
  if (!show) return null
  return (
    <Magnetic intensity={0.4} range={60}>
      <Button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Scroll back to top"
        className="absolute bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border bg-background text-foreground shadow-lg transition-colors hover:bg-accent"
      >
        <ArrowUp className="h-4 w-4 stroke-[2.5]" />
      </Button>
    </Magnetic>
  )
}

// ── Footer ───────────────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_FOOTER_BRANDNAME = "Engine"

export function Footer({
  brandName = DEMO_FOOTER_BRANDNAME,
  tagline,
  logo,
  columns = [],
  info,
  socials = [],
  newsletter,
  legal,
  showScrollTop = false,
  shimmerHeading = true,
  className,
}: FooterProps) {
  const year = legal?.year ?? new Date().getFullYear()
  const notice = legal?.notice ?? `© ${year} ${brandName}. All rights reserved.`

  const newsletterConfig = newsletter
    ? {
        title: newsletter.title ?? "Stay in the loop",
        description: newsletter.description ?? "",
        placeholder: newsletter.placeholder ?? "Enter your email",
        buttonLabel: newsletter.buttonLabel ?? "Subscribe",
        successMessage: newsletter.successMessage ?? "You're on the list. Talk soon.",
        onSubmit: newsletter.onSubmit,
      }
    : null

  return (
    <footer className={cn("w-full border-t bg-background text-foreground", className)}>
      <InView
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        viewOptions={{ once: true, margin: "-80px" }}
        as="div"
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
            {/* Brand + newsletter */}
            <div className="space-y-7">
              <div className="flex items-center gap-2.5">
                {logo ?? <BrandMark name={brandName} />}
                <span className="font-display text-[17px] font-extrabold tracking-[-0.03em]">{brandName}</span>
              </div>
              {tagline && <p className="max-w-xs text-sm font-medium leading-relaxed text-muted-foreground">{tagline}</p>}

              {newsletterConfig && (
                <div className="max-w-[18rem] space-y-2 sm:max-w-sm">
                  {shimmerHeading ? (
                    <TextShimmer as="h3" duration={2.4} spread={4} className="text-left font-display text-sm font-bold tracking-tight text-foreground">
                      {newsletterConfig.title}
                    </TextShimmer>
                  ) : (
                    <h3 className="font-display text-sm font-bold tracking-tight">{newsletterConfig.title}</h3>
                  )}
                  <NewsletterForm config={newsletterConfig} />
                  {newsletterConfig.description && (
                    <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{newsletterConfig.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Link columns + info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
              {columns.map((group) => (
                <div key={group.title} role="group" aria-labelledby={`footer-col-${group.title}`}>
                  <h4 id={`footer-col-${group.title}`} className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {group.title}
                  </h4>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground"
                        >
                          {link.label}
                          {link.badge && (
                            <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-black leading-none text-background">
                              {link.badge}
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {info && (
                <div role="group" aria-labelledby={`footer-info-${info.title}`} className="col-span-2 sm:col-span-1">
                  <h4 id={`footer-info-${info.title}`} className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    {info.title}
                  </h4>
                  <div className="mt-4 flex flex-col gap-2.5 text-sm font-medium text-foreground/80">
                    {info.lines.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col-reverse items-start gap-6 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <p className="text-xs font-medium text-muted-foreground">{notice}</p>
              {legal?.links?.map((link) => (
                <a key={link.label} href={link.href} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </a>
              ))}
            </div>

            {socials.length > 0 && (
              <div className="flex items-center gap-1">
                {socials.map((social) => {
                  const Icon = social.icon
                  return (
                    <Magnetic key={social.label} intensity={0.3} range={40}>
                      <a
                        href={social.href}
                        aria-label={social.label}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground"
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </a>
                    </Magnetic>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </InView>

      {showScrollTop && <ScrollTop />}
    </footer>
  )
}
