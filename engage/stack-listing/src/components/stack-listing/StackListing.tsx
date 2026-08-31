import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// The layer components — media, price head, facts band, agent, viewing base.
import { ListingMedia } from "./layers/ListingMedia"
import { ListingHead } from "./layers/ListingHead"
import { ListingFacts } from "./layers/ListingFacts"
import { ListingAgent } from "./layers/ListingAgent"
import { ListingBase } from "./layers/ListingBase"

// ═══ JOB         Make someone book the viewing from the card alone.
// ═══ EMOTION     Walking through the front door already.
// ═══ SIGNATURE   The stack settles like a brochure flipping shut: media
//                 drops, price slides from the left, facts rise, agent and
//                 base follow — five components, one listing. Swap the media
//                 layer for a carousel and the rest holds.

export type StackListingProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  media?: { src?: string; alt?: string; badge?: string }
  head?: { price: string; address: string; area?: string }
  facts?: { beds?: string; baths?: string; size?: string }
  agent?: { name: string; firm?: string; phone?: string }
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function StackListing({
  eyebrow = "STACK · LISTING",
  title = "A home, stacked on one card.",
  subtitle = "Media band, price head, facts strip, agent row and viewing base are separate components — swap any layer (a gallery for the photo, an auction module for the base) and the card still holds.",
  media = { src: "/showcase/content/content-04-architecture.webp", alt: "Light-filled townhouse, west facade", badge: "Open house Sun 12–14" },
  head = { price: "4 850 000 kr", address: "Klostergatan 12, Jönköping", area: "Väster" },
  facts = { beds: "4 rooms", baths: "2 baths", size: "118 m²" },
  agent = { name: "Elin Sandberg", firm: "Mäklarhuset Väster", phone: "+46 709 93 48 93" },
  caption = "FIVE LAYER COMPONENTS · ONE LISTING",
  tone = "paper",
  className,
}: StackListingProps) {
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
          <div className="mx-auto max-w-[460px]">
            <div
              className={cn(
                "overflow-hidden rounded-[18px] border bg-card shadow-[0_26px_56px_-30px_hsl(var(--foreground)/0.45)]",
                ink ? "border-background/15" : "border-border",
              )}
            >
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}>
                <ListingMedia src={media.src} alt={media.alt} badge={media.badge} />
              </motion.div>
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}>
                <ListingHead price={head.price} address={head.address} area={head.area} />
              </motion.div>
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.42 }}>
                <ListingFacts beds={facts.beds} baths={facts.baths} size={facts.size} />
              </motion.div>
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.54 }}>
                <ListingAgent name={agent.name} firm={agent.firm} phone={agent.phone} />
              </motion.div>
              <motion.div initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.66 }}>
                <ListingBase />
              </motion.div>
            </div>
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mx-auto mt-8 flex max-w-[460px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
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
