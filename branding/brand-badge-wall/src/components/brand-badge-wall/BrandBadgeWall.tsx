import * as React from "react"
import { Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// ═══ JOB      display credentials as objects with weight
// ═══ EMOTION  earned shine — these were not bought
// ═══ SIGNATURE monochrome struck-medallion cards that tilt under the cursor
//               while an engraved sheen sweeps over the metal; grade is
//               carried by ring engraving (gold = double bezel, bronze =
//               engine-turned edge), never cartoon gold gradients
//   SITE      → awards walls, trust sections
//   APP       → cert/profile displays; badges are data
//   BUILD     shadcn new-york-v4 Card/Badge/Separator + vendored Tilt
//              token markup SectionHead/Sheen/Dots
//   A11Y      badge content is real text; tilt/sheen are aria-hidden;
//             href-wrapped cards keep a visible focus ring

export type BadgeMetal = "gold" | "silver" | "bronze"

export type CredentialBadge = {
  title: string
  issuer: string
  year: string
  metal: BadgeMetal
  /** Certificate / serial number engraved in the ledger footer. */
  serial?: string
  href?: string
}

export type BrandBadgeWallProps = {
  badges?: CredentialBadge[]
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  className?: string
}

// metal is engraved, not coloured — every grade stays in the monochrome kit
const METAL_ENGRAVING: Record<BadgeMetal, string> = {
  gold: "[box-shadow:inset_0_0_0_1.5px_hsl(var(--background)/0.55),inset_0_0_0_4.5px_hsl(var(--background)/0.14),inset_0_0_0_6px_hsl(var(--background)/0.45)]",
  silver: "[box-shadow:inset_0_0_0_1.5px_hsl(var(--background)/0.5),inset_0_0_0_10px_hsl(var(--background)/0.07)]",
  bronze: "[box-shadow:inset_0_0_0_1px_hsl(var(--background)/0.45)] [background-image:repeating-conic-gradient(from_20deg,hsl(var(--background)/0.16)_0deg_6deg,transparent_6deg_12deg)]",
}

const METAL_LABEL: Record<BadgeMetal, string> = { gold: "Gold", silver: "Silver", bronze: "Bronze" }

const DEFAULT_BADGES: CredentialBadge[] = [
  { title: "Design System of the Year", issuer: "Pixel Guild", year: "2025", metal: "gold", serial: "PG-25-0114" },
  { title: "ISO 27001 Certified", issuer: "Audit Bureau", year: "2024", metal: "silver", serial: "AB-24-8802" },
  { title: "Craft Supplier — Grade A", issuer: "Makers Union", year: "2026", metal: "bronze", serial: "MU-26-341" },
]

function CredentialCard({ badge, index }: { badge: CredentialBadge; index: number }) {
  const card = (
    <Card className="group relative h-full overflow-hidden gap-5 py-6">
      <CardContent className="flex flex-col items-center gap-5 text-center">
        <span
          aria-hidden
          className={cn(
            "relative grid size-20 place-items-center rounded-full bg-foreground text-background shadow-[0_14px_26px_-14px_hsl(var(--foreground)/0.9)] ring-4 ring-background",
            METAL_ENGRAVING[badge.metal],
          )}
        >
          <Award className="size-9" strokeWidth={1.75} />
        </span>
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-lg font-black leading-tight tracking-tight text-foreground">{badge.title}</h3>
          <span>
            <Badge variant="outline" className="rounded-full border-primary/30 bg-transparent font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              {METAL_LABEL[badge.metal]} grade
            </Badge>
          </span>
        </div>
        <Separator className="w-2/3 border-dashed opacity-70" />
        <p className="font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.16em] text-muted-foreground">
          {badge.issuer} · {badge.year}
          {badge.serial ? <span className="text-foreground/40"> · {badge.serial}</span> : null}
        </p>
      </CardContent>
      {badge.href && (
        <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
          verify ↗
        </span>
      )}
    </Card>
  )

  const wrapped = badge.href ? (
    <a
      href={badge.href}
      aria-label={`${badge.title} — ${badge.issuer}, ${badge.year}. View credential.`}
      className="block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      {card}
    </a>
  ) : (
    card
  )

  return (
    <InView once delay={index * 0.08} className="h-full">
      <Tilt rotationFactor={8} className="h-full">
        {wrapped}
      </Tilt>
    </InView>
  )
}

export function BrandBadgeWall({
  badges = DEFAULT_BADGES,
  eyebrow = "CREDENTIALS · EARNED",
  title = "Stamped, sealed, verified.",
  subtitle = "Every mark on this wall was audited, struck, and dated — tilt one to catch the light.",
  className,
}: BrandBadgeWallProps) {
  return (
    <section className={cn("bg-background text-foreground", className)>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <header className="">
        {eyebrow != null && (          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>        )}
        <h2 className="mt-2 tracking-tight text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{title}</h2>
        {subtitle != null && (          <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>        )}
      </header>
      <div className="mt-12 grid place-items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b, i) => (
          <CredentialCard key={`${b.title}-${b.year}`} badge={b} index={i} />
        ))}
      </div>
      <p className="mt-10 border-t border-dashed pt-4 text-right font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {badges.length} credential{badges.length === 1 ? "" : "s"} on record · registry verified quarterly
      </p>
    </div>
    </section>
  )
}
