import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Configurator multi — a two-axis configurator (color × module) with live price.
// ═══ EMOTION     Compose with constraints.
// ═══ SIGNATURE   Two option groups drive a preview + a running total, with validation.

export type CfgOption = { id: string; label: string; price?: number; swatch?: string }
export type CfgGroup = { id: string; label: string; options: CfgOption[] }

export type InteractiveConfiguratorMultiProps = {
  eyebrow?: string
  title?: React.ReactNode
  basePrice?: number
  groups: CfgGroup[]
  className?: string
}

const DEFAULT_GROUPS = [
  { id: "wood", label: "Timber", options: [
    { id: "oak", label: "White oak", price: 0, swatch: "#c9b18c" },
    { id: "walnut", label: "Black walnut", price: 480, swatch: "#5d4a38" },
    { id: "ash", label: "Ash", price: -120, swatch: "#e2d6bf" },
  ]},
  { id: "finish", label: "Finish", options: [
    { id: "oil", label: "Hardwax oil", price: 0, swatch: "#b99b72" },
    { id: "soap", label: "White soap", price: 90, swatch: "#e8ddc9" },
    { id: "black", label: "Black stain", price: 140, swatch: "#2f2b28" },
  ]},
  { id: "hardware", label: "Hardware", options: [
    { id: "brass", label: "Unlacquered brass", price: 110, swatch: "#b08d57" },
    { id: "steel", label: "Blackened steel", price: 0, swatch: "#3a3a3a" },
  ]},
]
export function InteractiveConfiguratorMulti({ eyebrow = "COMPOSE", title = "Two axes, one build.", basePrice = 340, groups = DEFAULT_GROUPS, className }: InteractiveConfiguratorMultiProps) {
  const [sel, setSel] = React.useState<Record<string, string>>(() => Object.fromEntries(groups.map((g) => [g.id, g.options[0].id])))
  const total = React.useMemo(() => {
    let t = basePrice
    for (const g of groups) {
      const o = g.options.find((o) => o.id === sel[g.id])
      if (o?.price) t += o.price
    }
    return t
  }, [basePrice, groups, sel])
  const colorOpt = groups.find((g) => g.options[0].swatch)
  const preview = colorOpt?.options.find((o) => o.id === sel[colorOpt.id])?.swatch ?? "hsl(var(--primary))"
  const toggle = (gid: string, oid: string) => setSel((s) => ({ ...s, [gid]: oid }))
  return (
    <SectionShell width={1120} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <InView once variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div className="sticky top-8">
            <motion.div className="grid aspect-square place-items-center overflow-hidden rounded-[28px] border shadow-2xl"
              animate={{ backgroundColor: preview }} transition={{ duration: 0.5 }}>
              <div className="grid grid-cols-2 gap-1 p-10">
                {groups.map((g) => (
                  <span key={g.id} className="h-10 w-10 rounded-lg border border-black/10 bg-background/60" />
                ))}
              </div>
            </motion.div>
            <div className="mt-4 flex items-center justify-between rounded-xl border bg-card shadow-sm p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Running total</p>
              <p className="font-display text-3xl font-bold tabular-nums">€{total}</p>
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div className="space-y-8">
            {groups.map((g) => (
              <div key={g.id}>
                <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{g.label}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.options.map((o) => (
                    <button key={o.id} type="button" onClick={() => toggle(g.id, o.id)}
                      className={cn("flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest transition-colors", sel[g.id] === o.id ? "border-foreground bg-foreground text-background" : "hover:bg-accent")}>
                      {o.swatch && <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: o.swatch }} />}
                      {o.label}{o.price ? ` +€${o.price}` : ""}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <Button size="lg" className="h-11 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-widest">Add build to bag</Button>
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
