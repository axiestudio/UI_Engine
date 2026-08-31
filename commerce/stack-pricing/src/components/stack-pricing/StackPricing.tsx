import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// The layer components — top bun, price, perk fillings, base.
import { PlanTop } from "./layers/PlanTop"
import { PlanPrice } from "./layers/PlanPrice"
import { PlanPerk } from "./layers/PlanPerk"
import { PlanBase } from "./layers/PlanBase"

// ═══ JOB         Assemble a pricing card from its natural layers.
// ═══ EMOTION     Decision clarity — nothing hidden between the buns.
// ═══ SIGNATURE   The stack reveal: top, price, perks and base drop in as
//                 separate layers with a spring stagger, then the popular
//                 card lifts on hover like it's ready to be picked up.

export type PricingPlanDef = {
  id: string
  name: string
  tag?: string
  popular?: boolean
  amount: string
  period?: string
  priceNote?: string
  perks: { label: string; included?: boolean }[]
  cta: string
  fine?: string
}

export type StackPricingProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  plans?: PricingPlanDef[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackPricing({
  eyebrow = "STACK · PRICING",
  title = "A plan, built from layers.",
  subtitle = "Top band, price, perk rows and CTA base are separate components — compose the card your product needs. Fillings repeat: add or remove perks as real components, not config flags.",
  plans = [
    {
      id: "standard", name: "Standard", tag: "for one chair", amount: "249", period: "/ month",
      priceNote: "billed yearly · cancel anytime",
      perks: [
        { label: "Bookings & reminders" },
        { label: "One chair, one calendar" },
        { label: "Client notes & history" },
        { label: "Payroll exports", included: false },
      ],
      cta: "Start standard", fine: "14 days free · no card",
    },
    {
      id: "studio", name: "Studio", tag: "for the whole floor", popular: true, amount: "649", period: "/ month",
      priceNote: "billed yearly · cancel anytime",
      perks: [
        { label: "Everything in Standard" },
        { label: "Unlimited chairs & staff" },
        { label: "Payroll exports" },
        { label: "Priority human support" },
      ],
      cta: "Start studio", fine: "14 days free · no card",
    },
  ],
  caption = "FOUR LAYER COMPONENTS · ONE CARD",
  tone = "paper",
  className,
}: StackPricingProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {plans.map((plan, pi) => (
          <InView
            key={plan.id}
            once
            variants={{ hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 + pi * 0.08 }}
          >
            <motion.figure
              whileHover={reduce ? undefined : { y: -6 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className={cn(
                "relative flex h-full flex-col overflow-hidden rounded-[18px] border bg-card shadow-[0_20px_48px_-28px_hsl(var(--foreground)/0.4)]",
                ink ? "border-background/15" : "border-border",
                plan.popular && "ring-2 ring-primary",
              )}
            >
              {/* the stack — each layer enters separately */}
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <PlanTop name={plan.name} tag={plan.tag} popular={plan.popular} />
              </motion.div>
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.32 }}
              >
                <PlanPrice amount={plan.amount} period={plan.period} note={plan.priceNote} />
              </motion.div>
              <ul className="mt-2 flex-1">
                {plan.perks.map((perk, i) => (
                  <motion.li
                    key={perk.label}
                    className="contents"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.44 + i * 0.06 }}
                  >
                    <PlanPerk included={perk.included}>{perk.label}</PlanPerk>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                className="mt-auto"
              >
                <PlanBase cta={plan.cta} fine={plan.fine} />
              </motion.div>
            </motion.figure>
          </InView>
        ))}
      </div>

      <InView
        once
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <figcaption
          className={cn(
            "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
            ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
          )}
        >
          <span>{caption}</span>
          <span aria-hidden>●</span>
        </figcaption>
      </InView>
    </SectionShell>
  )
}
