import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// ═══ JOB      show one mark in every context it must survive
// ═══ EMOTION  systematic confidence — the logo is a family, not a file
// ═══ SIGNATURE constellation grid: hover or focus any cell and the rest of
//               the grid dims to a quarter, the chosen variant lifts to 1.03
//               and its dashed clear-space rails draw in from the centre
//   SITE      → brand/download pages, press kits
//   APP       → asset pickers; onSelect returns the variant id
//   BUILD     handcraft shell + motion dim/lift choreography; shadcn Badge
//             for variant flags
//   A11Y      cells are real buttons with aria-pressed + focus-visible ring;
//             focus triggers the same dim choreography as hover, so the
//             picker is fully keyboard-operable

export type LogoVariant = {
  id: string
  label: string
  /** Rendered size in px — the SVG scales, this is what the cell proves. */
  size: number
  tone: "positive" | "negative" | "mono"
  badge?: string
}

export type LogoConstellationProps = {
  variants?: LogoVariant[]
  onSelect?: (v: LogoVariant) => void
  eyebrow?: string
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

export function LogoConstellation({ variants = DEFAULTS, onSelect, eyebrow = "THE MARK · EVERY CONTEXT", className }: LogoConstellationProps) {
  const reduced = useReducedMotion()
  const [active, setActive] = React.useState<string | null>(null)
  const minSize = variants.length ? Math.min(...variants.map((v) => v.size)) : 0

  return (
    <section className="bg-background text-foreground">
      <div className="mx-auto w-full max-w-[920px] px-4 sm:px-6 lg:px-8 py-24 sm:py-28">
            <header className="">
        {eyebrow != null && (          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</span>        )}
        <h2 className="mt-2 tracking-tight text-4xl font-bold tracking-tight sm:text-5xl text-foreground">{<>One mark. <em className="font-serif italic font-medium">Every size it must survive.</em></>}</h2>
      </header>

      <motion.div
        className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3"
        onMouseLeave={() => setActive(null)}
        onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(null) }}
        initial={false}
        animate={{ opacity: 1 }}
      >
        {variants.map((v) => (
          <motion.button
            key={v.id}
            type="button"
            aria-pressed={active === v.id}
            aria-label={`${v.label}, ${v.size} pixel, ${v.tone} tone`}
            onClick={() => { setActive(v.id); onSelect?.(v) }}
            onMouseEnter={() => setActive(v.id)}
            onFocus={() => setActive(v.id)}
            animate={reduced ? {} : { opacity: active && active !== v.id ? 0.25 : 1, scale: active === v.id ? 1.03 : 1 }}
            whileTap={reduced ? undefined : { scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "group relative flex min-h-[190px] flex-col items-center justify-center gap-4 bg-background p-6 outline-none",
              "focus-visible:z-10 focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring/50",
              v.tone === "negative" && "bg-foreground"
            )}
          >
            {v.badge && (
              <Badge
                variant="outline"
                className={cn(
                  "absolute left-3 top-3 rounded-full border bg-transparent font-mono text-[9px] font-black uppercase tracking-[0.16em]",
                  v.tone === "negative" ? "border-background/30 text-background/70" : "border-border text-muted-foreground"
                )}
              >
                {v.badge}
              </Badge>
            )}
            {active === v.id && (
              <motion.span
                aria-hidden
                initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-5 border border-dashed border-current opacity-25"
              />
            )}
            <Mark size={v.size} tone={v.tone} />
            <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.18em]", v.tone === "negative" ? "text-background/60" : "text-muted-foreground")}>
              {v.label} · {v.size}px
            </span>
          </motion.button>
        ))}
      </motion.div>

      <p className="mt-4 flex flex-wrap items-center justify-end gap-3">
        <Badge variant="outline" className="rounded-full font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">min size {minSize}px</Badge>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">clearspace = 1 glyph unit</span>
      </p>
    </div>
    </section>
  )
}
