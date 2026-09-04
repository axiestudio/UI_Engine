import * as React from "react"
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogContainer,
  MorphingDialogClose,
  MorphingDialogDescription,
  MorphingDialogTitle,
  MorphingDialogImage,
  MorphingDialogSubtitle,
} from "@/components/primitives/morphing-dialog"
import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from "@/components/primitives/image-comparison"
import { InView } from "@/components/primitives/in-view"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export type GalleryPhoto = {
  id?: string
  src: string
  alt: string
  title?: string
  caption?: string
}

export type GalleryProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  photos: GalleryPhoto[]
  /** Columns on desktop (mobile is always 1, sm is 2). Default 3. */
  columns?: 2 | 3 | 4
  /** Optional before/after showcase rendered beside the header. */
  comparison?: { before: string; after: string; beforeAlt?: string; afterAlt?: string; label?: string }
  closeLabel?: string
  className?: string
}

// Self-demo defaults.
const DEMO_GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: "p1", src: "/showcase/hero-poster.webp", alt: "Studio interior", title: "Studio interior", caption: "Two quiet rooms, evening light." },
  { id: "p2", src: "/showcase/hero-poster.webp", alt: "Detail shot", title: "Detail shot", caption: "Brass hardware on the rear door." },
  { id: "p3", src: "/showcase/hero-poster.webp", alt: "Charter session", title: "Charter session", caption: "Executive session, lights low." },
  { id: "p4", src: "/showcase/hero-poster.webp", alt: "Materials", title: "Materials", caption: "The full kit, restocked weekly." },
  { id: "p5", src: "/showcase/hero-poster.webp", alt: "Door", title: "Door", caption: "Same door since 2001." },
  { id: "p6", src: "/showcase/hero-poster.webp", alt: "Calendar", title: "Calendar", caption: "Live availability on the door." },
]

export function Gallery({
  eyebrow = "Gallery",
  title = "A glance inside",
  subtitle,
  photos = DEMO_GALLERY_PHOTOS,
  columns = 3,
  comparison,
  closeLabel = "Close gallery",
  className,
}: GalleryProps) {
  if (!photos.length) return null
  return (
    <section className={cn("relative isolate overflow-hidden w-full bg-background text-foreground", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-5 py-16 sm:px-8 lg:px-8 lg:py-24">
        <div className={cn("mb-10 grid gap-8 lg:grid-cols-2 lg:items-end", !comparison && "grid-cols-1")}>
          <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-80px" }}>
            <header className="max-w-xl">
              {eyebrow && <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>}
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
              {subtitle && <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">{subtitle}</p>}
            </header>
          </InView>
          {comparison && (
            <InView variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
              <figure>
                <ImageComparison className="aspect-[16/10] w-full overflow-hidden rounded-[20px] border shadow-sm">
                  <ImageComparisonImage src={comparison.before} alt={comparison.beforeAlt ?? "Before"} position="left" />
                  <ImageComparisonImage src={comparison.after} alt={comparison.afterAlt ?? "After"} position="right" />
                  <ImageComparisonSlider className="bg-background" />
                </ImageComparison>
                {comparison.label && <figcaption className="mt-2 font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{comparison.label}</figcaption>}
              </figure>
            </InView>
          )}
        </div>

        {/* one dialog per photo: the MorphingDialog context owns a single
            isOpen/uniqueId, so per-item instances are the correct multi-image pattern */}
        <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", columns === 3 && "lg:grid-cols-3", columns === 4 && "lg:grid-cols-4")}>
          {photos.map((p, i) => (
            <MorphingDialog key={p.id ?? i} transition={{ type: "spring", bounce: 0.05, duration: 0.45 }}>
              <MorphingDialogTrigger
                style={{ borderRadius: 20 }}
                className="flex aspect-[4/3] cursor-zoom-in flex-col overflow-hidden rounded-[20px] border bg-card shadow-sm"
                aria-label={p.title ?? p.alt}
              >
                <MorphingDialogImage src={p.src} alt={p.alt} className="h-full w-full object-cover" />
                <span className="pointer-events-none absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-background text-foreground shadow-sm">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                {(p.title || p.caption) && (
                  <span className="sr-only">{[p.title, p.caption].filter(Boolean).join(" — ")}</span>
                )}
              </MorphingDialogTrigger>

              <MorphingDialogContainer>
                <MorphingDialogContent className="flex max-h-[90vh] w-[92vw] max-w-[1000px] flex-col gap-0 overflow-hidden rounded-[22px] bg-background text-foreground shadow-2xl outline-none">
                  <MorphingDialogImage src={p.src} alt={p.alt} className="max-h-[54vh] min-h-[240px] w-full grow bg-muted object-cover" />
                  <div className="flex items-start justify-between gap-6 border-t px-6 py-5">
                    <div>
                      {p.title && <MorphingDialogTitle className="font-display text-lg font-bold tracking-tight">{p.title}</MorphingDialogTitle>}
                      {p.caption && <MorphingDialogDescription className="mt-1 max-w-prose text-sm font-medium leading-relaxed text-muted-foreground">{p.caption}</MorphingDialogDescription>}
                      {!p.caption && <MorphingDialogSubtitle className="hidden">{p.title}</MorphingDialogSubtitle>}
                    </div>
                    <MorphingDialogClose className="text-muted-foreground" />
                  </div>
                </MorphingDialogContent>
              </MorphingDialogContainer>
            </MorphingDialog>
          ))}
        </div>      </div>
    </section>
  )
}

export { ImageComparison, ImageComparisonImage, ImageComparisonSlider }
