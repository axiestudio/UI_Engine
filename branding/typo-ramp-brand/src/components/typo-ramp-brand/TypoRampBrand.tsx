import * as React from "react"
import { cn } from "@/lib/utils"
import { SectionHead, SectionShell, Ordinal } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ═══ JOB      prove the type system holds from footnote to billboard
// ═══ EMOTION  typographic awe — the scale is the brand's skeleton
// ═══ SIGNATURE a ramp ladder of true `<button>` rungs — hovering/focusing
//               one indents and fully inks it, the rest fade to whisper;
//               the side waterfall prints every size live so the eye
//               measures the jump, and the spec plate updates as you move
//   SITE      → brand guideline typography chapter
//   APP       → type scale pickers; rungs are data
//   BUILD     buttons for real (was a focusable div with role=button and no
//             key handler); selection is announced; sizes from data not copy
//   A11Y      arrow keys walk the ladder, aria-pressed marks the rung;
//             each rung prints its px/tracking as text, not only visually

export type TypeRung = { label: string; size: number; tracking: string; use: string }

export type TypoRampBrandProps = {
  rungs?: TypeRung[]
  /** Sample string shown at each size. Defaults to "Handgloves". */
  sample?: string
  eyebrow?: string
  title?: React.ReactNode
  className?: string
  onRungSelect?: (r: TypeRung) => void
}

const DEFAULT_RUNGS: TypeRung[] = [
  { label: "Display", size: 72, tracking: "-0.035em", use: "billboards" },
  { label: "H1", size: 48, tracking: "-0.03em", use: "page openers" },
  { label: "H2", size: 34, tracking: "-0.025em", use: "section heads" },
  { label: "Body", size: 16, tracking: "0", use: "reading" },
  { label: "Micro", size: 11, tracking: "0.18em", use: "labels" },
]

export function TypoRampBrand({
  rungs = DEFAULT_RUNGS,
  sample = "Handgloves",
  eyebrow = "TYPE · THE RAMP",
  title = <>Five sizes. <em className="font-serif italic font-medium">Zero defaults.</em></>,
  className,
  onRungSelect,
}: TypoRampBrandProps) {
  const [active, setActive] = React.useState(0)
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const current = rungs[Math.min(active, rungs.length - 1)]

  const move = (next: number) => {
    const clamped = Math.max(0, Math.min(rungs.length - 1, next))
    setActive(clamped)
    refs.current[clamped]?.focus()
  }

  return (
    <SectionShell width={1120} rails className={className}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow={eyebrow} title={title} subtitle="Hover or use arrow keys. The scale is the skeleton." tone="paper" />
        {current && (
          <Badge variant="outline" className="mb-1 hidden rounded-full font-mono text-[10px] font-black uppercase tracking-[0.16em] text-foreground md:inline-flex">
            {String(current.size).padStart(2, "0")}px · {current.label} · {current.tracking === "0" ? "no track" : current.tracking}
          </Badge>
        )}
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_300px]">
        <div className="divide-y divide-border border-y" role="group" aria-label="Type ramp" onKeyDown={(e) => { if (["ArrowDown","ArrowRight"].includes(e.key)){e.preventDefault();move(active+1)} else if(["ArrowUp","ArrowLeft"].includes(e.key)){e.preventDefault();move(active-1)} }}>
          {rungs.map((r, i) => (
            <InView key={r.label} once delay={i * 0.05}>
              <Button
                ref={(el) => { refs.current[i] = el }}
                type="button"
                variant="ghost"
                aria-current={active === i ? "true" : undefined}
                aria-pressed={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => { setActive(i); onRungSelect?.(r) }}
                style={{ paddingLeft: active === i ? 24 : 0 }}
                className={cn(
                  "group flex h-auto w-full flex-wrap items-baseline justify-start gap-x-6 gap-y-1 rounded-none px-0 py-5 text-left transition-[padding,background-color] duration-300",
                  "hover:bg-transparent focus-visible:bg-transparent",
                  active === i ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <>
                  <span className="w-16 shrink-0 font-mono text-[10px] font-black uppercase tracking-[0.18em]">{r.label}</span>
                  <span
                    aria-hidden
                    className={cn("min-w-0 truncate font-display font-black leading-none transition-opacity duration-300", active === i ? "opacity-100" : "opacity-50")}
                    style={{ fontSize: `min(${r.size}px, 11vw)`, letterSpacing: r.tracking }}
                  >
                    {sample}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] font-bold tracking-[0.1em] text-muted-foreground">
                    <Ordinal n={i + 1} /> {r.size}px · use: {r.use}
                  </span>
                </>
              </Button>
            </InView>
          ))}
        </div>

        {/* live waterfall — proves the whole ramp at once, independent of selection */}
        <aside className="overflow-hidden rounded-2xl border bg-card p-5">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground">waterfall · {sample}</span>
          <div className="mt-4 space-y-3 border-t border-dashed pt-4">
            {rungs.map((r, i) => (
              <div key={`${r.label}-${i}`} className="flex items-baseline justify-between gap-3">
                <span aria-hidden className="min-w-0 truncate font-display font-black leading-none text-foreground" style={{ fontSize: `min(${r.size}px, 8vw)`, letterSpacing: r.tracking }}>
                  {sample}
                </span>
                <span className="shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                  {String(r.size).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <p aria-live="polite" className="sr-only">
        {current ? `${current.label}, ${current.size} pixels, tracking ${current.tracking}, for ${current.use}.` : ""}
      </p>
      <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        var(--font-display) · optical sizes locked · {rungs.length} rungs
      </p>
    </SectionShell>
  )
}
