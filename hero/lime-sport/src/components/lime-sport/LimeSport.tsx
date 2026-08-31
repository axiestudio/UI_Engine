import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight, ArrowDownRight, ChevronRight, Activity, Users } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type LimeNavItem = { label: string; href?: string }
export type LimeStat = { label: string; value: string; delta?: { dir: "up" | "down"; text: string }; sub?: string; icon?: React.ElementType }

export type LimeSportProps = {
  brand?: string
  nav?: LimeNavItem[]
  joinLabel?: string
  tagline?: string
  lineA?: string
  lineB?: string
  intro?: React.ReactNode
  primaryCta?: { label: string; href?: string; onClick?: () => void }
  secondaryCta?: { label: string; href?: string; onClick?: () => void }
  stats?: LimeStat[]
  ticker?: string[]
  className?: string
}

export function LimeSport({
  brand = "PACE//FORM",
  nav = [
    { label: "Train" },
    { label: "Compete" },
    { label: "Gear" },
    { label: "Crew" },
  ],
  joinLabel = "Join →",
  tagline = "Fast",
  lineA = "RUN HARDER.",
  lineB = "RUN SMARTER.",
  intro = "A training club for runners who track everything and look at none of it. We do the data. You do the miles.",
  primaryCta = { label: "Start 30-day plan →" },
  secondaryCta = { label: "How it works" },
  stats = [
    { label: "Avg pace · this week", value: "5:42", delta: { dir: "up", text: "0:14 vs last wk" }, icon: Activity },
    { label: "Active members", value: "48,210", sub: "in 124 cities", icon: Users },
  ],
  ticker = [
    "Tokyo 24°C — 12 runners out",
    "Berlin Marathon · 142 days",
    "NEW PR · M. Okafor · 18:22 5K",
    "Weekly club · Tue 6:30pm",
  ],
  className,
}: LimeSportProps) {
  const lime = "hsl(var(--lime))"
  const ink = "hsl(var(--sport-ink))"
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background", className)}>
      {/* top bar */}
      <header className="relative flex items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <span className="font-display text-[13px] font-black uppercase tracking-[0.14em]" style={{ color: lime }}>
            {tagline}
          </span>
          <span className="font-display text-[20px] font-black tracking-[-0.03em] text-foreground">{brand}</span>
        </div>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <a key={n.label} href={n.href ?? "#"} className="font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/70 transition-colors hover:text-foreground">
              {n.label}
            </a>
          ))}
        </nav>
        <button type="button" className="font-sans text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: lime }}>
          {joinLabel}
        </button>
      </header>

      {/* huge display */}
      <div className="relative px-3 pt-4 sm:px-6 lg:px-10" style={{ background: lime }}>
        <InView variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
          <h1 className="select-none font-display text-[19vw] font-black leading-[0.82] tracking-[-0.03em] lg:text-[15vw]" style={{ color: ink }}>
            <span className="block">{lineA}</span>
            <span className="block" style={{ color: "hsl(var(--background))" }}>{lineB}</span>
          </h1>
        </InView>
      </div>

      {/* intro rail */}
      <div className="relative grid gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-12">
        <div>
          <p className="max-w-xl text-[30px] font-semibold uppercase leading-[1.06] tracking-[-0.02em] sm:text-[40px]">
            <span style={{ color: lime }}>{lineA}</span> <span className="text-foreground">{lineB}</span>
          </p>
          <p className="mt-4 max-w-md text-[15.5px] font-medium leading-[1.6] text-foreground/70">{intro}</p>
        </div>
        <div className="flex flex-row flex-wrap items-center gap-3 lg:justify-end">
          {primaryCta && (
            <button
              type="button"
              onClick={primaryCta.onClick}
              className="inline-flex h-12 items-center gap-2 border-2 px-6 font-sans text-[13px] font-bold uppercase tracking-[0.06em] transition-colors"
              style={{ color: ink, background: lime, borderColor: lime }}
            >
              {primaryCta.label}
            </button>
          )}
          {secondaryCta && (
            <a href={secondaryCta.href ?? "#"} className="inline-flex h-12 items-center gap-2 px-3 font-sans text-[13px] font-bold uppercase tracking-[0.06em] text-foreground/80 underline decoration-2 underline-offset-4">
              {secondaryCta.label} <ChevronRight className="size-4" />
            </a>
          )}
        </div>
      </div>

      {/* stat widgets */}
      <div className="relative grid gap-px border-y px-5 sm:grid-cols-2 sm:px-8 lg:px-12" style={{ background: "hsl(var(--muted))" }}>
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <InView key={s.label} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-40px" }}>
              <div className="flex flex-col gap-3 p-6" style={{ background: "hsl(var(--card))" }}>
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/60">
                  {Icon && <Icon className="size-4" style={{ color: lime }} />}
                  {s.label}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <span className="font-display text-[56px] font-black leading-none tracking-[-0.02em] text-foreground">{s.value}</span>
                  {s.delta && (
                    <span className="inline-flex items-center gap-1 text-[15px] font-medium" style={{ color: s.delta.dir === "up" ? lime : "hsl(var(--foreground)/0.7)" }}>
                      {s.delta.dir === "up" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                      {s.delta.text}
                    </span>
                  )}
                </div>
                {s.sub && <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/50">{s.sub}</span>}
              </div>
            </InView>
          )
        })}
      </div>

      {/* marquee ticker */}
      <div className="relative overflow-hidden border-t py-3" style={{ background: lime }}>
        <motion.div
          className="flex w-max items-center gap-8 whitespace-nowrap pr-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          aria-hidden
        >
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 font-sans text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: ink }}>
              <span aria-hidden className="text-[10px]">◆</span>
              {t}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
