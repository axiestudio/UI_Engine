import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// The layer components — head, progress band, backer tiers (repeat), humans, base.
import { FundHead } from "./layers/FundHead"
import { FundProgress } from "./layers/FundProgress"
import { FundTier } from "./layers/FundTier"
import { FundBackers } from "./layers/FundBackers"
import { FundBase } from "./layers/FundBase"

// ═══ JOB         Turn interest into a pledge, in one object.
// ═══ EMOTION     Being in on it — the counter climbs, the tiers fill.
// ═══ SIGNATURE   The tiers are the fillings: select one and the base CTA
//                 reads its amount ("Back this project · 250 kr"). Progress
//                 rail draws on entry; head, tiers, humans and base are
//                 separate imports.

export type FundTierDef = { amount: string; name: string; perks: string; left?: string; soldOut?: boolean }

export type StackFundProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  campaign?: { title: string; maker?: string }
  progress?: { raised?: string; goal?: string; percent?: number; backers?: string; daysLeft?: string }
  tiers?: FundTierDef[]
  backers?: { names?: string[]; more?: number }
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackFund({
  eyebrow = "STACK · FUNDRAISER",
  title = "Pick a tier. Fund the thing.",
  subtitle = "Campaign band, progress rail, backer tiers and the pledge base are separate components — tiers repeat like fillings, and the base CTA reads whichever one you chose.",
  campaign = { title: "The Chair No. 03 rebuild — a real workshop run", maker: "Quiet Times Workshop" },
  progress = { raised: "48 120 kr", goal: "of 75 000 kr", percent: 64, backers: "212 backers", daysLeft: "9 days left" },
  tiers = [
    { amount: "150 kr", name: "A postcard", perks: "Polaroid from the rebuild night, signed by the floor.", left: "unlimited" },
    { amount: "250 kr", name: "The zine", perks: "The rebuild zine + your name in the maker ledger.", left: "38" },
    { amount: "900 kr", name: "Name on a chair", perks: "A chair plaque engraved with your name. You pick the chair.", left: "6" },
    { amount: "2 500 kr", name: "The whole kit", perks: "Everything above + the first cut on opening night.", left: "2" },
    { amount: "5 000 kr", name: "Gold scissors", perks: "You cut the ribbon. That's it. That's the tier.", left: "1" },
  ],
  backers = { names: ["Klara L.", "Oskar B.", "Elin S.", "Vera O.", "Mika A."], more: 207 },
  caption = "FIVE LAYER COMPONENTS · SELECTABLE FILLINGS",
  tone = "paper",
  className,
}: StackFundProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const [selected, setSelected] = React.useState<number | null>(1)
  const sel = selected !== null ? tiers[selected] : null

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
          <div className="mx-auto max-w-[520px]">
            <div
              className={cn(
                "overflow-hidden rounded-[18px] border bg-card shadow-[0_26px_56px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <FundHead title={campaign.title} maker={campaign.maker} />
              <FundProgress raised={progress.raised} goal={progress.goal} percent={progress.percent} backers={progress.backers} daysLeft={progress.daysLeft} />

              {/* tiers — the selectable fillings */}
              <div role="radiogroup" aria-label="Backer tiers">
                {tiers.map((tier, i) => (
                  <motion.div
                    key={tier.name}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.07 }}
                  >
                    <FundTier
                      amount={tier.amount}
                      name={tier.name}
                      perks={tier.perks}
                      left={tier.left}
                      soldOut={tier.soldOut}
                      selected={selected === i}
                      onSelect={() => setSelected(i)}
                    />
                  </motion.div>
                ))}
              </div>

              <FundBackers names={backers.names} more={backers.more} />
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
              >
                <FundBase amount={sel ? sel.amount : null} />
              </motion.div>
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[520px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
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
