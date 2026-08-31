import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { MonoLabel, SectionShell, Ordinal } from "@/components/primitives/handcraft"

// ═══ JOB      let a team explore their wordmark like an instrument
// ═══ EMOTION  typographic control — the brand type bends to your hand
// ═══ SIGNATURE a giant live wordmark that responds to weight/slant/tracking
//               sliders with letter-by-letter stagger; settings print as a spec plate
//   SITE      → brand guideline pages, press kits
//   APP       → internal brand tools; onChange emits the CSS for developers
//   A11Y      real range inputs with labels; reduce-motion disables stagger

export type WordmarkLabProps = {
  word?: string
  weights?: number[]
  className?: string
  onSpecChange?: (spec: { weight: number; tracking: number; case: "upper" | "title" | "lower"; css: string }) => void
}

export function WordmarkLab({ word = "Meridian", weights = [400, 600, 800, 900], className, onSpecChange }: WordmarkLabProps) {
  const [weight, setWeight] = React.useState(800)
  const [tracking, setTracking] = React.useState(-3)
  const [casing, setCasing] = React.useState<"upper" | "title" | "lower">("title")
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const css = React.useMemo(
    () => `font-family: var(--font-display);\nfont-weight: ${weight};\nletter-spacing: ${tracking / 100}em;\ntext-transform: ${casing === "upper" ? "uppercase" : casing === "lower" ? "lowercase" : "none"};`,
    [weight, tracking, casing]
  )
  React.useEffect(() => {
    onSpecChange?.({ weight, tracking, case: casing, css })
  }, [weight, tracking, casing, css, onSpecChange])

  const display = casing === "upper" ? word.toUpperCase() : casing === "lower" ? word.toLowerCase() : word

  return (
    <SectionShell width={1120} rails rule="both" grain className={className}>
      <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
        <div className="relative min-h-[280px]">
          <MonoLabel className="mb-8 text-muted-foreground">WORDMARK · LIVE SPECIMEN</MonoLabel>
          <h2
            aria-label={`Wordmark: ${display}`}
            className="flex flex-wrap font-display font-black leading-[0.92] text-foreground"
            style={{ fontSize: "clamp(56px, 11vw, 148px)", letterSpacing: `${tracking / 100}em`, fontWeight: weight, textTransform: casing === "upper" ? "uppercase" : casing === "lower" ? "lowercase" : "none" }}
          >
            {display.split("").map((ch, i) => (
              <motion.span
                key={`${i}-${ch}`}
                aria-hidden
                initial={reduce ? false : { y: 42, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.028, ease: [0.22, 1, 0.36, 1] }}
                className="inline-block"
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </h2>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-dashed border-border pt-5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            <span>wght {weight}</span>
            <span>trck {tracking >= 0 ? `+${tracking}` : tracking}</span>
            <span>case {casing}</span>
            <span className="ml-auto hidden sm:block">var(--font-display)</span>
          </div>
        </div>

        <aside className="flex flex-col gap-6 rounded-xl border bg-card p-6">
          <Ordinal n={1} total={3} />
          <div>
            <label htmlFor="wl-weight" className="flex justify-between font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Weight <output htmlFor="wl-weight" className="text-foreground">{weight}</output>
            </label>
            <input id="wl-weight" type="range" min={Math.min(...weights)} max={Math.max(...weights)} step={100} value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-3 w-full accent-foreground" />
          </div>
          <div>
            <label htmlFor="wl-track" className="flex justify-between font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Tracking <output htmlFor="wl-track" className="text-foreground">{tracking >= 0 ? `+${tracking}` : tracking}</output>
            </label>
            <input id="wl-track" type="range" min={-8} max={12} step={1} value={tracking}
              onChange={(e) => setTracking(Number(e.target.value))}
              className="mt-3 w-full accent-foreground" />
          </div>
          <fieldset>
            <legend className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Case</legend>
            <div role="radiogroup" aria-label="Case" className="mt-3 grid grid-cols-3 gap-1 rounded-lg border bg-background p-1">
              {(["upper", "title", "lower"] as const).map((c) => (
                <button key={c} role="radio" aria-checked={casing === c} onClick={() => setCasing(c)}
                  className={cn("rounded-md px-2 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition-colors",
                    casing === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
                  {c}
                </button>
              ))}
            </div>
          </fieldset>
          <pre className="mt-auto overflow-x-auto rounded-lg bg-muted/60 p-4 font-mono text-[11px] leading-relaxed text-foreground" aria-label="Generated CSS">{css}</pre>
        </aside>
      </div>
    </SectionShell>
  )
}
