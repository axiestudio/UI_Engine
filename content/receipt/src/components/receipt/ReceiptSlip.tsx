import * as React from "react"
import { Check, Download } from "lucide-react"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Noise from "@/components/primitives/noise"

// ── Types ────────────────────────────────────────────────────────────────────
export type ReceiptLine = {
  label: string
  /** Optional quantity, e.g. 2. */
  qty?: number
  /** Formatted amount, e.g. "$24.00". */
  amount: string
}

export type ReceiptMeta = { label: string; value: string }

export type ReceiptSlipProps = {
  brand?: string
  /** e.g. "Receipt #A-1024". */
  title?: string
  date?: string
  lines?: ReceiptLine[]
  subtotal?: string
  tax?: string
  /** Formatted grand total. Defaults to the sum sample. */
  total?: string
  meta?: ReceiptMeta[]
  /** Stamp text rotated over the slip. Default "PAID". */
  stamp?: string
  note?: string
  primaryAction?: { label: string; href?: string; onClick?: () => void }
  tone?: "paper" | "ink"
  className?: string
}

// ── ReceiptSlip ──────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · JOB: confirm the transaction with dignity · EMOTION: assured, formal.
// · SIGNATURE: a printed receipt SLIP — perforated tears top and bottom with
//   punched notches, mono ledger rows over dashed hairlines, a barcode strip
//   and a rotated stamp. It should feel like thermal paper, not a card.
// · Numbers align on tabular-nums; the total row is the one heavy rule on the
//   slip. The stamp (default PAID) sits at -8° with a double ring, like a
//   rubber stamp pressed after the fact.
export function ReceiptSlip({
  brand = "Aurum Studio",
  title = "Receipt #A-1024",
  date = "2026-08-30",
  lines,
  subtotal,
  tax,
  total,
  meta,
  stamp = "PAID",
  note,
  primaryAction,
  tone = "paper",
  className,
}: ReceiptSlipProps) {
  const ink = tone === "ink"
  const rows: ReceiptLine[] = lines ?? [
    { label: "Studio plan — monthly", amount: "$24.00" },
    { label: "Extra location", qty: 2, amount: "$14.00" },
    { label: "SMS reminders", amount: "$3.20" },
  ]
  const sum = total ?? "$41.20"

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate flex w-full items-center justify-center overflow-hidden", className)}
      aria-label={title}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden"><Noise patternAlpha={Math.round((ink ? 0.06 : 0.045) * 255)} patternSize={240} patternRefreshInterval={3} /></span>

      <div className="relative mx-auto w-full max-w-[820px] px-4 py-20 sm:px-6 sm:py-24">
        <InView
          variants={{ hidden: { opacity: 0, y: 26, rotate: 1.5 }, visible: { opacity: 1, y: 0, rotate: 0 } }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-60px" }}
        >
          {/* the slip */}
          <div
            className={cn(
              "relative mx-auto w-full max-w-[420px] border bg-card",
              ink ? "border-background/20 text-foreground" : "border-border text-foreground shadow-[0_32px_64px_-40px_hsl(0_0%_0%/0.35)]",
            )}
          >
            {/* perforated top — punched notches */}
            <span aria-hidden>
              <span className={cn("absolute -left-[7px] -top-[7px] size-3.5 rounded-full", ink ? "bg-foreground" : "bg-background")} />
              <span className={cn("absolute -right-[7px] -top-[7px] size-3.5 rounded-full", ink ? "bg-foreground" : "bg-background")} />
              <span className={cn("absolute inset-x-4 top-0 border-t-2 border-dashed", ink ? "border-background/30" : "border-border")} />
            </span>

            <div className="px-7 pb-7 pt-8">
              <span aria-hidden className={cn("pointer-events-none absolute inset-0", cn("w-fit text-foreground/20", ink && "text-foreground/30"))}>
    <span className="absolute border-current top-[-5px] left-[-5px] border-t border-l" style={{ width: 10, height: 10 }} />
    <span className="absolute border-current top-[-5px] right-[-5px] border-t border-r" style={{ width: 10, height: 10 }} />
    <span className="absolute border-current bottom-[-5px] left-[-5px] border-b border-l" style={{ width: 10, height: 10 }} />
    <span className="absolute border-current bottom-[-5px] right-[-5px] border-b border-r" style={{ width: 10, height: 10 }} />
  </span>

              {/* header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-base font-bold tracking-[-0.01em]">{brand}</p>
                  <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                </div>
                <p className="pt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{date}</p>
              </div>

              <div className={cn("mt-5 border-t border-dashed", ink ? "border-foreground/15" : "border-border")} />

              {/* ledger */}
              <dl className="mt-5 flex flex-col">
                {rows.map((l, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="text-[13px] font-medium text-muted-foreground">
                      {l.label}
                      {typeof l.qty === "number" && l.qty !== 1 && <span className="ml-1.5 font-mono text-[10px] font-bold text-muted-foreground/70">×{l.qty}</span>}
                    </dt>
                    <dd className="font-mono text-[13px] font-bold tabular-nums">{l.amount}</dd>
                  </div>
                ))}
              </dl>

              <div className={cn("mt-2 border-t border-dashed", ink ? "border-foreground/15" : "border-border")} />

              {/* sums */}
              <div className="mt-4 flex flex-col gap-1.5">
                {subtotal && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-medium text-muted-foreground">Subtotal</span>
                    <span className="font-mono text-[13px] font-bold tabular-nums text-muted-foreground">{subtotal}</span>
                  </div>
                )}
                {tax && (
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] font-medium text-muted-foreground">Tax (VAT 25%)</span>
                    <span className="font-mono text-[13px] font-bold tabular-nums text-muted-foreground">{tax}</span>
                  </div>
                )}
                <div className={cn("mt-2 flex items-baseline justify-between border-t-2 pt-3", ink ? "border-foreground/30" : "border-foreground/70")}>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Total</span>
                  <span className="font-display text-xl font-bold tabular-nums tracking-[-0.02em]">{sum}</span>
                </div>
              </div>

              {/* meta */}
              {meta && meta.length > 0 && (
                <div className={cn("mt-6 border-t border-dashed pt-4", ink ? "border-foreground/15" : "border-border")}>
                  {meta.map((m, i) => (
                    <div key={i} className="flex items-baseline justify-between py-1">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">{m.label}</span>
                      <span className="font-mono text-[11px] font-bold tabular-nums">{m.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* barcode strip — the machine-readable sign-off */}
              <div aria-hidden className={cn("mt-7 flex h-10 items-stretch justify-center gap-[2px]", ink ? "text-foreground" : "text-foreground")}>
                {barcodeWidths().map((w, i) => (
                  <span key={i} className="h-full bg-current" style={{ width: w, opacity: i % 3 === 2 ? 0.55 : 1 }} />
                ))}
              </div>
              <p className="mt-2 text-center font-mono text-[9px] font-bold uppercase tracking-[0.35em] text-muted-foreground/70">A1024-2026-SE</p>

              {note && <p className="mt-5 text-center text-xs font-medium leading-relaxed text-muted-foreground">{note}</p>}
            </div>

            {/* perforated bottom */}
            <span aria-hidden className="relative block h-2.5">
              <span className={cn("absolute inset-x-4 top-0 border-t-2 border-dashed", ink ? "border-background/30" : "border-border")} />
              <span className={cn("absolute -left-[7px] top-1 size-3.5 rounded-full", ink ? "bg-foreground" : "bg-background")} />
              <span className={cn("absolute -right-[7px] top-1 size-3.5 rounded-full", ink ? "bg-foreground" : "bg-background")} />
            </span>

            {/* the stamp */}
            <span
              aria-hidden
              className="pointer-events-none absolute right-5 top-16 inline-flex -rotate-[8deg] items-center justify-center rounded-md border-[2.5px] border-destructive/70 px-4 py-1.5 font-mono text-sm font-bold uppercase tracking-[0.3em] text-destructive/80"
            >
              {stamp}
              <span className="absolute inset-1 rounded-sm border border-destructive/40" />
            </span>
          </div>

          {/* action */}
          {primaryAction && (
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                asChild={Boolean(primaryAction.href)}
                onClick={primaryAction.onClick}
                className="group h-12 rounded-full px-7 text-sm font-semibold shadow-sm transition-all hover:shadow-md"
              >
                {primaryAction.href ? (
                  <a href={primaryAction.href} className="inline-flex items-center gap-2">
                    <Download className="size-4" aria-hidden />
                    {primaryAction.label}
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <Check className="size-4" aria-hidden />
                    {primaryAction.label}
                  </span>
                )}
              </Button>
            </div>
          )}
        </InView>
      </div>
    </section>
  )
}

// deterministic barcode widths — stable between server and client
function barcodeWidths(): number[] {
  const widths: number[] = []
  let h = 1024
  for (let i = 0; i < 32; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    widths.push(1 + (h % 3))
  }
  return widths
}
