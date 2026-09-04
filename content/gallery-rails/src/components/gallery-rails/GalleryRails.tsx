import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Noise from "@/components/primitives/noise"
import { Button } from "@/components/ui/button"


// ═══ JOB      show work like a curated wall, not an image dump
// ═══ EMOTION  gallery hush; each piece was hung there deliberately
// ═══ SIGNATURE works drop in on a barely-held wire (pendulum settle 4°→0),
//               every piece gets one engraved plate, the wall keeps rails
//   SITE     → studio/portfolio/interior work section
//   APP      → curated asset wall with select states (item.onSelect)
//   A11Y     img alt from title; wire motion aria-hidden; keyboard: plates
//            readable, buttons real when onSelect passed; reduced = fade only

export type RailWork = { img?: string; title: string; year?: string; note?: string; href?: string; span?: "wide" | "tall" }

export type GalleryRailsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  works: RailWork[]
  onSelect?: (work: RailWork) => void
  className?: string
}

export function GalleryRails({ eyebrow = "THE WALL", title, subtitle, works, onSelect, className }: GalleryRailsProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--wall))] px-4 py-20 sm:px-6 lg:px-8", className)}>
      {/* picture rails running the wall */}
      <span aria-hidden className="absolute inset-x-0 top-[18vh] hidden h-[3px] bg-[hsl(var(--wall-deep))] shadow-[0_10px_0_hsl(var(--wall-deep)_/0.6),0_20px_0_hsl(var(--wall-deep)_/0.4),0_30px_0_hsl(var(--wall-deep)_/0.25)] lg:block" />
      <div className="relative mx-auto w-full max-w-[1120px]">
        <div className="mb-10 max-w-xl text-[hsl(var(--plate-ink))]">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "opacity-60")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          {title && <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-[40px]">{title}</h2>}
          {subtitle && <p className="mt-3 text-[15px] font-medium leading-relaxed opacity-70">{subtitle}</p>}
        </div>

        <ul className="grid grid-cols-1 gap-x-6 gap-y-10 overflow-x-auto sm:grid-cols-2 lg:grid-cols-3">
          {works.map((w, i) => (
            <li key={w.title + i} className={cn(w.span === "wide" && "col-span-2")}>
              <motion.figure
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: (i % 2 ? 1 : -1) * 4, y: -14 }}
                whileInView={{ opacity: 1, rotate: 0, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top center" }}
                className="group relative"
              >
                <div className="relative overflow-hidden border border-border bg-card shadow-[0_14px_28px_-18px_hsl(var(--foreground)/0.45)] transition-transform duration-500 group-hover:-translate-y-1">
                  {w.img ? (
                    <img src={w.img} alt={w.title} loading="lazy" className={cn("w-full object-cover", w.span === "tall" ? "aspect-[3/4]" : "aspect-[4/3]")} />
                  ) : (
                    <div className={cn("w-full bg-[hsl(var(--wall-deep))]", w.span === "tall" ? "aspect-[3/4]" : "aspect-[4/3]")} />
                  )}
                  {onSelect ? (
                    <Button type='button' onClick={() => onSelect(w)} aria-label={`Open ${w.title}`} className="size-full absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[hsl(var(--plate))]" size="icon" variant="default"></Button>
                  ) : w.href ? (
                    <a href={w.href} className="absolute inset-0" aria-label={w.title} />
                  ) : null}
                  <span aria-hidden className={cn("pointer-events-none absolute inset-0", "text-foreground/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100")}>
    <span className="absolute border-current top-[5px] left-[5px] border-t border-l" style={{ width: 9, height: 9 }} />
    <span className="absolute border-current top-[5px] right-[5px] border-t border-r" style={{ width: 9, height: 9 }} />
    <span className="absolute border-current bottom-[5px] left-[5px] border-b border-l" style={{ width: 9, height: 9 }} />
    <span className="absolute border-current bottom-[5px] right-[5px] border-b border-r" style={{ width: 9, height: 9 }} />
  </span>
                  <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><Noise patternAlpha={Math.round((0.04) * 255)} patternSize={240} patternRefreshInterval={3} /></span>
                </div>
                {/* engraved plate */}
                <figcaption className="mx-auto mt-3 w-fit min-w-[120px] max-w-full rounded-[2px] border border-black/15 bg-gradient-to-b from-[hsl(var(--plate))] to-[hsl(var(--plate)/0.75)] px-3 py-1.5 text-center shadow-sm">
                  <span className="block truncate font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--plate-ink))]">{w.title}</span>
                  {(w.year || w.note) && <span className="mt-0.5 block font-serif text-[10px] italic text-[hsl(var(--plate-ink))/0.75]">{[w.year, w.note].filter(Boolean).join(" · ")}</span>}
                </figcaption>
              </motion.figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
