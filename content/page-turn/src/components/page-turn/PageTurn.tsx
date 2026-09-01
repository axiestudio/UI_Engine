import * as React from "react"
import { motion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


// ═══ JOB      pace a set of chapters/quotes so each gets its own page
// ═══ EMOTION  reading something bound properly
// ═══ SIGNATURE a hardcover spread; NEXT flips the right leaf over the spine
//               on rotateY with a travelling paper shadow; the turned side
//               stacks aged edges behind it
//   SITE     → chapters/values/testimonials-as-pages band
//   APP      → document reader / tour steps stepper with controlled `index`
//             (your state), arrows + dots + keys
//   A11Y     pages swap instantly for SR (aria-hidden on the 3D leaf), live
//            text under the hood; arrow-key nav on the shell; reduced = fade

export type Page = { head?: string; title: React.ReactNode; body: React.ReactNode }

export type PageTurnProps = {
  brand?: string
  pages: Page[]
  /** app mode: controlled page index (0-based) */
  index?: number
  onIndex?: (i: number) => void
  className?: string
}

export function PageTurn({ brand = "HOUSE PRESS", pages, index: indexProp, onIndex, className }: PageTurnProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [inner, setInner] = React.useState(0)
  const [dir, setDir] = React.useState<1 | -1>(1)
  const i = Math.max(0, Math.min(pages.length - 1, indexProp ?? inner))
  const go = (ni: number) => { const c = Math.max(0, Math.min(pages.length - 1, ni)); setDir(c >= i ? 1 : -1); if (indexProp === undefined) setInner(c); onIndex?.(c) }
  const cur = pages[i]
  const prev = pages[i - 1]
  const flipKey = i

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--book-spine))] px-4 py-16 sm:px-6 lg:px-8", className)}
      onKeyDown={(e) => { if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1) }}
    >
      <div className="mx-auto w-full max-w-[1040px]">
        <div className="mb-6 flex items-end justify-between gap-4 text-[hsl(var(--page))]">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "opacity-60")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{brand} · LEAF {String(i + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
          <div className="flex gap-2">
            <Button type="button" aria label="Previous page" onClick={() => go(i - 1)} disabled={i === 0} variant="default" className={grid size-10 place-items-center rounded-full border border-white/25 disabled:opacity-30 hover:bg-white/10}>
              <ChevronLeft className="size-5" />
            
            <Button type="button" aria label="Next page" onClick={() => go(i + 1)} disabled={i === pages.length - 1} variant="default" className={grid size-10 place-items-center rounded-full border border-white/25 disabled:opacity-30 hover:bg-white/10}>
              <ChevronRight className="size-5" />
            
          </div>
        </div>

        {/* the spread */}
        <div className="relative mx-auto grid aspect-[16/10] w-full max-w-[960px] grid-cols-2 rounded-sm p-[10px] shadow-[0_40px_90px_-40px_black]" style={{ background: "hsl(var(--book-cover))", perspective: 2400 }}>
          {/* left leaf: previous page content (settled) */}
          <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10" style={{ background: "hsl(var(--page))" }}>
            <StackEdge side="left" depth={Math.min(5, i)} />
            <Spine side="right" />
            <div className="relative z-[1]">
              {prev ? <PageBody page={prev} /> : <p className="text-center font-serif text-[13px] italic opacity-50">— front matter —</p>}
            </div>
          </div>
          {/* right leaf: current page */}
          <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10" style={{ background: "hsl(var(--page-edge))" }}>
            <StackEdge side="right" depth={Math.max(0, pages.length - 1 - i)} />
            <Spine side="left" />
            <PageBody page={cur} />
          </div>

          {/* the leaf mid-flight — only when turning forward */}
          {dir === 1 && !reduce && (
            <motion.div
              key={`flip-${i}`}
              aria-hidden
              initial={{ rotateY: -0.01, opacity: 1 }}
              animate={{ rotateY: -168, opacity: [1, 1, 0] }}
              transition={{ duration: 0.6, ease: [0.35, 0, 0.25, 1], times: [0, 0.82, 1] }}
              className="pointer-events-none absolute inset-y-[10px] right-[10px] z-[3] w-[calc(50%-10px)] origin-left"
              style={{ transformStyle: "preserve-3d", background: "hsl(var(--page))", boxShadow: "inset -20px 0 30px -18px rgba(0,0,0,0.4)" }}
            >
              <div className="flex h-full items-center justify-center px-8 text-center font-serif text-[16px] font-semibold" style={{ color: "hsl(var(--book-ink))" }}>
                {cur.head ?? String(i + 1).padStart(2, "0")}
              </div>
              <span className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />
            </motion.div>
          )}
        </div>

        {/* dots */}
        <div className="mt-6 flex justify-center gap-2">
          {pages.map((_, d) => (
            <button key={d} type="button" aria-label={`Go to page ${d + 1}`} aria-current={d === i} onClick={() => go(d)} className={cn("h-1.5 rounded-full transition-all", d === i ? "w-7 bg-[hsl(var(--page))]" : "w-2 bg-white/25 hover:bg-white/45")} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PageBody({ page }: { page: Page }) {
  return (
    <div className="text-[hsl(var(--book-ink))]">
      {page.head && <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] opacity-50">{page.head}</p>}
      <h3 className="mt-3 font-serif text-[20px] font-bold leading-tight sm:text-[24px]">{page.title}</h3>
      <div className="mt-4 space-y-2 font-serif text-[13px] leading-[1.85] opacity-80 sm:text-[14px]">{page.body}</div>
    </div>
  )
}

function StackEdge({ side, depth }: { side: "left" | "right"; depth: number }) {
  if (!depth) return null
  return (
    <span aria-hidden className="absolute inset-y-2 z-[2] w-2" style={{ [side]: 0, background: `repeating-linear-gradient(${side === "left" ? "90deg" : "270deg"}, hsl(var(--page)) 0 1px, hsl(var(--page-edge)) 1px 2.4px)` } as React.CSSProperties} />
  )
}

function Spine({ side }: { side: "left" | "right" }) {
  return <span aria-hidden className="absolute inset-y-0 z-[2] w-8" style={{ [side]: 0, background: `linear-gradient(${side === "left" ? "-90deg" : "90deg"}, transparent, rgb(0 0 0 / 0.22))` } as React.CSSProperties} />
}
