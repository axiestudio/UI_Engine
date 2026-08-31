import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

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

export function MediaFullscreenLightbox({ eyebrow = "LIGHTBOX", title = "Look, then look closer.", frames, tone = "paper", className }: MediaFullscreenLightboxProps) {
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
    <SectionShell tone={tone} width={1120} grain={!ink} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} tone={tone} />
      </InView>
      <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {frames.map((f, i) => (
          <button key={f.id} type="button" onClick={() => setOpenIdx(i)} className="img-hover-wash aspect-square overflow-hidden rounded-xl border bg-muted" aria-label={f.alt}>
            {f.src ? <img src={f.src} alt={f.alt ?? ""} className="h-full w-full object-cover" loading="lazy" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-muted" />}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenIdx(null)}
          >
            <button type="button" className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10" onClick={() => setOpenIdx(null)} aria-label="Close"><X className="h-5 w-5" /></button>
            <button type="button" className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setOpenIdx((i) => (i === null ? i : (i - 1 + frames.length) % frames.length)) }} aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
            <motion.img
              key={open.id}
              src={open.src}
              alt={open.alt ?? ""}
              className="max-h-[84vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
            <button type="button" className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setOpenIdx((i) => (i === null ? i : (i + 1) % frames.length)) }} aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
            <span className="pointer-events-none absolute bottom-5 font-mono text-[11px] font-bold uppercase tracking-widest text-white/60">{openIdxNum + 1} / {frames.length}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  )
}
