import * as React from "react"
import { motion } from "motion/react"
import { Award } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"
import { Tilt } from "@/components/primitives/tilt"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB      display credentials as objects with weight
// ═══ EMOTION  earned shine — these were not bought
// ═══ SIGNATURE 3D-tilt metal badges with a sheen that sweeps on tilt;
//               issuer + year stamped in a ledger footer per badge
//   SITE      → awards walls, trust sections
//   APP       → cert/profile displays; badges are data
//   A11Y      badge content readable; tilt decorative

export type Badge = { title: string; issuer: string; year: string; metal: "gold" | "silver" | "bronze" }

export type BrandBadgeWallProps = {
  badges?: Badge[]
  className?: string
}

const METAL: Record<Badge["metal"], string> = {
  gold: "from-amber-200 via-amber-400 to-amber-600 text-amber-950",
  silver: "from-zinc-200 via-zinc-400 to-zinc-600 text-zinc-950",
  bronze: "from-orange-200 via-orange-400 to-orange-700 text-orange-950",
}

const DEFAULT_BADGES: Badge[] = [
  { title: "Design System of the Year", issuer: "Pixel Guild", year: "2025", metal: "gold" },
  { title: "ISO 27001 Certified", issuer: "Audit Bureau", year: "2024", metal: "silver" },
  { title: "Craft Supplier — Grade A", issuer: "Makers Union", year: "2026", metal: "bronze" },
]

export function BrandBadgeWall({ badges = DEFAULT_BADGES, className }: BrandBadgeWallProps) {
  return (
    <SectionShell width={920} className={className}>
      <MonoLabel className="text-muted-foreground">CREDENTIALS · EARNED</MonoLabel>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground sm:text-4xl">Stamped, sealed, verified.</h2>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {badges.map((b, i) => (
          <InView key={b.title} once delay={i * 0.08}>
            <Tilt rotationFactor={10} className="h-full">
              <figure className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border bg-card p-6 text-center">
                <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.35)_50%,transparent_60%)] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[110%]" />
                <span className={cn("grid size-20 place-items-center rounded-full bg-gradient-to-br shadow-inner ring-4 ring-background", METAL[b.metal])}>
                  <Award className="size-9" strokeWidth={2.2} aria-hidden />
                </span>
                <figcaption className="mt-5">
                  <span className="block font-display text-lg font-black leading-tight tracking-tight text-foreground">{b.title}</span>
                  <span className="mt-3 block border-t border-dashed border-border pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {b.issuer} · {b.year}
                  </span>
                </figcaption>
              </figure>
            </Tilt>
          </InView>
        ))}
      </div>
    </SectionShell>
  )
}
