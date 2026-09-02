import * as React from "react"
import { useReducedMotion } from "motion/react"
import { TextEffect } from "@/components/primitives/text-effect"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: carry conviction for a promise ("we will call back within an hour")
//   without salesy noise. EMOTION: quiet strength, a vow — the block should
//   feel like a signature, not a banner. SIGNATURE MOVE: the sentence lands
//   word by word, ink-drying (per-word fade + gentle rise), then everything
//   below it fades in as a single held breath. TYPOGRAPHY: oversized display
//   serif, tight leading, hairline rules like ledger lines. TEXTURE: none —
//   paper only, generous negative space. RHYTHM: promise line → rule →
//   mono micro-facts, each with equal vertical air.
// ─────────────────────────────────────────────────────────────────────────────

export type PromiseFact = { label: string; value?: string }

export type PromiseProps = {
  /** The oath. Keep it one sentence. */
  statement?: string
  /** Optional words highlighted inside the statement via *asterisk* markers. */
  facts?: PromiseFact[]
  signature?: { name: string; role?: string }
  ruleLabel?: string
  className?: string
}


// Self-demo defaults: bare mount (= tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_PROMISE_STATEMENT = "If the tension is still there when you stand up, the *next session is on us*."

export function Promise({ statement = DEMO_PROMISE_STATEMENT, facts = [], signature, className }: PromiseProps) {
  const reduce = useReducedMotion()
  // *word* segments render foreground-bold (the emphasis ink in the oath)
  const segments = React.useMemo(() => {
    const re = /\*([^*]+)\*/g
    const out: { text: string; strong?: boolean }[] = []
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(statement))) {
      if (m.index > last) out.push({ text: statement.slice(last, m.index) })
      out.push({ text: m[1], strong: true })
      last = m.index + m[0].length
    }
    if (last < statement.length) out.push({ text: statement.slice(last) })
    return out
  }, [statement])

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-label="Our promise">
      <InView
        variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        viewOptions={{ once: true, margin: "-80px" }}
      >
        <div className="mx-auto w-full max-w-[820px] px-4 py-24 sm:px-6 lg:py-32">
          {/* kicker */}
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">Our promise</p>

          {/* the oath */}
          <p className="mt-8 font-display text-[34px] font-black leading-[1.08] tracking-[-0.035em] sm:text-[46px]">
            {(() => {
              const wordCount = (t: string) => t.trim().split(/\s+/).filter(Boolean).length
              let cursor = 0
              return segments.map((s, i) => {
                const d = 0.15 + cursor * 0.05
                cursor += wordCount(s.text)
                return s.strong ? (
                  reduce ? (
                    <em key={i} className="not-italic underline decoration-2 underline-offset-8">{s.text}</em>
                  ) : (
                    <TextEffect key={i} per="word" preset="slide" delay={d} as="span" className="inline">
                      {s.text.trim()}
                    </TextEffect>
                  )
                ) : reduce ? (
                  <React.Fragment key={i}>{s.text}</React.Fragment>
                ) : (
                  <TextEffect key={i} per="word" preset="fade" delay={d} as="span" className="inline text-foreground/80">
                    {s.text.trim()}
                  </TextEffect>
                )
              })
            })()}
          </p>

          {/* ledger rules + mono facts */}
          {facts.length > 0 && (
            <dl className="mt-12 border-t border-border">
              {facts.map((f, i) => (
                <InView
                  key={f.label}
                  as="div"
                  once
                  viewOptions={{ once: true, margin: "-20px" }}
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-6 border-b border-border py-4"
                >
                  <dt className="font-display text-[15px] font-bold leading-snug">{f.label}</dt>
                  <dd className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{f.value}</dd>
                </InView>
              ))}
            </dl>
          )}

          {signature && (
            <div className="mt-12 flex items-center gap-4">
              <svg width="140" height="44" viewBox="0 0 140 44" aria-hidden className="text-foreground opacity-80">
                <path
                  d="M4 32 C 14 10, 22 8, 26 22 S 38 40, 44 26 S 58 6, 66 20 S 82 38, 92 22 S 112 12, 122 30 C 128 40, 134 36, 138 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div>
                <p className="font-display text-sm font-extrabold tracking-tight">{signature.name}</p>
                {signature.role && <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{signature.role}</p>}
              </div>
            </div>
          )}
        </div>
      </InView>
    </section>
  )
}
