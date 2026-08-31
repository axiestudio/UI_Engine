import * as React from "react"
import gsap from "gsap"
import { Flip } from "gsap/Flip"
import { cn } from "@/lib/utils"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(Flip)

// ═══ JOB         Let the work reorganize itself without a single jump-cut.
// ═══ EMOTION     A gallery wall being re-hung by invisible hands.
// ═══ SIGNATURE   Filter chips re-deal the grid with the GSAP Flip plugin —
//                 staying pieces glide to their new seats, leaving pieces
//                 fold away, entering pieces unfold. State changes, motion
//                 stays continuous.

export type FlipWork = { id: string; title: string; kind: string; src?: string }

export type GsapFlipGridProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  works?: FlipWork[]
  filters?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const FALLBACK: FlipWork[] = [
  { id: "w1", title: "North light study", kind: "Interiors", src: "/showcase/gallery-01.webp" },
  { id: "w2", title: "Chair 03, honest", kind: "Objects", src: "/showcase/gallery-02.webp" },
  { id: "w3", title: "Ledger specimen", kind: "Print", src: "/showcase/gallery-03.webp" },
  { id: "w4", title: "The workshop row", kind: "Interiors", src: "/showcase/gallery-04.webp" },
  { id: "w5", title: "Tool silhouettes", kind: "Objects", src: "/showcase/gallery-05.webp" },
  { id: "w6", title: "Volumetric quiet", kind: "Print", src: "/showcase/gallery-06.webp" },
]

export function GsapFlipGrid({
  eyebrow = "GSAP · FLIP GRID",
  title = "Re-hung while you watch.",
  subtitle = "Filter the wall — Flip records every card's seat, the DOM re-deals, and the plugin glides survivors to their new spots while the rest fold in or out.",
  works = FALLBACK,
  filters = ["All", "Interiors", "Objects", "Print"],
  caption = "FLIP PLUGIN · LAYOUT AS CHOREOGRAPHY",
  tone = "paper",
  className,
}: GsapFlipGridProps) {
  const ink = tone === "ink"
  const gridRef = React.useRef<HTMLDivElement>(null)
  const [filter, setFilter] = React.useState("All")
  const shown = works.filter((w) => filter === "All" || w.kind === filter)

  const applyFilter = (next: string) => {
    if (next === filter || !gridRef.current) return
    const state = Flip.getState(gridRef.current.children)
    setFilter(next)
    requestAnimationFrame(() => {
      Flip.from(state, {
        duration: 0.55,
        ease: "power2.inOut",
        absolute: true,
        stagger: 0.02,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.3, ease: "power2.in" }),
      })
    })
  }

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        {/* filter chips */}
        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter the wall">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => applyFilter(f)}
              className={cn(
                "h-9 rounded-full border px-4 font-mono text-[11px] font-bold uppercase tracking-[0.12em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                filter === f
                  ? "border-foreground bg-foreground text-background"
                  : ink
                    ? "border-background/25 text-background/60 hover:border-background/50"
                    : "border-border text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* the wall */}
        <div ref={gridRef} className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((w) => (
            <figure
              key={w.id}
              className={cn(
                "group relative overflow-hidden rounded-[16px] border bg-card",
                ink ? "border-background/15" : "border-border",
              )}
            >
              {w.src ? (
                <img src={w.src} alt={w.title} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              ) : (
                <div className="aspect-[4/3] w-full bg-muted" />
              )}
              <figcaption className={cn("flex items-center justify-between border-t px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]", ink ? "border-background/15 text-background/60" : "border-border text-muted-foreground")}>
                <span className="truncate">{w.title}</span>
                <span className="shrink-0 text-primary">{w.kind}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {caption && (
          <figcaption
            className={cn(
              "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden className="tabular-nums">{String(shown.length).padStart(2, "0")} / {String(works.length).padStart(2, "0")}</span>
          </figcaption>
        )}
      </InView>
    </SectionShell>
  )
}
