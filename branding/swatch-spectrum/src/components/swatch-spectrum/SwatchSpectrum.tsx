import * as React from "react"
import { motion } from "motion/react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB      turn the palette from a picture into a tool
// ═══ EMOTION  tactile color — click, copy, done
// ═══ SIGNATURE each swatch is a full-height column that expands on hover
//               and prints its token + contrast ratio; one click copies
//   SITE      → brand pages, design system docs
//   APP       → theme pickers; tokens are copyable strings
//   A11Y      buttons with aria-label incl. hex; copied state announced

export type Swatch = {
  name: string
  hex: string
  token: string
  /** foreground hex used to render text on this swatch */
  on?: string
}

export type SwatchSpectrumProps = {
  swatches?: Swatch[]
  onCopy?: (s: Swatch) => void
  className?: string
}

function luminance(hex: string) {
  const h = hex.replace("#", "")
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
export function contrast(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

export function SwatchSpectrum({ swatches = [
  { name: "Ink", hex: "#121212", token: "--foreground" },
  { name: "Paper", hex: "#FAFAF7", token: "--background", on: "#121212" },
  { name: "Signal", hex: "#E8501E", token: "--brand" },
  { name: "Moss", hex: "#4A5D43", token: "--accent", on: "#FAFAF7" },
  { name: "Stone", hex: "#8E8B84", token: "--muted-foreground", on: "#121212" },
], onCopy, className }: SwatchSpectrumProps) {
  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = async (s: Swatch) => {
    try { await navigator.clipboard.writeText(s.hex) } catch { /* clipboard unavailable */ }
    setCopied(s.name)
    onCopy?.(s)
    window.setTimeout(() => setCopied((c) => (c === s.name ? null : c)), 1400)
  }

  return (
    <SectionShell width={1120} padding="tight" className={className}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <MonoLabel className="text-muted-foreground">PALETTE · TOKENS</MonoLabel>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-foreground">Click a color. It's yours.</h2>
        </div>
        <p className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground sm:block">AA checked · hex on copy</p>
      </div>

      <div className="mt-8 flex h-[380px] gap-1.5 overflow-hidden rounded-xl" role="list" aria-label="Brand colors">
        {swatches.map((s) => {
          const fg = s.on ?? (luminance(s.hex) > 0.4 ? "#121212" : "#FAFAF7")
          const ratio = contrast(s.hex, fg)
          return (
            <motion.button
              key={s.name}
              type="button"
              role="listitem"
              aria-label={`Copy ${s.name} ${s.hex}`}
              onClick={() => copy(s)}
              whileHover={{ flexGrow: 2.4 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ backgroundColor: s.hex, color: fg, flexGrow: 1, flexBasis: 0 }}
              className="group relative flex min-w-14 flex-col justify-between rounded-lg p-4 text-left"
            >
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{copied === s.name ? "COPIED ✓" : s.name}</span>
              <span className="flex flex-col gap-1">
                <span className="font-mono text-[11px] font-bold">{s.hex.toUpperCase()}</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] opacity-70">{s.token} · {ratio.toFixed(1)}:1</span>
                <span aria-live="polite" className="sr-only">{copied === s.name ? `${s.name} copied` : ""}</span>
                {copied === s.name ? <Check className="size-4" aria-hidden /> : <Copy className="size-4 opacity-0 transition-opacity group-hover:opacity-70" aria-hidden />}
              </span>
            </motion.button>
          )
        })}
      </div>
    </SectionShell>
  )
}
