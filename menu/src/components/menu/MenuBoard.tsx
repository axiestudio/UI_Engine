import * as React from "react"
import { ChefHat, Flame, Leaf } from "lucide-react"
import { Grain, MonoLabel, Ordinal } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type MenuItemTag = "veg" | "spicy" | "chef"

export type MenuItem = {
  name: string
  description?: string
  /** Formatted price, e.g. "149 kr". */
  price: string
  tags?: MenuItemTag[]
}

export type MenuSection = {
  name: string
  note?: string
  items: MenuItem[]
}

export type MenuBoardProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  sections?: MenuSection[]
  footnote?: string
  tone?: "paper" | "ink"
  className?: string
}

// ── MenuBoard ────────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · JOB: make dishes desirable · EMOTION: warmth, appetite.
// · SIGNATURE: ledger rows with DOTTED PRICE LEADERS — the print-menu DNA.
//   Dish name sits left, price right, and a dotted baseline connects them so
//   the eye rides the row. Serif-italic dish names break the grotesk.
// · Sections carry watermarked ordinals ("01"); tag icons are inline glyphs
//   (leaf / flame / chef hat), never colored chips — the menu stays ink.
// · The card is a physical menu sheet: rails on the sides like a printed
//   card, grain on top, and a colophon footnote at the end.
export function MenuBoard({
  eyebrow = "Menu",
  title = "The table",
  subtitle,
  sections,
  footnote,
  tone = "paper",
  className,
}: MenuBoardProps) {
  const ink = tone === "ink"
  const list: MenuSection[] = sections ?? [
    {
      name: "To start",
      note: "small plates",
      items: [
        { name: "Sambusa", description: "Crisp pastry, spiced lentils, house dip.", price: "65 kr", tags: ["veg"] },
        { name: "Timatim salata", description: "Tomato, onion, jalapeño — bright and sharp.", price: "59 kr", tags: ["veg", "spicy"] },
      ],
    },
    {
      name: "Mains",
      note: "with injera",
      items: [
        { name: "Doro wat", description: "Slow chicken stew, berbere, boiled egg. The house classic.", price: "179 kr", tags: ["spicy", "chef"] },
        { name: "Misir wat", description: "Red lentils simmered long in spiced butter.", price: "139 kr", tags: ["veg"] },
        { name: "Tibs", description: "Sautéed beef, rosemary, green chili — sizzling.", price: "189 kr", tags: ["chef"] },
      ],
    },
    {
      name: "Coffee ceremony",
      note: "after",
      items: [
        { name: "Buna", description: "Beans roasted at the table, three rounds.", price: "49 kr", tags: ["veg"] },
      ],
    },
  ]

  const tagGlyph: Record<MenuItemTag, React.ReactNode> = {
    veg: <Leaf className="size-3.5" aria-label="Vegetarian" />,
    spicy: <Flame className="size-3.5" aria-label="Spicy" />,
    chef: <ChefHat className="size-3.5" aria-label="Chef's choice" />,
  }

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)}
      aria-label={title}
    >
      <Grain opacity={ink ? 0.06 : 0.04} />

      <div className="relative mx-auto w-full max-w-[860px] px-4 py-20 sm:px-6 sm:py-28">
        {/* menu sheet with printed rails */}
        <div className={cn("relative mx-auto max-w-[680px] border-x px-6 sm:px-12", ink ? "border-background/15" : "border-border")}>
          {/* header */}
          <div className="pb-12 pt-2 text-center">
            {eyebrow && <MonoLabel className={cn("justify-center", ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</MonoLabel>}
            <h2 className={cn("mt-5 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-[1.02] tracking-[-0.03em]", ink ? "text-background" : "text-foreground")}>
              {title}
            </h2>
            {subtitle && (
              <p className={cn("mx-auto mt-4 max-w-[46ch] text-[15px] leading-[1.75]", ink ? "text-background/55" : "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
            <span aria-hidden className={cn("mx-auto mt-8 block w-24 border-t", ink ? "border-background/40" : "border-foreground/60")} />
          </div>

          {/* sections */}
          {list.map((section, si) => (
            <InView
              key={section.name}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-60px" }}
            >
              <section aria-label={section.name} className={cn("relative pb-12", si > 0 && "pt-2")}>
                <div className="flex items-baseline gap-4">
                  <Ordinal n={si + 1} className={ink ? "text-background/40" : "text-muted-foreground/70"} />
                  <h3 className={cn("font-display text-xl font-extrabold uppercase tracking-[0.08em]", ink ? "text-background" : "text-foreground")}>
                    {section.name}
                  </h3>
                  <span aria-hidden className={cn("-mt-0.5 h-px flex-1", ink ? "bg-background/15" : "bg-border")} />
                  {section.note && (
                    <span className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.16em]", ink ? "text-background/40" : "text-muted-foreground/80")}>
                      {section.note}
                    </span>
                  )}
                </div>

                <ul className="mt-6">
                  {section.items.map((item, ii) => (
                    <li key={item.name} className={cn("group py-3.5", ii > 0 && (ink ? "border-t border-background/[0.07]" : "border-t border-border/50"))}>
                      {/* the dotted-leader row */}
                      <div className="flex items-baseline gap-3">
                        <span className={cn("font-serif text-[17px] font-semibold italic tracking-[-0.01em]", ink ? "text-background" : "text-foreground")} style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                          {item.name}
                        </span>
                        {item.tags && item.tags.length > 0 && (
                          <span className={cn("inline-flex shrink-0 items-center gap-1", ink ? "text-background/50" : "text-muted-foreground/80")}>
                            {item.tags.map((t) => (
                              <span key={t}>{tagGlyph[t]}</span>
                            ))}
                          </span>
                        )}
                        <span aria-hidden className={cn("mx-1 flex-1 -translate-y-1 border-b border-dotted", ink ? "border-background/30" : "border-foreground/35")} />
                        <span className={cn("shrink-0 font-mono text-sm font-bold tabular-nums", ink ? "text-background" : "text-foreground")}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p className={cn("mt-1.5 max-w-[52ch] text-[13px] leading-relaxed", ink ? "text-background/50" : "text-muted-foreground")}>
                          {item.description}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </InView>
          ))}

          {/* colophon footnote */}
          <div className={cn("border-t pt-6 text-center", ink ? "border-background/15" : "border-border")}>
            <p className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.2em]", ink ? "text-background/40" : "text-muted-foreground/80")}>
              {footnote ?? "Ask us about allergens · everything baked in-house"}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
