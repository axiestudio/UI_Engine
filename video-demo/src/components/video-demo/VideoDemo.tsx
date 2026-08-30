import * as React from "react"
import { Play } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type VideoDemoProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  /** Poster image for the framed player. */
  poster: string
  posterAlt?: string
  /** Embed URL loaded in the lightbox (YouTube/Vimeo embed or direct mp4). */
  src: string
  /** mp4 when true renders a native <video controls>, otherwise an <iframe>. Default false. */
  direct?: boolean
  playLabel?: string
  /** Text shown in the browser-chrome bar. */
  urlLabel?: string
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

// ── VideoDemo ────────────────────────────────────────────────────────────────

export function VideoDemo({
  eyebrow,
  title = "See it in motion",
  subtitle,
  poster,
  posterAlt = "Product demo video",
  src,
  direct = false,
  playLabel = "Play demo",
  urlLabel = "demo.example.com",
  caption,
  tone = "ink",
  className,
}: VideoDemoProps) {
  const [open, setOpen] = React.useState(false)
  const ink = tone === "ink"

  return (
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {(eyebrow || title || subtitle) && (
          <header className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
            {eyebrow && (
              <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/50" : "text-muted-foreground")}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className={cn("mt-2 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                {subtitle}
              </p>
            )}
          </header>
        )}

        <InView
          variants={{ hidden: { opacity: 0, y: 24, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <figure className="group relative mx-auto max-w-4xl">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={playLabel}
              className={cn(
                "relative block w-full overflow-hidden rounded-[20px] border text-left shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]",
                ink ? "border-background/20 bg-background/5" : "border-border bg-card",
              )}
            >
              <div className={cn("flex items-center gap-3 border-b px-4 py-3", ink ? "border-background/10 bg-background/5" : "border-border bg-muted/50")}>
                <span className="flex gap-1.5" aria-hidden>
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                  <i className={cn("size-2.5 rounded-full", ink ? "bg-background/30" : "bg-muted-foreground/30")} />
                </span>
                <span className={cn("mx-auto hidden max-w-xs truncate rounded-full px-3 py-1 font-mono text-[11px] sm:block", ink ? "bg-background/10 text-background/60" : "bg-background text-muted-foreground")}>
                  {urlLabel}
                </span>
                <span className="w-10" aria-hidden />
              </div>
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <img src={poster} alt={posterAlt} className="h-full w-full object-cover object-top" loading="lazy" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" aria-hidden />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={cn(
                    "flex size-16 items-center justify-center rounded-full shadow-xl transition-transform duration-300 group-hover:scale-110 sm:size-20",
                    ink ? "bg-background text-foreground" : "bg-foreground text-background",
                  )}>
                    <Play className="ml-1 size-6 fill-current sm:size-7" />
                  </span>
                </span>
              </div>
            </button>
            {caption && (
              <figcaption className={cn("mt-4 text-center text-sm font-medium", ink ? "text-background/60" : "text-muted-foreground")}>
                {caption}
              </figcaption>
            )}
          </figure>
        </InView>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-4xl gap-0 overflow-hidden border-none bg-black p-0">
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="aspect-video w-full">
            {direct ? (
              <video src={src} poster={poster} controls autoPlay className="h-full w-full" />
            ) : (
              <iframe
                src={src}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            )}
          </div>
          <div className="flex justify-end px-4 py-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
