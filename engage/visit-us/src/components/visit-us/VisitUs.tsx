import * as React from "react"
import { Clock, Copy, Check, MapPin, Phone, Mail, ExternalLink, Navigation } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { ViewOnMap } from "@/components/watermelon/view-on-map"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type OpeningHour = {
  /** Day label as it should be displayed (any language — host provides copy). */
  day: string
  /** e.g. "09:00 – 18:00". Omitted/empty + closed → "Closed" styling. */
  hours?: string
  closed?: boolean
}

export type VisitUsProps = {
  /** Section heading. Default "Visit us". Pass "" to hide. */
  title?: string
  /** Small mono eyebrow above the title. Default "Location". */
  eyebrow?: string
  intro?: React.ReactNode
  /** Address lines shown in the info panel. */
  address: React.ReactNode[]
  /** Google Maps query for the embed — e.g. "Trädgårdsgatan 12, Jönköping". Defaults to the joined address. */
  mapQuery?: string
  /** Embed zoom level (Google `z` param). Default 16. */
  zoom?: number
  phone?: string
  phoneHref?: string
  email?: string
  hours?: OpeningHour[]
  /** Highlight today's row — index into `hours`. Default: computed from `Date()` (expects Monday-first, Swedish order override via prop). */
  todayIndex?: number
  /** Custom label for today badge. Default "Today". */
  todayLabel?: string
  /** "closed" label. Default "Closed". */
  closedLabel?: string
  /** Directions label. Default "Get directions". */
  directionsLabel?: string
  /** Copy tooltip/announced label. Default "Copy". */
  copyLabel?: string
  /** Decorative image behind the ViewOnMap pill. */
  mapImageUrl?: string
  /** Show the Watermelon ViewOnMap expanding pill in the map corner. Default true. */
  showViewOnMap?: boolean
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function embedUrl(query: string, zoom = 16) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
}

function directionsUrl(query: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

function defaultTodayIndex() {
  const jsDay = new Date().getDay() // 0 = Sunday
  return (jsDay + 6) % 7 // Monday-first index
}

// ── Sub components ───────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, children, href }: { icon: React.ElementType; label: string; children: React.ReactNode; href?: string }) {
  const inner = (
    <>
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-card shadow-xs transition-colors group-hover:bg-accent">
        <Icon className="h-4 w-4 stroke-[2.2]" />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="mt-1 block text-sm font-semibold leading-snug">{children}</span>
      </span>
    </>
  )
  return href ? (
    <a href={href} className="group flex items-start gap-3 rounded-xl p-2 -m-2 transition-colors hover:bg-accent/50">
      {inner}
    </a>
  ) : (
    <div className="group flex items-start gap-3 p-2 -m-2">{inner}</div>
  )
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`${label} ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setCopied(true)
          timer.current = window.setTimeout(() => setCopied(false), 1600)
        } catch {
          /* clipboard unavailable — button is still announced */
        }
      }}
      className="size-6 shrink-0 rounded-md text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

// ── VisitUs ──────────────────────────────────────────────────────────────────

export function VisitUs({
  title = "Visit us",
  eyebrow = "Location",
  intro,
  address,
  mapQuery,
  zoom = 16,
  phone,
  phoneHref,
  email,
  hours,
  todayIndex,
  todayLabel = "Today",
  closedLabel = "Closed",
  directionsLabel = "Get directions",
  copyLabel = "Copy",
  mapImageUrl,
  showViewOnMap = true,
  className,
}: VisitUsProps) {
  const query = mapQuery ?? address.filter((a) => typeof a === "string").join(", ")
  const plainAddress = Array.isArray(address) ? address.join(" ") : String(address)
  const today = todayIndex !== undefined ? todayIndex : defaultTodayIndex()

  return (
    <section className={cn("w-full bg-background", className)} aria-labelledby={title ? "visit-us-title" : undefined}>
      <InView
        variants={{
          hidden: { opacity: 0, y: 16 },
          visible: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        viewOptions={{ once: true, margin: "-80px" }}
      >
        <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8">
          {title && (
            <header className="mb-8 max-w-2xl">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
              <h2 id="visit-us-title" className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                {title}
              </h2>
              {intro && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{intro}</p>}
            </header>
          )}

          {/* 2:1 grid — map spans 2 columns on desktop, stacks mobile-first */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="relative min-h-[320px] overflow-hidden rounded-xl border bg-muted shadow-sm ring-1 ring-border/60 lg:col-span-2 lg:min-h-0">
              <iframe
                title={`Map showing ${plainAddress || query}`}
                src={embedUrl(query, zoom)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0 brightness-[1.02] contrast-[1.05] grayscale-[0.9] saturate-[0.8]"
              />
              {showViewOnMap && (
                <div className="absolute bottom-4 left-4 z-10">
                  <ViewOnMap address={plainAddress || query} mapImageUrl={mapImageUrl} />
                </div>
              )}
            </div>

            {/* Info rail */}
            <div className="flex flex-col gap-1 rounded-xl border bg-card p-5 shadow-sm">
              <InfoRow icon={MapPin} label="Address">
                <address className="not-italic">
                  {address.map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </address>
                <span className="mt-1 flex items-center gap-1">
                  <CopyButton value={plainAddress} label={copyLabel} />
                </span>
              </InfoRow>

              {phone && (
                <div className="mt-3 flex items-start justify-between gap-2">
                  <InfoRow icon={Phone} label="Phone" href={phoneHref ?? `tel:${phone.replace(/\s+/g, "")}`}>
                    {phone}
                  </InfoRow>
                  <CopyButton value={phone} label={copyLabel} />
                </div>
              )}

              {email && (
                <div className={cn("flex items-start justify-between gap-2", !phone && "mt-3")}>
                  <InfoRow icon={Mail} label="Email" href={`mailto:${email}`}>
                    <span className="break-all">{email}</span>
                  </InfoRow>
                  <CopyButton value={email} label={copyLabel} />
                </div>
              )}

              {hours && hours.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <Clock className="h-3 w-3" /> Hours
                  </p>
                  <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[220px] text-sm">
                    <tbody>
                      {hours.map((h, i) => (
                        <tr key={h.day} className={cn("align-top", i === today && "font-extrabold")}>
                          <td className="py-1 pr-2 font-semibold">
                            {h.day}
                            {i === today && (
                              <span className="ml-2 rounded-full bg-foreground px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-background">
                                {todayLabel}
                              </span>
                            )}
                          </td>
                          <td className={cn("py-1 text-right font-mono text-xs font-semibold", h.closed && "text-muted-foreground")}>
                            {h.closed ? closedLabel : h.hours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}

              <Button asChild className="mt-6 h-11 w-full rounded-full font-display text-sm font-extrabold tracking-tight">
                <a href={directionsUrl(query)} target="_blank" rel="noopener noreferrer">
                  <Navigation className="mr-1.5 h-4 w-4" />
                  {directionsLabel}
                  <ExternalLink className="ml-1.5 h-3 w-3 opacity-60" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
