import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Configurator — pick options and see the product + price update live.
// ═══ EMOTION     Playful, decisive.
// ═══ SIGNATURE   Option groups (color/size) that recompute the live preview + price.

export type ConfigOption = { id: string; label: string; price?: number; swatch?: string }
export type ConfigGroup = { id: string; label: string; options: ConfigOption[] }

export type InteractiveConfiguratorProps = {
  eyebrow?: string
  title?: React.ReactNode
  basePrice?: number
  groups: ConfigGroup[]
  currency?: string
  className?: string
}

export function InteractiveConfigurator({ eyebrow = "CONFIGURE", title = "Make it yours.", basePrice = 120, groups, currency = "€", className }: InteractiveConfiguratorProps) {
  const [selected, setSelected] = React.useState<Record<string, string>>({})
  const total = React.useMemo(() => {
    let t = basePrice
    for (const g of groups) {
      const opt = g.options.find((o) => o.id === selected[g.id])
      if (opt?.price) t += opt.price
    }
    return t
  }, [basePrice, groups, selected])
  const previewColor = groups[0]?.options.find((o) => o.id === selected[groups[0].id])?.swatch ?? "hsl(var(--primary))"

  const toggle = (gid: string, oid: string) => setSelected((s) => ({ ...s, [gid]: s[gid] === oid ? s[gid] : oid }))

  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className="sticky top-8">
            <motion.div animate={{ backgroundColor: previewColor }} className="aspect-square overflow-hidden rounded-[28px] border shadow-2xl" transition={{ duration: 0.5 }}>
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-black/5 to-transparent">
                <span className="font-display text-7xl font-bold text-white/90 drop-shadow-lg">◓</span>
              </div>
            </motion.div>
            <div className="mt-4 rounded-xl border p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</p>
              <p className="font-display text-4xl font-bold">{currency}{total.toFixed(0)}</p>
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div className="space-y-8">
            {groups.map((g) => (
              <div key={g.id}>
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{g.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.options.map((o) => (
                    <button key={o.id} type="button" onClick={() => toggle(g.id, o.id)}
                      className={cn("flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", selected[g.id] === o.id ? "bg-foreground text-background" : "hover:bg-accent")}>
                      {o.swatch && <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: o.swatch }} />}
                      {o.label}{o.price ? ` +€${o.price}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
