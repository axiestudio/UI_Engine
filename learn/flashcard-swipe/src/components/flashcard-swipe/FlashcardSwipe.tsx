import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { RotateCcw, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"


export type Flashcard = { q: string; a: string }
export type FlashcardSwipeProps = {
  cards?: Flashcard[]
  className?: string
  onSwipe?: (i: number, known: boolean) => void
}

const DEFAULT_CARDS: Flashcard[] = [
  { q: "spanning tree", a: "A subgraph that connects all vertices with no cycles." },
  { q: "idempotent", a: "Same input → same result, however many times you call it." },
  { q: "backpressure", a: "Signals upstream to slow down when downstream can't keep up." },
  { q: "memoization", a: "Cache the answer; never compute the same thing twice." },
]

export function FlashcardSwipe({ cards = DEFAULT_CARDS, className, onSwipe }: FlashcardSwipeProps) {
  const [order, setOrder] = React.useState(() => cards.map((_, i) => i))
  const [flipped, setFlipped] = React.useState(false)
  const [studied, setStudied] = React.useState(0)
  const dirRef = React.useRef(true)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const top = order[0]

  const swipe = React.useCallback(
    (known: boolean) => {
      dirRef.current = known
      onSwipe?.(order[0]!, known)
      setStudied((s) => s + 1)
      setFlipped(false)
      setOrder((o) => [...o.slice(1), o[0]!])
    },
    [onSwipe, order]
  )

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      if (!flipped) setFlipped(true)
      else swipe(true)
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      swipe(false)
    }
    if (e.key === " ") {
      e.preventDefault()
      setFlipped((f) => !f)
    }
  }

  return (
    <section className={cn("relative isolate w-full overflow-hidden", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (760), ["--shell-w" as string]: `${(760)}px` }}>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />STUDY · FLASHCARDS</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-muted-foreground">
            {studied} studied · {cards.length} cards
          </span>
          <Button type='button' onClick={() => {
              setOrder(cards.map((_, i) => i))
              setStudied(0)
              setFlipped(false)
            }} className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 font-mono text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="outline">
            <RotateCcw className="size-3.5" aria-hidden /> Reset
          </Button>
        </div>
      </div>

      <div
        className="relative mx-auto mt-6 max-w-[420px] focus-visible:outline-none"
        style={{ perspective: 1000 }}
        tabIndex={0}
        role="group"
        aria-label={`Flashcard ${studied + 1} of ${cards.length}, press Space to flip, Arrow Right if known`}
        onKeyDown={onKeyDown}
      >
        {/* deck depth */}
        <span aria-hidden className="absolute inset-x-6 bottom-0 top-4 rounded-xl border bg-muted/40" style={{ transform: "scale(0.97) translateY(8px)" }} />
        <span aria-hidden className="absolute inset-x-3 bottom-0 top-2 rounded-xl border bg-muted/30" style={{ transform: "scale(0.985) translateY(4px)" }} />

        <div className="relative h-[280px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={top}
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { x: dirRef.current ? 220 : -220, rotate: dirRef.current ? 6 : -6, opacity: 0, transition: { duration: 0.32 } }}
              drag={reduce ? false : "x"}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 100) swipe(info.offset.x > 0)
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute inset-0 cursor-grab active:cursor-grabbing"
            >
              <motion.div
                initial={false}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative h-full w-full"
              >
                {/* front */}
                <div
                  className="absolute inset-0 flex flex-col justify-between rounded-xl border bg-card p-6 shadow-sm [backface-visibility:hidden]"
                  onClick={() => setFlipped(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setFlipped(true)
                    }
                  }}
                  aria-label={`Term: ${cards[top]!.q}. Press to reveal definition.`}
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Tap to reveal</span>
                  <p className="font-display text-[26px] font-bold leading-tight tracking-tight text-foreground">{cards[top]!.q}</p>
                  <span className="font-mono text-[11px] font-medium text-muted-foreground">Space · flip · arrows to rate</span>
                </div>

                {/* back */}
                <div
                  style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" as const }}
                  className="absolute inset-0 flex flex-col justify-between rounded-xl border bg-foreground p-6 text-background shadow-sm"
                >
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-background/70">Definition</span>
                  <p className="font-serif text-[18px] italic leading-snug text-background">{cards[top]!.a}</p>
                  <div className="flex gap-2">
                      <Button type='button' onClick={() => swipe(false)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-background/20 bg-background/10 px-4 py-2 font-mono text-xs font-medium text-background hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background" variant="default">
                      <X className="size-3.5" aria-hidden /> Again
                    </Button>
                    <Button type='button' onClick={() => swipe(true)} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-background px-4 py-2 font-mono text-xs font-medium text-foreground hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background" variant="default">
                      <Check className="size-3.5" aria-hidden /> Known
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center font-mono text-[11px] font-medium text-muted-foreground">Drag or use arrow keys · Right = known · Left = again</p>
    
  </div>
</section>
  )
}
