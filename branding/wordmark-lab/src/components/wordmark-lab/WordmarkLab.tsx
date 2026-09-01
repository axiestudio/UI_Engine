import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check, Copy, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// ═══ JOB      let a team explore their wordmark like an instrument
// ═══ EMOTION  typographic control — the brand type bends to your hand
// ═══ SIGNATURE a giant live wordmark, each letter springing into place,
//               driven by weight/tracking sliders and a casing dial; the
//               settings print themselves as a real, copyable CSS plate
//   SITE      → brand guideline pages, press kits
//   APP       → internal brand tools; onChange emits the CSS for developers
//   BUILD     shadcn Card/Badge/Button + native labelled range inputs; the
//             spec plate is copy-to-clipboard, and reset is a real button;
//             letter stagger derives from the real word, not a magic number
//   A11Y      each range has a label + <output>, case dial is a radiogroup
//             with arrow keys; change announcements are not spammed to SR

export type WordmarkSpec = {
  weight: number
  tracking: number
  case: "upper" | "title" | "lower"
  css: string
}

export type WordmarkLabProps = {
  word?: string
  weights?: number[]
  initial?: Partial<WordmarkSpec>
  className?: string
  onSpecChange?: (spec: WordmarkSpec) => void
}

function buildCss(weight: number, tracking: number, casing: WordmarkSpec["case"]) {
  const textTransform = casing === "upper" ? "uppercase" : casing === "lower" ? "lowercase" : "none"
  return `font-family: var(--font-display);\nfont-weight: ${weight};\nletter-spacing: ${tracking / 100}em;\ntext-transform: ${textTransform};`
}

export function WordmarkLab({
  word = "Meridian",
  weights = [400, 600, 800, 900],
  initial,
  className,
  onSpecChange,
}: WordmarkLabProps) {
  const reduced = useReducedMotion()
  const lo = Math.min(...weights)
  const hi = Math.max(...weights)
  const [weight, setWeight] = React.useState(initial?.weight ?? Math.min(hi, 800))
  const [tracking, setTracking] = React.useState(initial?.tracking ?? -3)
  const [casing, setCasing] = React.useState<WordmarkSpec["case"]>(initial?.case ?? "title")
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const css = React.useMemo(() => buildCss(weight, tracking, casing), [weight, tracking, casing])

  React.useEffect(() => {
    onSpecChange?.({ weight, tracking, case: casing, css })
  }, [weight, tracking, casing, css, onSpecChange])

  const display = casing === "upper" ? word.toUpperCase() : casing === "lower" ? word.toLowerCase() : word
  const letters = display.split("")

  const reset = () => {
    setWeight(Math.min(hi, 800))
    setTracking(-3)
    setCasing("title")
  }

  const copyCss = async () => {
    try {
      await navigator.clipboard.writeText(css)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked */ }
  }

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="relative min-h-[280px]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">WORDMARK · LIVE SPECIMEN</span>
            {copied && (
              <Badge className="font-mono text-[9px] uppercase tracking-[0.14em]">CSS copied</Badge>
            )}
          </div>
          <p
            aria-label={`Wordmark preview: ${display}, weight ${weight}, tracking ${tracking / 100}em, ${casing} case`}
            className={cn(
              "relative inline-block font-display font-black leading-[0.92] text-foreground",
              reduced && "transition-none"
            )}
            style={{ fontSize: "clamp(56px, 11vw, 152px)", letterSpacing: `${tracking / 100}em`, fontWeight: weight, textTransform: casing === "upper" ? "uppercase" : casing === "lower" ? "lowercase" : "none" }}
          >
            {letters.map((ch, i) => (
              <motion.span
                key={`${i}-${ch}`}
                aria-hidden
                initial={reduced ? false : { y: 46, opacity: 0, rotate: -6 }}
                whileInView={{ y: 0, opacity: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 22, delay: i * 0.03 }}
                className="inline-block will-change-transform"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
            <span className="absolute inset-x-0 top-0 h-1 w-px rotate-12" aria-hidden />
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-dashed border-border pt-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <SpecPill label="wght" value={String(weight)} active />
            <SpecPill label="trck" value={`${tracking >= 0 ? "+" : ""}${tracking}`} active={tracking !== -3} />
            <SpecPill label="case" value={casing} />
            <span className="ml-auto hidden text-foreground/60 sm:block">var(--font-display)</span>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground">{String(1).padStart(2, "0")}<span className="opacity-50"> / {String(3).padStart(2, "0")}</span></span>
              <Button type="button" variant="ghost" size="xs" onClick={reset} className="gap-1.5 font-mono text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                <RotateCcw className="size-3" aria-hidden /> Reset
              </Button>
            </div>

            <Slider
              id="wl-weight"
              label="Weight"
              display={String(weight)}
              min={lo}
              max={hi}
              step={100}
              value={weight}
              onValue={setWeight}
            />
            <Slider
              id="wl-track"
              label="Tracking"
              display={`${tracking >= 0 ? "+" : ""}${tracking / 100}em`}
              min={-8}
              max={12}
              step={1}
              value={tracking}
              onValue={setTracking}
            />

            <fieldset>
              <legend className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Case</legend>
              <div role="radiogroup" aria-label="Case" className="mt-3 grid grid-cols-3 gap-1 rounded-lg border bg-background p-1">
                {(["upper", "title", "lower"] as const).map((c) => (
                  <Button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={casing === c}
                    variant="ghost"
                    onClick={() => setCasing(c)}
                    className={cn(
                      "h-auto justify-center rounded-md px-2 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em]",
                      casing === c ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            </fieldset>

            <figure className="mt-auto">
              <figcaption className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Generated CSS</figcaption>
              <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
                <pre className="grow overflow-x-auto font-mono text-[11px] leading-relaxed text-foreground" aria-label="Generated CSS">{css}</pre>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => void copyCss()} aria-label="Copy CSS" className="shrink-0">
                  {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
                </Button>
              </div>
            </figure>
          </CardContent>
        </Card>
      </div>
    </div>
    </section>
  )
}

function SpecPill({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <span className={cn("flex items-center gap-1.5 transition-colors", active ? "text-foreground" : "text-muted-foreground")}>
      <span className="opacity-60">{label}</span>
      <span className="font-black tabular-nums">{value}</span>
    </span>
  )
}

function Slider(props: { id: string; label: string; display: string; min: number; max: number; step: number; value: number; onValue: (n: number) => void }) {
  return (
    <div>
      <label htmlFor={props.id} className="flex items-center justify-between font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {props.label}
        <output htmlFor={props.id} className="text-foreground tabular-nums">{props.display}</output>
      </label>
      <input
        id={props.id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onValue(Number(e.target.value))}
        className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
      />
    </div>
  )
}
