import { CalendarCheck, Clock, ShieldCheck, Star } from "lucide-react"
import * as React from "react"
import { Spotlight } from "@/components/primitives/spotlight"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type BentoCell = {
  id?: string
  title?: string
  description?: string
  /** Icon slot (lucide component) rendered as a chip above the title. */
  icon?: React.ElementType
  /** Grid span on sm+ and lg. Default 1. */
  span?: { sm?: 1 | 2; lg?: 1 | 2 | 3 }
  /** Image fills the cell (cover); text overlays it. */
  image?: string
  imageAlt?: string
  /** Ink renders the cell with a dark background — same tokens as everything else. */
  tone?: "paper" | "ink"
  /** Free slot for embeds, counters, mini maps, anything. */
  content?: React.ReactNode
  className?: string
}

export type BentoProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  cells?: BentoCell[]
  /** Cursor spotlight per non-image cell. Default true. */
  spotlight?: boolean
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

function Cell({ c, glow }: { c: BentoCell; glow: boolean }) {
  const ink = c.tone === "ink"
  const Icon = c.icon

  const body = c.image ? (
    <div className="relative flex h-full min-h-[240px] w-full flex-col justify-end overflow-hidden rounded-[inherit]">
      <img src={c.image} alt={c.imageAlt ?? ""} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="relative p-6 text-white">
        {c.title && <h3 className="font-display text-lg font-bold leading-snug tracking-tight">{c.title}</h3>}
        {c.description && <p className="mt-1 text-sm font-medium text-white/85">{c.description}</p>}
      </div>
    </div>
  ) : (
    <div className={cn("flex h-full min-h-[170px] flex-col rounded-[inherit] p-6", ink ? "bg-foreground text-background" : "bg-card")}>
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", ink ? "border-background/20 bg-background/10" : "bg-background shadow-xs")}>
        {Icon && <Icon className="h-5 w-5 stroke-[2]" />}
      </span>
      {c.title && <h3 className="mt-4 font-display text-[17px] font-bold leading-snug tracking-tight">{c.title}</h3>}
      {c.description && <p className={cn("mt-1.5 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>{c.description}</p>}
      {c.content && <div className="mt-auto pt-4">{c.content}</div>}
    </div>
  )

  const shell = (
    <div id={c.id} className={cn("relative h-full overflow-hidden rounded-[24px] border shadow-sm transition-shadow hover:shadow-md", c.className)}>
      {glow && !c.image && <Spotlight size={380} />}
      {body}
    </div>
  )
  return shell
}


// ── Bento ────────────────────────────────────────────────────────────────────


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_BENTO_CELLS: BentoCell[] = [ { id: "studio", image: "/showcase/hero-poster.webp", title: "The studio", description: "Two quiet rooms, evening light.", span: { sm: 2, lg: 2 } }, { title: "Certified staff", description: "Every therapist, licensed and listed.", icon: ShieldCheck }, { title: "Late openings", description: "Book until 21:00 on weekdays.", icon: Clock }, { title: "25 years", description: "Same door since 2001.", tone: "ink", icon: Star }, { title: "Real-time booking", description: "Live availability from the front desk system.", icon: CalendarCheck, span: { lg: 2 } }, ]

export function Bento({ eyebrow, title, subtitle, cells = DEMO_BENTO_CELLS, spotlight = true, className }: BentoProps) {
  if (!cells.length) return null
  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label={title ?? "Highlights"}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {(title || eyebrow) && (
          <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
            <header className="mb-10 max-w-2xl">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              {title && <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>}
              {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            </header>
          </InView>
        )}
        <div className="grid auto-rows-[170px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cells.map((c, i) => (
            <InView
              key={c.id ?? c.title ?? i}
              as="div"
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-40px" }}
              className={cn(
                "h-full",
                c.image && "row-span-2",
                c.span?.sm === 2 && "sm:col-span-2",
                c.span?.lg === 2 && "lg:col-span-2",
                c.span?.lg === 3 && "lg:col-span-3"
              )}
            >
              <Cell c={c} glow={spotlight && !c.image} />
            </InView>
          ))}
        </div>
      </div>
    </section>
  )
}
