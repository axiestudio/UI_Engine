import * as React from "react"
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: make the room felt through the screen — atmosphere carries the decision.
// EMOTION: sensory calm; unhurried, lived-in warmth (never a real-estate grid).
// SIGNATURE MOVE: layered photos drift at different scroll speeds — a still
//   diorama with parallax depth; on mobile it rests as a calm stack.
// RHYTHM: full-bleed band, 5:4 portrait + two 4:3 landscape tiles, no card
//   chrome — the images *are* the borders. TEXTURE: grain overlay @ 5%.
// TYPE: one whisper line; lowercase mono kicker, display-serif statement.
// ─────────────────────────────────────────────────────────────────────────────

export type AmbianceShot = {
  src: string
  alt: string
  caption?: string
}

export type AmbianceProps = {
  kicker?: string
  line?: string
  /** Exactly three recommended (portrait wide, tall left, tall right). Fewer degrade gracefully. */
  shots?: AmbianceProps_shots
  /** Parallax intensity in px for drift between layers. Default 42; reduced-motion disables. */
  drift?: number
  className?: string
}

type AmbianceProps_shots = [AmbianceShot, ...AmbianceShot[]]

function DriftImage({
  shot,
  range,
  y,
  className,
  label,
}: {
  shot: AmbianceShot
  range: [number, number] | undefined
  y?: MotionValue<number>
  className?: string
  label?: string
}) {
  const img = (
    <figure className={cn("relative overflow-hidden", className)}>
      <img src={shot.src} alt={shot.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      {shot.caption && <figcaption className="sr-only">{shot.caption}</figcaption>}
    </figure>
  )
  if (!y || !range) return img
  return (
    <motion.div
      style={{ y }}
      className="absolute inset-0"
      aria-label={label}
    >
      <div className="relative h-[calc(100%+90px)] w-full">
        <img src={shot.src} alt={shot.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      {shot.caption && <p className="sr-only">{shot.caption}</p>}
    </motion.div>
  )
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_AMBIANCE_SHOTS: AmbianceProps_shots = [ { src: "/showcase/content/content-03-product.webp", alt: "Treatment room, low lamps", caption: "Room one — warm table" }, { src: "/showcase/content/content-04-architecture.webp", alt: "Oils and towels", caption: "Oils, cedar & almond" }, { src: "/showcase/content/content-05-workshop.webp", alt: "Evening light on the wall", caption: "18:40, Tuesday" }, ]

export function Ambiance({ kicker = "stepping inside", line, shots = DEMO_AMBIANCE_SHOTS, drift = 42, className }: AmbianceProps) {
  const reduce = useReducedMotion()
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start end", "end start"] })
  const ySlow = useTransform(scrollYProgress, [0, 1], [drift, -drift])
  const yFast = useTransform(scrollYProgress, [0, 1], [drift * 1.8, -drift * 1.8])
  const [a, b, c] = shots
  const statement =
    line ??
    "low lamps, warm stone, the particular quiet of a place that has nothing to sell you in this minute"

  return (
    <section ref={wrapRef} className={cn("relative isolate w-full min-h-[400px] overflow-hidden bg-background text-foreground", className)} aria-label={kicker}>
      <InView
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.7 }}
        viewOptions={{ once: true, margin: "-40px" }}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-14 sm:px-6 lg:px-8">
          {/* whisper headline */}
          <header className="relative z-10 mb-6 max-w-2xl">
            <p className="font-mono text-[11px] font-bold lowercase tracking-[0.18em] text-muted-foreground">{kicker}</p>
            <p className="mt-3 font-display text-2xl font-medium leading-[1.15] tracking-[-0.02em] sm:text-[30px]">{statement}</p>
          </header>

          {/* diorama: desktop layered, mobile calm stack */}
          <div className="relative">
            {/* portrait anchor */}
            <div className="relative h-[420px] overflow-hidden rounded-xl sm:h-[520px] lg:h-[560px] lg:rounded-2xl">
              <img src={a.src} alt={a.alt} className="absolute inset-0 h-full w-full object-cover" />
              {a.caption && <p className="sr-only">{a.caption}</p>}
              {/* grain */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
                style={{ backgroundImage: "radial-gradient(hsl(var(--background)) 0.5px, transparent 0.6px)", backgroundSize: "3px 3px" }}
              />
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[hsl(var(--overlay-bg)/0.45)] to-transparent px-5 pb-4 pt-16 lg:hidden">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--overlay-fg)/0.85)]">{a.alt}</span>
              </figcaption>
            </div>

            {/* two floating side tiles (lg) — parallax at two depths */}
            {b && (
              <div className="pointer-events-none absolute left-4 top-24 hidden h-[220px] w-[46%] overflow-hidden rounded-xl shadow-xl lg:top-16 lg:block lg:h-[300px]">
                <DriftImage
                  shot={b}
                  range={reduce ? undefined : [0, 1]}
                  y={reduce ? undefined : ySlow}
                  className="absolute inset-0 h-full w-full"
                  label={b.alt}
                />
              </div>
            )}
            {c && (
              <div className="pointer-events-none absolute right-4 bottom-10 hidden h-[220px] w-[42%] overflow-hidden rounded-xl shadow-xl lg:block lg:h-[280px]">
                <DriftImage
                  shot={c}
                  range={reduce ? undefined : [0, 1]}
                  y={reduce ? undefined : yFast}
                  className="absolute inset-0 h-full w-full"
                  label={c.alt}
                />
              </div>
            )}

            {/* mobile: calm horizontal strip instead of motion */}
            <div className="-mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 lg:hidden" data-resting-strip>
              {[b, c].filter(Boolean).map((s, i) => (
                <figure key={i} className="relative h-[170px] w-[240px] shrink-0 overflow-hidden rounded-xl">
                  <img src={s!.src} alt={s!.alt} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>

          {/* captions ledger (desktop whisper — alt already exposed sr-only on tiles) */}
          {shots.some((s) => s.caption) && (
            <p className="mt-6 hidden font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground lg:block">
              {[a, b, c].filter(Boolean).map((s, i) => (s!.caption ? `${s!.caption}${i < 2 ? "  ·  " : ""}` : "")).join("")}
            </p>
          )}
        </div>
      </InView>
    </section>
  )
}
