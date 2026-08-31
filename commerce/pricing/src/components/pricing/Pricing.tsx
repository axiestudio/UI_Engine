import * as React from "react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Magnetic } from "@/components/primitives/magnetic"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type PricingFeature = { label: string; included?: boolean }

export type PricingPlan = {
  id?: string
  name: string
  description?: string
  /** Price per billing period. Numbers are formatted; strings render as-is. */
  priceMonthly?: number | string | null
  priceYearly?: number | string | null
  /** e.g. "per guest" — under the price. */
  priceNote?: string
  currency?: string
  billingPeriodLabel?: { monthly?: string; yearly?: string }
  cta: { label: string; href?: string; onClick?: () => void }
  features?: PricingFeature[]
  popular?: boolean
  footnote?: string
}

export type PricingProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  plans: PricingPlan[]
  /** Show the monthly/yearly switch. Default true when any plan has priceYearly. */
  toggleable?: boolean
  defaultYearly?: boolean
  /** Yearly discount label shown next to the switch, e.g. "Save 15%". */
  saveLabel?: string
  className?: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(p: number | string | null | undefined, currency = "kr") {
  if (p === null || p === undefined) return "—"
  if (typeof p === "string") return p
  return `${p.toLocaleString()} ${currency}`
}

function PlanCard({ plan, yearly, currency, periodLabel }: { plan: PricingPlan; yearly: boolean; currency: string; periodLabel: string }) {
  const price = yearly ? plan.priceYearly ?? plan.priceMonthly : plan.priceMonthly
  const Feature = ({ label, included = true }: PricingFeature) => (
    <li className={cn("flex items-start gap-2 text-sm font-medium", !included && "text-muted-foreground/60 line-through decoration-1")}>
      <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", !included && "opacity-30")} />
      <span>{label}</span>
    </li>
  )
  const cta = plan.cta.href ? (
    <Button asChild className="h-11 w-full rounded-full font-display text-sm font-semibold tracking-[-0.02em]" variant={plan.popular ? "default" : "outline"}>
      <a href={plan.cta.href} onClick={plan.cta.onClick}>{plan.cta.label}</a>
    </Button>
  ) : (
    <Button onClick={plan.cta.onClick} variant={plan.popular ? "default" : "outline"} className="h-11 w-full rounded-full font-display text-sm font-semibold tracking-[-0.02em]">
      {plan.cta.label}
    </Button>
  )
  return (
    <div
      id={plan.id}
      className={cn(
        "relative flex h-full scroll-mt-24 flex-col rounded-xl border p-6 shadow-sm transition-shadow hover:border-foreground/10 sm:p-7",
        plan.popular ? "border-foreground bg-card ring-1 ring-foreground" : "bg-card"
      )}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-foreground px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-background shadow">
          Most popular
        </span>
      )}
      <h3 className="font-display text-lg font-semibold tracking-[-0.02em]">{plan.name}</h3>
      {plan.description && <p className="mt-1 text-sm font-medium leading-relaxed text-muted-foreground">{plan.description}</p>}
      <p className="mt-6 flex items-baseline gap-2">
        <span className="font-display text-[38px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{formatPrice(price, currency)}</span>
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{periodLabel}</span>
      </p>
      {plan.priceNote && <p className="mt-1 text-xs font-medium text-muted-foreground">{plan.priceNote}</p>}
      {plan.features && plan.features.length > 0 && (
        <ul className="mt-6 flex flex-1 flex-col gap-2.5 border-t pt-6">
          {plan.features.map((f) => (
            <Feature key={f.label} {...f} />
          ))}
        </ul>
      )}
      <div className="mt-6 pt-1 sm:px-1">
        <Magnetic intensity={0.15} range={50}>
          {cta}
        </Magnetic>
      </div>
      {plan.footnote && <p className="mt-3 text-center text-[11px] font-medium text-muted-foreground">{plan.footnote}</p>}
    </div>
  )
}

// ── Pricing ──────────────────────────────────────────────────────────────────

export function Pricing({
  eyebrow = "Pricing",
  title = "Pricing plans",
  subtitle,
  plans,
  toggleable,
  defaultYearly = false,
  saveLabel = "Save 15%",
  currency,
  className,
}: PricingProps & { currency?: string }) {
  const showToggle = toggleable ?? plans.some((p) => p.priceYearly != null)
  const [yearly, setYearly] = React.useState(!!defaultYearly)
  if (!plans.length) return null
  const cur = currency ?? "kr"

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-labelledby="pricing-title">
      <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto w-full max-w-[1120px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{eyebrow}</p>}
            <h2 id="pricing-title" className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            {showToggle && (
              <div className="mt-7 inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2 shadow-xs" role="group" aria-label="Billing period">
                <span className={cn("text-xs font-bold uppercase tracking-[0.12em]", !yearly ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
                <Switch checked={yearly} onCheckedChange={(v) => setYearly(v)} aria-label={yearly ? "Switch to monthly billing" : "Switch to yearly billing"} />
                <span className={cn("text-xs font-bold uppercase tracking-[0.12em]", yearly ? "text-foreground" : "text-muted-foreground")}>Yearly</span>
                {saveLabel && yearly && <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold text-background">{saveLabel}</span>}
              </div>
            )}
          </header>

          <div className={cn("grid gap-5 sm:grid-cols-2", plans.length >= 3 && "lg:grid-cols-3")}>
            {plans.map((p, i) => (
              <InView
                key={p.id ?? p.name}
                as="div"
                variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.28), ease: [0.16, 1, 0.3, 1] }}
                viewOptions={{ once: true, margin: "-40px" }}
              >
                <div className="h-full">
                  <PlanCard plan={p} yearly={yearly} currency={cur} periodLabel={p.billingPeriodLabel?.[yearly ? "yearly" : "monthly"] ?? (yearly ? "/ year" : "/ 60 min")} />
                </div>
              </InView>
            ))}
          </div>
        </div>
      </InView>
    </section>
  )
}
