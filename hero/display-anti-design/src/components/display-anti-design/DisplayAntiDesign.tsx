import * as React from "react"
import { ArrowUpRight, ShoppingBag } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Grain } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type AntiNavItem = { label: string; href?: string }

export type DisplayAntiDesignProps = {
  brand?: string
  nav?: AntiNavItem[]
  cartLabel?: string
  titleA?: string
  titleB?: string
  pill?: string
  metaDate?: string
  metaLabel?: string
  drop?: string
  description?: React.ReactNode
  primaryCta?: { label: string; href?: string; onClick?: () => void }
  secondaryCta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export function DisplayAntiDesign({
  brand = "RIOT*",
  nav = [
    { label: "Shop" },
    { label: "Drops" },
    { label: "Stockists" },
    { label: "Manifesto" },
  ],
  cartLabel = "Cart (0)",
  titleA = "LOUD",
  titleB = "& UGLY",
  pill = "New drop",
  metaDate = "05.24",
  metaLabel = "Product shot",
  drop = "SS26 / The Anti-Collection",
  description = "Clothes that don’t ask permission. Made loud, sold direct, in editions of fifty. When they’re gone, they’re gone.",
  primaryCta = { label: "Shop the drop →" },
  secondaryCta = { label: "Get on the list" },
  className,
}: DisplayAntiDesignProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background text-foreground", className)}>
      {/* subtle noise */}
      <Grain opacity={0.035} />

      {/* top bar */}
      <header className="relative flex items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <span className="font-display text-[20px] font-black tracking-[-0.02em]">
          {brand}
        </span>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.label} href={n.href ?? "#"} className="font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2 font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground"
        >
          <ShoppingBag className="size-4" /> {cartLabel}
        </Button>
      </header>

      {/* oversized display */}
      <div className="relative px-3 pt-2 sm:px-6 lg:px-10">
        <InView variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
          <h1 className="flex flex-col font-display font-black leading-[0.8] tracking-[-0.03em]">
            <span
              className="select-none whitespace-nowrap text-[26vw] lg:text-[22vw]"
              style={{ color: "hsl(var(--anti-yellow))", textShadow: "0.02em 0.02em 0 hsl(var(--foreground))" }}
            >
              {titleA}
            </span>
            <span
              aria-label={titleB}
              className="select-none whitespace-nowrap text-[26vw] lg:text-[22vw] [color:transparent] [-webkit-text-stroke:2.5px_hsl(var(--foreground))]"
            >
              {titleB}
            </span>
          </h1>
        </InView>
      </div>

      {/* meta rail */}
      <div className="relative mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 px-5 sm:px-8 lg:px-12">
        <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-sans text-[12px] font-bold uppercase tracking-[0.06em] text-white" style={{ background: "hsl(var(--accent))" }}>
          {pill}
        </span>
        <span className="font-mono text-[13px] font-bold tracking-[0.02em]">{metaDate}</span>
        <span className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-foreground/60">{metaLabel}</span>
      </div>
      <span aria-hidden className="mt-4 block h-px w-full" style={{ background: "hsl(var(--border))" }} />

      {/* body + ctas */}
      <div className="relative grid gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:px-12">
        <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
          <div className="max-w-xl">
            <p className="font-sans text-[16px] font-semibold uppercase tracking-[-0.01em]">{drop}</p>
            <p className="mt-3 text-[17px] font-medium leading-[1.6] text-foreground/80">{description}</p>
          </div>
        </InView>
        <div className="flex flex-row flex-wrap items-start gap-3 lg:justify-end">
          {primaryCta && (
            <Button
              type="button"
              onClick={primaryCta.onClick}
              variant="outline"
              size="lg"
              className="h-12 border-2 border-ink px-6 font-sans text-[13px] font-bold uppercase tracking-[0.06em] hover:bg-foreground hover:text-background"
            >
              {primaryCta.label}
            </Button>
          )}
          {secondaryCta && (
            <a href={secondaryCta.href ?? "#"} className="inline-flex h-12 items-center gap-2 px-3 font-sans text-[13px] font-bold uppercase tracking-[0.06em] text-foreground/70 underline decoration-[2px] underline-offset-4 transition-colors hover:text-foreground">
              {secondaryCta.label} <ArrowUpRight className="size-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
