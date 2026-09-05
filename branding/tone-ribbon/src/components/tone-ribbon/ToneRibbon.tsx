import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { InfiniteSlider } from "@/components/primitives/infinite-slider"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { Button } from "@/components/ui/button"

// ═══ JOB      let the brand voice run like a wire through the page
// ═══ EMOTION  a ticker of conviction — impossible to not read along
// ═══ SIGNATURE two counter-running ribbons of sayings framed between
//               hairlines; below, a specimen stage crossfades one saying at
//               a time (auto, pausable, prev/next) so the voice is legible,
//               not just decorative
//   SITE      → between sections, manifesto strips
//   APP       → announcement rails; items are strings
//   BUILD     vendored InfiniteSlider (reverse + speedOnHover) with the real
//             edge-dissolve mask defined locally; every color is a token
//             (foreground/background/muted/border) so the section holds in
//             light and dark; shadcn ghost buttons drive the specimen
//   A11Y      reduce-motion collapses to one static wrapped row and the
//             specimen only moves on button press; duplicate ribbon and
//             decorative diamonds are aria-hidden; mono voice kept but not
//             duplicated to AT

export type ToneRibbonProps = {
  sayings?: string[]
  /** Heading label shown on the rail. Default "TONE · RUNNING RIBBON". */
  label?: string
  className?: string
}

const DEFAULTS = [
  "Say the true thing",
  "Ship the small thing",
  "Show the receipts",
  "Answer like a human",
  "Cut the adjectives",
  "Sign your work",
]

const FADE =
  "[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"

export function ToneRibbon({ sayings = DEFAULTS, label = "TONE · RUNNING RIBBON", className }: ToneRibbonProps) {
  const reduced = useReducedMotion()
  const items = sayings.length > 0 ? sayings : DEFAULTS
  const [idx, setIdx] = React.useState(0)
  const [held, setHeld] = React.useState(false)

  // gentle auto-advance — pauses after manual navigation, never under reduced motion
  React.useEffect(() => {
    if (reduced || held || items.length < 2) return
    const t = window.setInterval(() => setIdx((i) => (i + 1) % items.length), 3800)
    return () => window.clearInterval(t)
  }, [reduced, held, items.length])

  const go = (dir: 1 | -1) => {
    setHeld(true)
    setIdx((i) => (i + dir + items.length) % items.length)
  }

  const row = (list: string[], key: string, hidden = false) => (
    <div aria-hidden={hidden || undefined} className="flex items-center gap-12 py-5">
      {list.map((s, i) => (
        <span key={`${key}-${i}`} className="flex items-center gap-12 whitespace-nowrap">
          <span className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">{s}</span>
          <span aria-hidden className="size-2 shrink-0 rotate-45 bg-foreground/50" />
        </span>
      ))}
    </div>
  )

  const current = items[idx]

  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-background py-10", className)}>
      {/* header strip */}
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-6 px-4 sm:px-6">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span aria-hidden className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
          {items.length} sayings · two tempos
        </span>
      </div>

      {/* the double ribbon, framed by hairlines */}
      <div className="mt-6 border-y border-border/70">
        {reduced ? (
          <div className="mx-auto flex max-w-[1120px] flex-wrap justify-center px-6">{row(items, "s")}</div>
        ) : (
          <div className={cn("overflow-hidden", FADE)}>
            <InfiniteSlider speed={40} speedOnHover={6} reverse>
              {row(items, "a")}
            </InfiniteSlider>
            <InfiniteSlider speed={30} speedOnHover={5}>
              {row([...items].reverse(), "b", true)}
            </InfiniteSlider>
          </div>
        )}
      </div>

      {/* specimen stage — one saying, big, crossfading */}
      <div className="mx-auto mt-10 max-w-[1120px] px-4 sm:px-6">
        <div className="relative grid min-h-[240px] place-items-center overflow-hidden rounded-2xl border border-border/70 bg-muted/30 px-6 py-12 sm:min-h-[260px]">
          <span aria-hidden className="absolute left-5 top-5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground/70">
            specimen {String(idx + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
          <span aria-hidden className="absolute right-5 top-5 size-2 rotate-45 bg-foreground/50" />

          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current + idx}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[820px] text-center font-display text-4xl font-black italic leading-[1.05] tracking-tight text-foreground sm:text-5xl"
            >
              {current}
            </motion.p>
          </AnimatePresence>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous saying"
              onClick={() => go(-1)}
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </Button>
            <span aria-hidden className="h-4 w-px bg-border" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next saying"
              onClick={() => go(1)}
              className="size-8 rounded-full text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-[1120px] px-6">
        <TextShimmer duration={3} className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground">
          the voice runs even when the page stands still
        </TextShimmer>
      </div>
    </section>
  )
}
