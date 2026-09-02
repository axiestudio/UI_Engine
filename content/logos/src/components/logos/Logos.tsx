import * as React from "react"
import { InfiniteSlider } from "@/components/primitives/infinite-slider"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type Logo = {
  name: string
  /** Image URL (prefer SVG or PNG @2x). */
  src?: string
  /** Or a react icon (lucide / inline SVG). */
  icon?: React.ElementType
  href?: string
}

export type LogosProps = {
  /** Small caption above the strip, e.g. "Trusted by teams at". */
  label?: string
  logos?: Logo[]
  /** "marquee" — InfiniteSlider loop. "wall" — static bordered grid. Default "marquee". */
  variant?: "marquee" | "wall"
  /** Marquee px/s. Default 40. */
  speed?: number
  reverse?: boolean
  columns?: 2 | 3 | 4
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function LogoItem({ logo, muted = true }: { logo: Logo; muted?: boolean }) {
  const inner = logo.icon ? (
    <logo.icon className="h-6 w-6 shrink-0" />
  ) : logo.src ? (
    <img src={logo.src} alt={logo.name} loading="lazy" className="h-6 w-auto max-w-[130px] shrink-0 object-contain" />
  ) : (
    <span className="font-display text-base font-bold tracking-tight">{logo.name}</span>
  )
  const content = (
    <span className="flex items-center justify-center gap-2 text-foreground/70 transition-all duration-300 group-hover:text-foreground">{inner}</span>
  )
  return logo.href ? (
    <a href={logo.href} className={cn("group flex items-center justify-center px-6 py-3", muted && "opacity-80 hover:opacity-100")} aria-label={logo.name}>
      {content}
    </a>
  ) : (
    <span className={cn("group flex items-center justify-center px-6 py-3", muted && "opacity-80 hover:opacity-100")} aria-label={logo.name}>
      {content}
    </span>
  )
}

// ── Logos ────────────────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_LOGOS_LOGOS = [{ name: "Jönköping Nu" }, { name: "Health Weekly" }, { name: "The Table Review" }, { name: "Nordic Wellness" }, { name: "City Guide" }, { name: "Press Club" }]

export function Logos({ label, logos = DEMO_LOGOS_LOGOS, variant = "marquee", speed = 40, reverse = false, columns = 4, className }: LogosProps) {
  if (!logos.length) return null

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={label ?? "Partners and mentions"}>
      <InView variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} transition={{ duration: 0.5 }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[1280px] px-4 py-12 sm:px-6 lg:px-8">
          {label && <p className="mb-6 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>}

          {variant === "marquee" && (
            <div className="relative">
              <InfiniteSlider gap={12} speed={speed} reverse={reverse} className={cn("border-y", "before:absolute before:inset-y-0 before:left-0 before:w-12 before:bg-gradient-to-r before:from-background before:to-transparent before:content-[''] before:pointer-events-none", "after:absolute after:inset-y-0 after:right-0 after:w-12 after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] after:pointer-events-none")}>
                {logos.map((l, i) => (
                  <LogoItem key={`${l.name}-${i}`} logo={l} />
                ))}
              </InfiniteSlider>
            </div>
          )}

          {variant === "wall" && (
            <div className="grid auto-rows-[1fr] gap-px overflow-hidden rounded-[20px] border bg-border" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {logos.map((l, i) => (
                <div key={`${l.name}-${i}`} className="bg-background">
                  <LogoItem logo={l} muted={false} />
                </div>
              ))}
            </div>
          )}
        </div>
      </InView>
    </section>
  )
}
