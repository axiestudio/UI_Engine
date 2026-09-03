import * as React from "react"
// embla-carousel-react v8 documents the default import — portable across builds
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Pick a palette colour without leaving the loop.
// ═══ EMOTION     Sliding paint chips along a rail in the studio kitchen.
// ═══ SIGNATURE   A centred loop of swatches — the focused chip leans in at
//                 1.15× under a primary ring, the hex reads out large below,
//                 and the copy button morphs to a check for 1.5s when you take it.

export type EmblaSwatchPickerProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  /** content data: palette swatches */
  swatches?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const FALLBACK_TOKEN = "shade-amber"

export function EmblaSwatchPicker({
  eyebrow = "EMBLA · SWATCH PICKER",
  title = "Pick a colour, steal the hex.",
  subtitle = "Drag the loop or click a chip — the centred swatch leans in and its hex reads out below. Copy takes it straight to your clipboard.",
  swatches = ["shade-amber", "shade-teal", "shade-violet", "shade-rose", "shade-blue", "shade-brass", "shade-fern", "shade-red"],
  caption = "LOOP · CLICK OR DRAG · COPY TO CLIPBOARD",
  tone = "paper",
  className,
}: EmblaSwatchPickerProps) {
  const ink = tone === "ink"
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "center", axis: "x" })
  const [active, setActive] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const copyTimer = React.useRef<number | null>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    if (!embla) return
    const onSelect = () => setActive(embla.selectedScrollSnap())
    onSelect()
    embla.on("select", onSelect)
    embla.on("reInit", onSelect)
    return () => {
      embla.off("select", onSelect)
      embla.off("reInit", onSelect)
    }
  }, [embla])

  React.useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
    },
    [],
  )

  const token = swatches[Math.min(active, swatches.length - 1)] ?? FALLBACK_TOKEN
  const hex = `hsl(var(--app-${token}))`

  const copy = React.useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return
    navigator.clipboard
      .writeText(token)
      .then(() => {
        setCopied(true)
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current)
        copyTimer.current = window.setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }, [token])

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <header className="">
          {eyebrow != null && (            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>          )}
          <h2 className="mt-2 tracking-tight text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">{title}</h2>
          {subtitle != null && (            <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{subtitle}</p>          )}
        </header>
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <div className="mt-10">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y items-center py-2">
              {swatches.map((swatch, i) => {
                const selected = i === active
                return (
                  <div key={`${swatch}-${i}`} className="flex min-w-0 shrink-0 grow-0 basis-1/4 justify-center sm:basis-1/5">
                    <motion.button
                      type="button"
                      onClick={() => embla?.scrollTo(i)}
                      animate={{ scale: selected ? 1.15 : 1 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 22 }}
                      aria-label={`Select ${swatch}`}
                      aria-pressed={selected}
                      style={{ backgroundColor: `hsl(var(--app-${swatch}))` }}
                      className={cn(
                        "size-16 rounded-full transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : cn("ring-1 ring-border ring-offset-2 hover:ring-muted-foreground/50", ink ? "ring-offset-foreground" : "ring-offset-background"),
                      )}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3">
            <p className="font-mono text-2xl font-bold tabular-nums tracking-tight">{token}</p>
            <Button
              type="button"
              variant="ghost"
              onClick={copy}
              aria-label={copied ? "Copied" : `Copy ${token}`}
              className="flex size-9 items-center justify-center rounded-full border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? <Check className="size-4 text-primary" strokeWidth={2.5} /> : <Copy className="size-4" />}
            </Button>
          </div>

          <p
            className={cn(
              "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        </div>
      </InView>
    </div>
    </section>
  )
}
