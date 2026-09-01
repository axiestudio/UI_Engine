import * as React from "react"
import { cn } from "@/lib/utils"


// ═══ JOB      turn a lineup/menu into an event — you scan, the room lights it
// ═══ EMOTION  being the person holding the torch
// ═══ SIGNATURE the grid sleeps under a dark sheet; the cursor punches a soft
//               hole through the sheet (layer-mask), labels rise into the beam
//   SITE     → wine list / collection / night-lineup band
//   APP      → asset browser, "find the product" kiosk, photo picker
//   A11Y     fully keyboard-tolerant: sheet dims only visuals — every label is
//             also rendered as plain text beneath in .sr-only; tap moves the
//             torch on touch; reduced motion = always-lit grid with a still haze

export type SpotlightItem = { img?: string; label: string; meta?: string }

export type SpotlightGridProps = {
  items: SpotlightItem[]
  eyebrow?: string
  title?: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function SpotlightGrid({ items, eyebrow = "THE LINEUP", title, columns = 3, className }: SpotlightGridProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [pt, setPt] = React.useState<{ x: number; y: number } | null>(null)

  const move = (clientX: number, clientY: number) => {
    const r = hostRef.current?.getBoundingClientRect()
    if (!r) return
    setPt({ x: clientX - r.left, y: clientY - r.top })
  }

  const sheetStyle: React.CSSProperties = pt
    ? reduce
      ? {}
      : { background: `radial-gradient(220px 220px at ${pt.x}px ${pt.y}px, transparent 0%, transparent 34%, hsl(var(--stage)/0.92) 72%)` }
    : { background: "hsl(var(--stage))" }

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--stage))] px-4 py-20 text-white sm:px-6 lg:px-8", className)}>
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-9">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]"('lit', ', text-white/45'))}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>
          {title && <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-[40px]">{title}</h2>}
        </div>
        <div
          ref={hostRef}
          onMouseMove={(e) => move(e.clientX, e.clientY)}
          onMouseLeave={() => setPt(null)}
          onTouchStart={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => move(e.touches[0].clientX, e.touches[0].clientY)}
          className="relative"
        >
          <ul className={cn("grid grid-cols-2 gap-px border border-white/10 bg-white/10", columns === 3 && "sm:grid-cols-3", columns === 4 && "sm:grid-cols-4 md:grid-cols-4")}>
            {items.map((it) => (
              <li key={it.label} className="group relative bg-[hsl(var(--stage-cell))]">
                <div className="relative aspect-[4/5] overflow-hidden">
                  {it.img ? (
                    <img src={it.img} alt={it.label} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
                  ) : (
                    <div className="flex h-full w-full items-end p-4" style={{ background: "repeating-linear-gradient(135deg, hsl(var(--stage-cell)), hsl(var(--stage-cell)) 12px, hsl(var(--stage)) 12px, hsl(var(--stage)) 24px)" }}>
                      <span className="font-display text-2xl font-bold text-white/25">{it.label.slice(0, 18)}</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10">
                  <p className="font-display text-[15px] font-bold tracking-tight">{it.label}</p>
                  {it.meta && <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">{it.meta}</p>}
                </div>
                <span className="sr-only">{it.label}{it.meta ? ` — ${it.meta}` : ""}</span>
              </li>
            ))}
          </ul>
          {/* the dark sheet with the torch hole */}
          {!reduce && (
            <div aria-hidden className="pointer-events-none absolute inset-0 transition-[background] duration-200" style={sheetStyle}>
              {pt && <span className="absolute grid size-2 -translate-x-1/2 -translate-y-1/2 place-items-center" style={{ left: pt.x, top: pt.y }}>
                <span className="size-full rotate-45 border border-white/70" />
              </span>}
            </div>
          )}
        </div>
        <span aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", z-[3])}><Noise patternAlpha={Math.round((0.07) * 255)} patternSize={240} patternRefreshInterval={3} /></span>
      </div>
    </section>
  )
}
