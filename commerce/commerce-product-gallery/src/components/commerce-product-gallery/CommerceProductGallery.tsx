import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Product gallery — a main frame with thumbs and a zoom-on-hover main.
// ═══ EMOTION     Inspect before you buy.
// ═══ SIGNATURE   A selected main image + thumbnail rail + crossfade between frames.

export type GalleryFrame = { id: string; src?: string; alt?: string }

export type CommerceProductGalleryProps = {
  eyebrow?: string
  name?: string
  price?: string
  frames: GalleryFrame[]
  className?: string
}

export function CommerceProductGallery({ eyebrow = "PRODUCT", name = "The Chair, No. 04", price = "€890", frames, className }: CommerceProductGalleryProps) {
  const [sel, setSel] = React.useState(0)
  const cur = frames[sel]
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <InView once variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
              {frames.map((f, i) => (
                <motion.img key={f.id} src={f.src} alt={f.alt ?? ""} className="absolute inset-0 h-full w-full object-cover"
                  initial={false} animate={{ opacity: i === sel ? 1 : 0, scale: i === sel ? 1 : 1.05 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              {frames.map((f, i) => (
                <button key={f.id} type="button" onClick={() => setSel(i)} aria-label={f.alt ?? `Frame ${i + 1}`}
                  className={cn("img-hover-wash h-16 w-20 overflow-hidden rounded-lg border transition-all", i === sel ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100")}>
                  {f.src ? <img src={f.src} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
                </button>
              ))}
            </div>
          </div>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{eyebrow}</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em]">{name}</h2>
            <p className="mt-2 font-display text-2xl font-semibold">{price}</p>
            <p className="mt-4 text-sm font-medium leading-relaxed text-muted-foreground">Solid oak, hand-finished. Ships in three frames so you can look at it from every side before it ships.</p>
            <div className="mt-6 flex gap-3">
              <Button size="lg" className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Add to bag</Button>
              <Button size="lg" variant="outline" className="h-11 rounded-full px-6 font-mono text-[11px] font-bold uppercase tracking-[0.12em]">Details</Button>
            </div>
            <dl className="mt-8 space-y-2 border-t pt-4 text-sm">
              {[["Material", "Solid oak"], ["Finish", "Natural oil"], ["Lead time", "2–3 weeks"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </InView>
      </div>
    </SectionShell>
  )
}
