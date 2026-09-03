import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import TiltedCard from "@/components/reactbits/TiltedCard"
import { cn } from "@/lib/utils"

// ═══ JOB         Product 3D — a draggable product face that tilts in 3D.
// ═══ EMOTION     Tangible product.
// ═══ SIGNATURE   A pointer-tracked 3D tilt with selectable colorways + price —
//                 the tilt choreography is React Bits' TiltedCard (vendored),
//                 the product story is ours.

export type Colorway = { id: string; label: string; swatch: string; src: string; alt?: string }

export type CommerceProduct3dProps = {
  eyebrow?: string
  title?: React.ReactNode
  price?: number
  colorways?: Colorway[]
  className?: string
}

export function CommerceProduct3d({ eyebrow = "PRODUCT", title = "Interactive preview", price = 89, colorways = [
  { id: "ink", label: "Ink", swatch: "hsl(var(--foreground))", src: "/frames/frame_0002.webp", alt: "Ink colorway" },
  { id: "cream", label: "Cream", swatch: "hsl(var(--muted))", src: "/frames/frame_0005.webp", alt: "Cream colorway" },
  { id: "amber", label: "Amber", swatch: "hsl(var(--site-accent))", src: "/frames/frame_0009.webp", alt: "Amber colorway" },
], className }: CommerceProduct3dProps) {
  const [active, setActive] = React.useState(colorways[0].id)
  const cw = colorways.find((c) => c.id === active) ?? colorways[0]
  return (
    <SectionShell width={920} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:items-center">
        <InView once variants={{ hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <TiltedCard
              imageSrc={cw.src}
              altText={`${cw.label} — ${String(title)}`}
              captionText={cw.label}
              containerHeight="288px"
              imageHeight="288px"
              imageWidth="288px"
              scaleOnHover={1.06}
              rotateAmplitude={16}
              showMobileWarning={false}
              showTooltip
            />
            <p className="mt-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">move your pointer to tilt</p>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div>
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl font-semibold">{title}</h3>
              <p className="font-display text-2xl font-semibold">€{price}</p>
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">A tactile product card — spring-physics tilt that follows the pointer, settled by <span className="font-mono">TiltedCard</span> from React Bits.</p>
            <div className="mt-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Colorway</p>
              <div className="mt-2 flex gap-2">
                {colorways.map((c) => (
                  <Button key={c.id} type="button" size="icon-sm" variant="outline" onClick={() => setActive(c.id)} aria-label={c.label} aria-pressed={active === c.id} className={cn("h-9 w-9 rounded-full border p-0 ring-offset-2", active === c.id && "ring-2 ring-foreground")} style={{ background: c.swatch }} />
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
