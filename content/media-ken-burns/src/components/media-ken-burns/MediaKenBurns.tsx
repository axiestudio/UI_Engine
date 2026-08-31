import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Ken Burns — slow, continuous drift across a frame.
// ═══ EMOTION     Timeless, cinematic.
// ═══ SIGNATURE   Images that slowly zoom/pan on a loop with a caption.

export type KenBurnsFrame = { id: string; src?: string; alt?: string; caption?: string }

export type MediaKenBurnsProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: KenBurnsFrame[]
  interval?: number
  className?: string
}

export function MediaKenBurns({ eyebrow = "MOTION", title = "A slow drift.", frames, interval = 7000, className }: MediaKenBurnsProps) {
  const [idx, setIdx] = React.useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % frames.length), interval)
    return () => clearInterval(t)
  }, [frames.length, interval])
  const f = frames[idx]
  return (
    <SectionShell width={1120} grain rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} />
      </InView>
      <InView once variants={{ hidden: { opacity: 0, scale: 0.98 }, visible: { opacity: 1, scale: 1 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
        <div className="relative mt-10 overflow-hidden rounded-2xl border bg-foreground">
          <div className="aspect-[21/9]">
            {f.src ? (
              <motion.img
                key={f.id}
                src={f.src}
                alt={f.alt ?? ""}
                className="h-full w-full object-cover"
                initial={{ scale: 1.05 }} animate={{ scale: 1.22 }}
                transition={{ duration: interval / 1000, ease: "linear" }}
              />
            ) : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            {f.caption && <span className="absolute bottom-4 left-4 rounded-full bg-black/50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">{f.caption}</span>}
          </div>
          <div className="flex justify-center gap-2 py-3">
            {frames.map((fr, i) => <button key={fr.id} type="button" onClick={() => setIdx(i)} aria-label={`Frame ${i + 1}`} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-foreground" : "w-1.5 bg-muted-foreground/40")} />)}
          </div>
        </div>
      </InView>
    </SectionShell>
  )
}
