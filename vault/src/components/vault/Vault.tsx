import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: make an honest price look honest. Not "WAS 2000!! NOW 499!!" theater —
//   a ledger that adds up in front of the reader.
// EMOTION: quiet abundance; the confidence of a receipt you'd proudly frame.
// SIGNATURE MOVE: the receipt prints itself — dashed perforation at top and
//   bottom, lines dropping in mono one after another, each value right in
//   its column; the total arrives last with a rubber-stamp settle (rotate +
//   slight scale overshoot, then perfect stillness).
// ─────────────────────────────────────────────────────────────────────────────

export type VaultLine = {
  label: string
  /** string price "890 kr" or number rendered with `unit`. Use "-" for free. */
  value: string | number
  /** Struck-through "worth" figure, shown muted right of value. */
  worth?: string
}

export type VaultProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  lines: VaultLine[]
  totalLabel?: string
  total: string
  note?: string
  cta?: { label: string; href?: string; onClick?: () => void }
  unit?: string
  className?: string
}

export function Vault({
  eyebrow = "What you actually get",
  title = "The full session, priced honestly",
  subtitle,
  lines,
  totalLabel = "Included",
  total,
  note,
  cta,
  className,
}: VaultProps) {
  const reduce = useReducedMotion()
  return (
    <section className={cn("w-full bg-muted/40 text-foreground", className)} aria-label={title}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
        <div className="mx-auto grid w-full max-w-[1080px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-center lg:py-24">
          <div className="max-w-md">
            {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>}
            <h2 className="mt-2 font-display text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl">{title}</h2>
            {subtitle && <p className="mt-4 text-[15px] font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            {cta &&
              (cta.href ? (
                <a href={cta.href} onClick={cta.onClick} className="mt-8 inline-flex h-12 items-center rounded-full bg-foreground px-8 font-display text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  {cta.label}
                </a>
              ) : (
                <button type="button" onClick={cta.onClick} className="mt-8 inline-flex h-12 items-center rounded-full bg-foreground px-8 font-display text-sm font-extrabold tracking-tight text-background transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  {cta.label}
                </button>
              ))}
          </div>

          {/* the receipt */}
          <div className="mx-auto w-full max-w-[420px]">
            <div aria-hidden className="h-3 bg-[repeating-linear-gradient(90deg,transparent_0_6px,hsl(var(--foreground)/0.35)_6px_12px)] [mask-image:radial-gradient(circle_at_bottom,transparent_65%,black_66%)] [transform:scaleY(-1)]" />
            <div className="rounded-[4px] bg-background px-6 py-7 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.45)]">
              <p className="text-center font-display text-lg font-black uppercase tracking-[0.35em]">{totalLabel}</p>
              <div className="my-4 border-t-2 border-dashed border-border" />
              <ul className="flex flex-col gap-3">
                {lines.map((l, i) => (
                  <motion.li
                    key={l.label}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.3 }}
                    className="grid grid-cols-[16px_1fr_auto] items-baseline gap-2 text-sm"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 translate-y-0.5 opacity-60" />
                    <span className="font-mono text-[12px] font-semibold leading-snug">{l.label}</span>
                    <span className="whitespace-nowrap font-mono text-[13px] font-black tabular-nums">{l.value}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="my-4 border-t-2 border-dashed border-border" />
              <div className="flex items-end justify-between">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Today {note ? `· ${note}` : ""}
                </p>
                <motion.p
                  initial={reduce ? false : { rotate: -8, scale: 1.25, opacity: 0 }}
                  whileInView={{ rotate: -2, scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.05 + lines.length * 0.06, duration: 0.55 }}
                  className="rounded-md border-2 border-foreground px-3 py-0.5 font-display text-2xl font-black tracking-tighter"
                >
                  {total}
                </motion.p>
              </div>
            </div>
            <div aria-hidden className="h-3 bg-[repeating-linear-gradient(90deg,transparent_0_6px,hsl(var(--foreground)/0.35)_6px_12px)] [mask-image:radial-gradient(circle_at_bottom,transparent_65%,black_66%)]" />
          </div>
        </div>
      </InView>
    </section>
  )
}
