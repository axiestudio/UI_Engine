import * as React from "react"
import { motion } from "motion/react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

export type MatchPair = { left: string; right: string }
export type MatchPairWireProps = {
  pairs?: MatchPair[]
  shuffle?: boolean
  className?: string
  onMatch?: (a: string, b: string) => void
  onComplete?: () => void
}

const DEFAULT_PAIRS: MatchPair[] = [
  { left: "200 OK", right: "The thing you asked for" },
  { left: "301 Moved", right: "It lives somewhere else now" },
  { left: "404 Not Found", right: "That room doesn't exist" },
  { left: "418 Teapot", right: "It refuses to brew coffee" },
]

function shuffleArr<T>(a: T[]): T[] {
  const b = [...a]
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = b[i]!
    b[i] = b[j]!
    b[j] = tmp
  }
  return b
}

export function MatchPairWire({ pairs = DEFAULT_PAIRS, shuffle = true, className, onMatch, onComplete }: MatchPairWireProps) {
  const [selLeft, setSelLeft] = React.useState<string | null>(null)
  const [matched, setMatched] = React.useState<Record<string, string>>({})
  const [wrong, setWrong] = React.useState<string | null>(null)
  const [rightOrder, setRightOrder] = React.useState(() => (shuffle ? shuffleArr(pairs.map((p) => p.right)) : pairs.map((p) => p.right)))
  const boxRef = React.useRef<HTMLDivElement>(null)
  const leftRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const rightRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const [wires, setWires] = React.useState<{ d: string }[]>([])
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    setRightOrder(shuffle ? shuffleArr(pairs.map((p) => p.right)) : pairs.map((p) => p.right))
    setMatched({})
    setWires([])
    setSelLeft(null)
  }, [pairs, shuffle])

  const wirePath = React.useCallback(
    (a: HTMLElement | undefined, b: HTMLElement | undefined) => {
      const box = boxRef.current?.getBoundingClientRect()
      if (!box || !a || !b) return ""
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      const x1 = ra.right - box.left
      const y1 = ra.top + ra.height / 2 - box.top
      const x2 = rb.left - box.left
      const y2 = rb.top + rb.height / 2 - box.top
      const mx = (x1 + x2) / 2
      return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`
    },
    []
  )

  const updateWires = React.useCallback(() => {
    setWires(
      Object.entries(matched).map(([l, r]) => ({
        d: wirePath(leftRefs.current.get(l), rightRefs.current.get(r)),
      }))
    )
  }, [matched, wirePath])

  React.useLayoutEffect(() => {
    updateWires()
    const onResize = () => updateWires()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [updateWires])

  const tryMatch = (right: string) => {
    if (!selLeft) return
    const pair = pairs.find((p) => p.left === selLeft)
    if (pair && pair.right === right) {
      const next = { ...matched, [selLeft]: right }
      setMatched(next)
      onMatch?.(selLeft, right)
      if (Object.keys(next).length === pairs.length) onComplete?.()
      // defer wire draw to after DOM paint
      requestAnimationFrame(() => {
        const d = wirePath(leftRefs.current.get(selLeft), rightRefs.current.get(right))
        setWires((w) => [...w, { d }])
      })
    } else {
      setWrong(selLeft)
      window.setTimeout(() => setWrong(null), 560)
    }
    setSelLeft(null)
  }

  const allDone = Object.keys(matched).length === pairs.length

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", cn(className))}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />MATCH · PAIRING</span>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Connect code to meaning.</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Pick a status code, then its meaning. Correct pairs latch and stay.</p>

      <div ref={boxRef} className="relative mt-8 grid gap-6 sm:grid-cols-2">
        <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full overflow-visible sm:block">
          {wires.map((w, i) => (
            <motion.path
              key={i}
              d={w.d}
              fill="none"
              stroke="hsl(var(--foreground))"
              strokeWidth={2}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </svg>

        <div className="flex flex-col gap-2.5" role="group" aria-label="Status codes">
          {pairs.map((p) => {
            const done = p.left in matched
            const selected = selLeft === p.left
            const isWrong = wrong === p.left
            return (
              <InView key={p.left} once delay={0.04}>
                <motion.button
                  type="button"
                  aria-pressed={selected}
                  disabled={done}
                  ref={(el) => {
                    if (el) leftRefs.current.set(p.left, el)
                  }}
                  onClick={() => setSelLeft(p.left)}
                  animate={isWrong && !reduce ? { x: [0, -4, 4, -4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left font-mono text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    done && "border-border bg-muted text-muted-foreground line-through decoration-border",
                    selected && "border-foreground bg-foreground text-background shadow-sm",
                    isWrong && "border-destructive bg-destructive/10 text-destructive",
                    !done && !selected && !isWrong && "border-border bg-card hover:border-foreground/20 hover:bg-muted/50"
                  )}
                >
                  <span>{p.left}</span>
                  {done ? <Check className="size-4" aria-hidden /> : isWrong ? <X className="size-4" aria-hidden /> : null}
                </motion.button>
              </InView>
            )
          })}
        </div>

        <div className="flex flex-col gap-2.5" role="group" aria-label="Meanings">
          {rightOrder.map((right) => {
            const done = Object.values(matched).includes(right)
            return (
              <InView key={right} once delay={0.08}>
                <Button type='button' disabled={done || allDone} ref={(el) => {
                    if (el) rightRefs.current.set(right, el)
                  }} onClick={() => tryMatch(right)} aria-disabled={done} className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    done ? "border-border bg-muted text-muted-foreground" : "border-border bg-card hover:border-foreground/20 hover:bg-muted/50",
                    selLeft && !done && "hover:border-foreground/30"
                  )} variant="default">
                  <span className="font-medium leading-snug">{right}</span>
                  {done && <Check className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
                </Button>
              </InView>
            )
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-center font-mono text-[11px] font-medium tracking-[0.12em] text-muted-foreground">
        {allDone ? "All pairs matched — nice work." : selLeft ? "Now pick its meaning on the right" : "Choose a code to begin"}
      </p>
      {allDone && (
        <div className="mt-4 flex justify-center">
          <Button type='button' onClick={() => {
              setMatched({})
              setWires([])
              setRightOrder(shuffle ? shuffleArr(pairs.map((p) => p.right)) : pairs.map((p) => p.right))
            }} className="rounded-md border bg-background px-4 py-2 font-mono text-xs font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" variant="default">
            Play again
          </Button>
        </div>
      )}
    
  </div>
</section>
  )
}
