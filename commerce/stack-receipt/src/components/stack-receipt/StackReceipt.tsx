import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// The layer components — head, line items (repeat like fillings), total, base.
import { ReceiptHead } from "./layers/ReceiptHead"
import { ReceiptLine } from "./layers/ReceiptLine"
import { ReceiptTotal } from "./layers/ReceiptTotal"
import { ReceiptBase } from "./layers/ReceiptBase"

// ═══ JOB         Turn finished work into a keepsake you can hold.
// ═══ EMOTION     Receipts as ceremony — printed, torn, kept.
// ═══ SIGNATURE   The print reveal: the paper prints downward line by line
//                 (clip-path sweep), perforated edges top and bottom, and the
//                 line items are individual components you can stack freely.

export type ReceiptItemDef = { qty?: string | number; item: string; price: string; note?: string }

export type StackReceiptProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  shop?: string
  meta?: string
  items?: ReceiptItemDef[]
  total?: string
  signOff?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackReceipt({
  eyebrow = "STACK · RECEIPT",
  title = "The session, printed.",
  subtitle = "Head band, line items, total and barcode base are separate components — line items repeat like fillings. The paper prints itself downward when it enters the viewport.",
  shop = "Quiet Times Studio",
  meta = "ORDER 4812 · 31.08.26 · CHAIR 03",
  items = [
    { qty: 1, item: "Cut & style", price: "295 kr", note: "with Klara" },
    { qty: 1, item: "Colour bar", price: "460 kr", note: "ash toner" },
    { qty: 2, item: "Aftercare ritual", price: "180 kr", note: "take-home duo" },
  ],
  total = "935 kr",
  signOff = "Thank you — see you in six weeks",
  caption = "FOUR LAYER COMPONENTS · REPEATABLE FILLINGS",
  tone = "paper",
  className,
}: StackReceiptProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          <motion.div
            initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            whileInView={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0)" }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="relative mx-auto max-w-[380px]"
          >
            {/* perforated top edge */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-2 [background-image:radial-gradient(circle_at_6px_0px,var(--background)_7px,transparent_8px)] [background-size:16px_16px]"
            />
            <div
              className={cn(
                "relative rounded-sm border bg-card shadow-[0_26px_52px_-30px_hsl(var(--foreground)/0.5)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <div className="pt-4">
                <ReceiptHead shop={shop} meta={meta} />
              </div>
              {/* line items — the repeatable fillings */}
              <div className="border-t border-dashed border-border/70 px-0 pb-1 pt-2">
                {items.map((line, i) => (
                  <motion.div
                    key={line.item}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.55 + i * 0.14 }}
                  >
                    <ReceiptLine qty={line.qty} item={line.item} price={line.price} note={line.note} />
                  </motion.div>
                ))}
              </div>
              <ReceiptTotal amount={total} />
              <ReceiptBase signOff={signOff} />
            </div>
            {/* perforated bottom edge */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2 rotate-180 [background-image:radial-gradient(circle_at_6px_0px,var(--background)_7px,transparent_8px)] [background-size:16px_16px]"
            />
          </motion.div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[380px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    </SectionShell>
  )
}
