import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Fullscreen lightbox — a thumbnail grid that opens a full-view overlay.
// ═══ EMOTION     Gallery that respects your focus.
// ═══ SIGNATURE   Click a tile -> fullscreen lightbox with keyboard navigation.

export type LightboxFrame = { id: string; src?: string; alt?: string }

export type MediaFullscreenLightboxProps = {
  eyebrow?: string
  title?: React.ReactNode
  frames: LightboxFrame[]
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_FRAMES = [
  { id: "f1", src: "/showcase/gallery-01.webp", alt: "Showroom long shot" },
  { id: "f2", src: "/showcase/gallery-02.webp", alt: "Oak detail" },
  { id: "f3", src: "/showcase/gallery-03.webp", alt: "Brass hardware" },
  { id: "f4", src: "/showcase/gallery-04.webp", alt: "Studio corner" },
  { id: "f5", src: "/showcase/gallery-05.webp", alt: "Freshly oiled top" },
  { id: "f6", src: "/showcase/gallery-06.webp", alt: "Evening bench" },
]
export function MediaFullscreenLightbox({ eyebrow = "LIGHTBOX", title = "Look, then look closer.", frames = DEFAULT_FRAMES, tone = "paper", className }: MediaFullscreenLightboxProps) {
  const ink = tone === "ink"
  const [openIdx, setOpenIdx] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (openIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIdx(null)
      if (e.key === "ArrowRight") setOpenIdx((i) => (i === null ? i : (i + 1) % frames.length))
      if (e.key === "ArrowLeft") setOpenIdx((i) => (i === null ? i : (i - 1 + frames.length) % frames.length))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openIdx, frames.length])
  const open = openIdx !== null ? frames[openIdx] : null
  const openIdxNum = openIdx ?? 0
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
  </header>
      </InView>
      <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {frames.map((f, i) => (
          <Button type="button" key={f.id} onClick={() => setOpenIdx(i)} aria label={f.alt} variant="default" className={img-hover-wash aspect-square overflow-hidden rounded-xl border bg-muted}>
            {f.src ? <img src={f.src} alt={f.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
          
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenIdx(null)}
          >
            <Button type="button" onClick={() => setOpenIdx(null)} aria label="Close" variant="default" className={absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10}><X className="h-5 w-5" />
            <Button type="button" onClick={(e) => { e.stopPropagation(); setOpenIdx((i) => (i === null ? i : (i - 1 + frames.length) % frames.length)) }} aria label="Previous" variant="default" className={absolute left-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10}><ChevronLeft className="h-5 w-5" />
            <motion.img
              key={open.id}
              src={open.src}
              alt={open.alt ?? ""}
              className="max-h-[84vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
            <Button type="button" onClick={(e) => { e.stopPropagation(); setOpenIdx((i) => (i === null ? i : (i + 1) % frames.length)) }} aria label="Next" variant="default" className={absolute right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10}><ChevronRight className="h-5 w-5" />
            <span className="pointer-events-none absolute bottom-5 font-mono text-[11px] font-bold uppercase tracking-widest text-white/60">{openIdxNum + 1} / {frames.length}</span>
          </motion.div>
        )}
      </AnimatePresence>
    
  </div>
</section>
  )
}
