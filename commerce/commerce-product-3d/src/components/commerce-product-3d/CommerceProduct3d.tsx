import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Product 3D — a draggable product face that tilts in 3D.
// ═══ EMOTION     Tangible product.
// ═══ SIGNATURE   A pointer-tracking 3D face with selectable colorways + price.

export type Colorway = { id: string; label: string; swatch: string }

export type CommerceProduct3dProps = {
  eyebrow?: string
  title?: React.ReactNode
  price?: number
  colorways?: Colorway[]
  className?: string
}

export function CommerceProduct3d({ eyebrow = "PRODUCT", title = "Held like a thing.", price = 89, colorways = [
  { id: "ink", label: "Ink", swatch: "hsl(var(--foreground))" },
  { id: "cream", label: "Cream", swatch: "hsl(var(--muted))" },
  { id: "amber", label: "Amber", swatch: "hsl(var(--site-accent))" },
], className }: CommerceProduct3dProps) {
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [-18, 18]), { stiffness: 120, damping: 16 })
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [18, -18]), { stiffness: 120, damping: 16 })
  const [active, setActive] = React.useState(colorways[0].id)
  const cw = colorways.find((c) => c.id === active) ?? colorways[0]
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <InView once variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div
            className="grid cursor-grab place-items-center [perspective:900px] active:cursor-grabbing"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              px.set((e.clientX - r.left) / r.width - 0.5)
              py.set((e.clientY - r.top) / r.height - 0.5)
            }}
            onPointerLeave={() => { px.set(0); py.set(0) }}
          >
            <motion.div
              className="h-64 w-64 rounded-xl shadow-2xl"
              style={{ background: cw.swatch, rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            />
            <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">drag to tilt</p>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="font-display text-2xl font-semibold">€{price}</p>
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">A tactile product card — move your pointer to see it in three dimensions.</p>
            <div className="mt-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Colorway</p>
              <div className="mt-2 flex gap-2">
                {colorways.map((c) => (
                  <button key={c.id} type="button" onClick={() => setActive(c.id)} aria-label={c.label} className={cn("h-9 w-9 rounded-full border ring-offset-2 transition-shadow", active === c.id && "ring-2 ring-foreground")} style={{ background: c.swatch }} />
                ))}
              </div>
            </div>
            <Button size="lg" className="mt-6 h-11 rounded-full px-7 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Add to cart</Button>
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
