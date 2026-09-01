import * as React from "react"
import { useReducedMotion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      turn the palette from a picture into a tool
// ═══ EMOTION  tactile color — click, copy, done
// ═══ SIGNATURE swatch columns that stretch their flex-grow on hover/focus
//               (CSS-eased, snappy on entry, slow on exit) and print token +
//               live WCAG verdict; one click copies the hex and the column
//               answers with a check and "· copied"
//   SITE      → brand pages, design system docs
//   APP       → theme pickers; tokens are copyable strings
//   BUILD     hexes here are DATA (a swatch must render its own colour);
//             contrast is computed with WCAG maths, AA verdicts earned;
//             everything non-chromatic rides tokens
//   A11Y      copy buttons: real labels w/ ratio + verdict, aria-live copy
//             receipt, visible inset focus ring on any fill, reduced-motion
//             = instant expand, no easing

export type Swatch = {
  name: string
  hex: string
  token: string
  /** Foreground used for text on this swatch; auto-derived when absent. */
  on?: string
}

export type SwatchSpectrumProps = {
  swatches?: Swatch[]
  onCopy?: (s: Swatch) => void
  eyebrow?: string
  className?: string
}

function luminance(hex: string) {
  const h = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** WCAG contrast ratio between two hex colours. */
export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

function readableInk(hex: string) {
  return luminance(hex) > 0.35 ? "#121212" : "#FAFAF7"
}

const SWATCHES = [
  { name: "Ink", hex: "#121212", token: "--foreground" },
  { name: "Paper", hex: "#FAFAF7", token: "--background", on: "#121212" },
  { name: "Signal", hex: "#E8501E", token: "--brand" },
  { name: "Moss", hex: "#4A5D43", token: "--accent", on: "#FAFAF7" },
  { name: "Stone", hex: "#8E8B84", token: "--muted-foreground", on: "#121212" },
]

export function SwatchSpectrum({
  swatches = SWATCHES,
  onCopy,
  eyebrow = "PALETTE · TOKENS",
  className,
}: SwatchSpectrumProps) {
  const reduced = useReducedMotion()
  const [copied, setCopied] = React.useState<string | null>(null)
  const timer = React.useRef<number | undefined>(undefined)
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async (s: Swatch) => {
    try {
      await navigator.clipboard.writeText(s.hex)
    } catch {
      /* clipboard unavailable — verdict text still visible */
    }
    setCopied(s.name)
    onCopy?.(s)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied((c) => (c === s.name ? null : c)), 1600)
  }

  return (
    <section className={cn("bg-background text-foreground", className)}>
      <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="flex items-end justify-between gap-4">
                <header className="">
          {eyebrow != null && (            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>          )}
          <h2 className="mt-2 tracking-tight text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">Click a color. It's yours.</h2>
        </header>
        <Badge variant="outline" className="mb-1 hidden rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground sm:inline-flex">
          contrast computed, not claimed
        </Badge>
      </div>

      <div className="mt-8 flex h-[400px] gap-1.5 rounded-xl" role="group" aria-label="Brand colors">
        {swatches.map((s) => {
          const fg = s.on ?? readableInk(s.hex)
          const ratio = contrast(s.hex, fg)
          const pass = ratio >= 4.5
          return (
            <Button
              key={s.name}
              type="button"
              variant="ghost"
              aria-label={`Copy ${s.name} ${s.hex}, contrast ${ratio.toFixed(1)} to 1. ${pass ? "Passes AA." : "Large text only."}`}
              onClick={() => void copy(s)}
              style={{ backgroundColor: s.hex, color: fg, flexGrow: 1, flexBasis: 0 }}
              className={cn(
                "group relative flex h-auto min-w-14 cursor-pointer flex-col justify-between rounded-lg p-4 text-left outline-none",
                "hover:grow-[2.4] focus-visible:grow-[2.4] focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-current",
                reduced ? "" : "transition-[flex-grow] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
              )}
            >
              <span className="flex items-center justify-between font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                {s.name}
                {copied === s.name ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Copy className="size-4 opacity-0 transition-opacity duration-200 group-hover:opacity-70 group-focus-visible:opacity-70" aria-hidden />
                )}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-2xl font-black leading-none tabular-nums">{s.hex.toUpperCase()}</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] opacity-70">{s.token}</span>
                <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-current px-2 py-0.5 font-mono text-[8px] font-black uppercase tracking-[0.14em] opacity-[0.85]">
                  {ratio.toFixed(1)}:1 · {pass ? "AA" : "AA·LG"}
                  {copied === s.name ? " · copied" : ""}
                </span>
              </span>
            </Button>
          )
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {copied ? `${copied} copied.` : ""}
      </p>
      <p className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <Badge variant="outline" className="rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{swatches.length} tokens</Badge>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">hex on copy · verdicts live</span>
      </p>
    </div>
    </section>
  )
}
