import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell } from "@/components/primitives/handcraft"

// ═══ JOB      show one mark in every context it must survive
// ═══ EMOTION  systematic confidence — the logo is a family, not a file
// ═══ SIGNATURE hover any cell and the whole grid dims while that variant
//               scales up with its clearspace rails drawing in
//   SITE      → brand/download pages, press kits
//   APP       → asset pickers; onSelect returns the variant id
//   A11Y      buttons with aria-pressed; clearspace rails decorative

export type LogoVariant = {
  id: string
  label: string
  size: number
  tone: "positive" | "negative" | "mono"
  badge?: string
}

export type LogoConstellationProps = {
  variants?: LogoVariant[]
  onSelect?: (v: LogoVariant) => void
  className?: string
}

const DEFAULTS: LogoVariant[] = [
  { id: "primary", label: "Primary lockup", size: 96, tone: "positive", badge: "default" },
  { id: "stacked", label: "Stacked", size: 64, tone: "positive" },
  { id: "glyph", label: "Glyph only", size: 40, tone: "positive" },
  { id: "reverse", label: "Reverse", size: 96, tone: "negative" },
  { id: "mono", label: "One-color", size: 48, tone: "mono" },
  { id: "favicon", label: "16 px favicon", size: 16, tone: "positive", badge: "min" },
]

function Mark({ size, tone }: { size: number; tone: LogoVariant["tone"] }) {
  const cls = tone === "negative" ? "text-background" : tone === "mono" ? "text-muted-foreground" : "text-foreground"
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden className={cn("shrink-0", cls)}>
      <rect x="4" y="4" width="40" height="40" rx="10" stroke="currentColor" strokeWidth="3" />
      <path d="M14 32 L24 14 L34 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="27" r="3.5" fill="currentColor" />
    </svg>
  )
}

export function LogoConstellation({ variants = DEFAULTS, onSelect, className }: LogoConstellationProps) {
  const [active, setActive] = React.useState<string | null>(null)
  return (
    <SectionShell width={920} grain className={className}>
      <MonoLabel className="mb-3 text-muted-foreground">THE MARK · EVERY CONTEXT</MonoLabel>
      <h2 className="max-w-xl font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] text-foreground sm:text-[44px]">
        One mark. <em className="font-serif italic font-medium">Every size it must survive.</em>
      </h2>
      <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3"
        onMouseLeave={() => setActive(null)}>
        {variants.map((v) => (
          <motion.button
            key={v.id}
            type="button"
            aria-pressed={active === v.id}
            onClick={() => { setActive(v.id); onSelect?.(v) }}
            onMouseEnter={() => setActive(v.id)}
            animate={{ opacity: active && active !== v.id ? 0.25 : 1, scale: active === v.id ? 1.03 : 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative flex min-h-[190px] flex-col items-center justify-center gap-4 bg-background p-6",
              v.tone === "negative" && "bg-foreground"
            )}
          >
            {v.badge && (
              <span className={cn("absolute left-3 top-3 rounded-full border px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.16em]",
                v.tone === "negative" ? "border-background/30 text-background/70" : "border-border text-muted-foreground")}>
                {v.badge}
              </span>
            )}
            {/* clearspace rails draw on active */}
            {active === v.id && (
              <motion.span aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="pointer-events-none absolute inset-5 border border-dashed border-current opacity-20" />
            )}
            <Mark size={v.size} tone={v.tone} />
            <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.18em]", v.tone === "negative" ? "text-background/60" : "text-muted-foreground")}>
              {v.label} · {v.size}px
            </span>
          </motion.button>
        ))}
      </div>
      <p className="mt-4 text-right font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">min size {Math.min(...variants.map((v) => v.size))}px · clearspace = 1 glyph unit</p>
    </SectionShell>
  )
}
