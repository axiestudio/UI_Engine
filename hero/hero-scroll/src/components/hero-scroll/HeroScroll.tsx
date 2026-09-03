import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ── Types ────────────────────────────────────────────────────────────────────
export type HeroSession = {
  from: number
  to: number
  kicker?: string
  title: React.ReactNode
  body?: React.ReactNode
  ctaLabel?: string
  ctaHref?: string
}

export type HeroGalleryImage = {
  src: string
  thumb?: string
  alt?: string
  title?: string
}

export type HeroVideoSource = {
  src: string
  poster?: string
  alt?: string
}

export type HeroScrollProps = {
  frames?: string[]
  poster?: string
  height?: string
  alt?: string
  className?: string
  withHeader?: boolean
  headerHidden?: boolean
  sessions?: HeroSession[]
  hint?: string
  /** Optional curated gallery shown as a refined bottom rail + lightbox */
  gallery?: HeroGalleryImage[]
  /** Optional looping background video for the `video` showcase state */
  video?: HeroVideoSource
  /** Show thin progress rail and frame counter */
  showProgress?: boolean
  showFrameCounter?: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n))
}

// ── Component ────────────────────────────────────────────────────────────────
export function HeroScroll({
  frames,
  poster = "/showcase/hero-poster.webp",
  height = "400vh",
  alt = "Showcase — scroll to explore",
  className,
  withHeader = false,
  headerHidden = false,
  sessions,
  hint = "SCROLL TO EXPLORE",
  gallery,
  video,
  showProgress = true,
  showFrameCounter = true,
}: HeroScrollProps) {
  const reduceMotion = useReducedMotion()
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const [progress, setProgress] = React.useState(0)
  const [loaded, setLoaded] = React.useState(0)
  const [canDraw, setCanDraw] = React.useState(false)
  const [lightbox, setLightbox] = React.useState<number | null>(null)
  const imagesRef = React.useRef<HTMLImageElement[]>([])
  const rafRef = React.useRef<number | null>(null)
  const pendingProgress = React.useRef(0)

  const hasFrames = !!frames?.length
  const totalFrames = frames?.length ?? 0

  // ── Preload — priority: first 3 eager, rest idle, track loaded count ─────
  React.useEffect(() => {
    if (!frames?.length) return
    let cancelled = false
    const imgs: HTMLImageElement[] = new Array(frames.length)
    let loadedCount = 0
    const mark = () => {
      if (cancelled) return
      loadedCount += 1
      setLoaded(loadedCount)
      if (loadedCount === 1) setCanDraw(true)
    }

    const loadOne = (idx: number) =>
      new Promise<void>((res) => {
        const img = new Image()
        img.decoding = "async"
        img.onload = () => {
          mark()
          res()
        }
        img.onerror = () => res()
        img.src = frames[idx]
        imgs[idx] = img
      })

    const first = frames.slice(0, Math.min(3, frames.length))
    Promise.all(first.map((_, i) => loadOne(i))).then(() => {
      if (cancelled) return
      imagesRef.current = imgs
      // idle queue for remaining
      let i = first.length
      const queue = () => {
        if (cancelled || i >= frames.length) {
          imagesRef.current = imgs
          return
        }
        loadOne(i).then(() => {
          i += 1
          if ("requestIdleCallback" in window) {
            ;(window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(queue)
          } else setTimeout(queue, 32)
        })
      }
      queue()
    })

    imagesRef.current = imgs
    return () => {
      cancelled = true
    }
  }, [frames])

  // ── Scroll → progress 0..1 (rAF-throttled, only when visible) ─────────────
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    let ticking = false
    let visible = true

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true
      },
      { threshold: 0 }
    )
    io.observe(el)

    const compute = () => {
      if (!visible) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = clamp(-rect.top / (rect.height - vh), 0, 1)
      pendingProgress.current = p
      if (!ticking) {
        ticking = true
        rafRef.current = requestAnimationFrame(() => {
          ticking = false
          setProgress(pendingProgress.current)
        })
      }
    }

    compute()
    window.addEventListener("scroll", compute, { passive: true })
    window.addEventListener("resize", compute)
    return () => {
      io.disconnect()
      window.removeEventListener("scroll", compute)
      window.removeEventListener("resize", compute)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Keyboard scrub
  React.useEffect(() => {
    if (!hasFrames || reduceMotion) return
    const onKey = (e: KeyboardEvent) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const inView = rect.top < window.innerHeight && rect.bottom > 0
      if (!inView) return
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault()
        window.scrollBy({ top: window.innerHeight * 0.18, behavior: "smooth" })
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault()
        window.scrollBy({ top: -window.innerHeight * 0.18, behavior: "smooth" })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hasFrames, reduceMotion])

  const frameIndex = React.useMemo(() => {
    if (!totalFrames) return 0
    return clamp(Math.floor(progress * (totalFrames - 1)), 0, totalFrames - 1)
  }, [progress, totalFrames])

  // ── Canvas draw (DPR-aware, cover, rAF) ───────────────────────────────────
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = hasFrames ? imagesRef.current[frameIndex] : null
    const ready = img && img.complete && img.naturalWidth > 0 ? img : null
    if (!ready) return

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.round(rect.width * dpr)
    const h = Math.round(rect.height * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.clearRect(0, 0, w, h)
    const iw = ready.naturalWidth
    const ih = ready.naturalHeight
    const scale = Math.max(w / iw, h / ih)
    const nw = iw * scale
    const nh = ih * scale
    const x = (w - nw) / 2
    const y = (h - nh) / 2
    // subtle scale when scrubbing forward — perceived depth
    const depth = reduceMotion ? 1 : 1 + progress * 0.02
    const dw = nw * depth
    const dh = nh * depth
    const dx = x - (dw - nw) / 2
    const dy = y - (dh - nh) / 2
    ctx.drawImage(ready, dx, dy, dw, dh)
  }, [frameIndex, hasFrames, progress, reduceMotion])

  React.useEffect(() => {
    if (reduceMotion) {
      draw()
      return
    }
    let raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [draw, reduceMotion])

  React.useEffect(() => {
    if (reduceMotion) return
    // keep drawing as frames stream in until all loaded
    if (!hasFrames || loaded >= totalFrames) return
    const id = setInterval(draw, 120)
    return () => clearInterval(id)
  }, [draw, hasFrames, loaded, totalFrames, reduceMotion])

  // Resize observer for canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => draw())
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [draw])

  const showHeaderOffset = withHeader && !headerHidden
  const activeSessions = sessions ?? []
  const scrimOn = activeSessions.some((s) => frameIndex >= s.from && frameIndex <= s.to)
  const firstSessionFrom = activeSessions.length ? Math.min(...activeSessions.map((s) => s.from)) : Infinity
  const hintOn = !!hint && !scrimOn && (!activeSessions.length || frameIndex < firstSessionFrom)
  const pct = Math.round(progress * 100)

  // Galleries: default showcase when none provided — still showcase new assets
  const galleryImages = gallery

  return (
    <div ref={containerRef} className={cn("relative isolate overflow-hidden bg-background", className)} style={{ height }}>
      {/* Sticky viewport */}
      <div
        className={cn(
          "sticky w-full overflow-hidden bg-background transition-all duration-300 ease-out",
          showHeaderOffset ? "top-[56px] h-[calc(100vh-56px)] sm:top-[64px] sm:h-[calc(100vh-64px)]" : "top-0 h-screen"
        )}
      >
        {/* ── Layer: poster (always underneath — never a blank frame) ──────── */}
        <img
          src={poster}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
          onError={(e) => {
            const t = e.currentTarget
            t.style.display = "none"
          }}
        />

        {/* ── Layer: video background (autoplay muted loop) ────────────────── */}
        {video?.src && (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={video.poster ?? poster}
            aria-label={video.alt ?? "Background film"}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              hasFrames && canDraw ? "opacity-0" : "opacity-100"
            )}
            src={video.src}
            onCanPlay={() => {
              videoRef.current?.play().catch(() => {})
            }}
          />
        )}

        {/* ── Layer: canvas scrub ──────────────────────────────────────────── */}
        {hasFrames ? (
          <canvas
            ref={canvasRef}
            aria-label={alt}
            role="img"
            tabIndex={0}
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-500",
              canDraw ? "opacity-100" : "opacity-0"
            )}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}

        {/* ── Layer: tonal scrim — token-aware, only when copy is present ─── */}
        {activeSessions.length > 0 && (
          <div
            className={cn("pointer-events-none absolute inset-0 transition-opacity duration-700", scrimOn ? "opacity-100" : "opacity-0")}
            style={{
              background:
                "linear-gradient(to bottom, hsl(var(--foreground)/0.22) 0%, hsl(var(--foreground)/0.06) 32%, hsl(var(--foreground)/0.38) 100%)",
            }}
            aria-hidden
          />
        )}

        {/* ── Layer: subtle vignette + grain ──────────────────────────────── */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.32]"
          style={{
            background: "radial-gradient(ellipse at 50% 42%, transparent 58%, hsl(var(--foreground)/0.18) 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Top chrome: eyebrow + frame counter / progress ─────────────── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 items-center rounded-full border border-white/20 bg-black/60 px-3 font-mono text-[10px] font-bold tracking-[0.18em] text-white/85">
              SHOWCASE · SCROLL CINEMA
            </span>
            {showProgress && totalFrames > 0 && (
              <span className="hidden sm:inline-flex h-7 items-center rounded-full bg-white px-3 font-mono text-[10px] font-bold tracking-widest text-foreground shadow-sm">
                {String(frameIndex + 1).padStart(2, "0")} / {String(totalFrames).padStart(2, "0")}
              </span>
            )}
          </div>
          {showFrameCounter && totalFrames > 0 && (
            <span
              aria-live="polite"
              className="inline-flex h-7 items-center rounded-full border border-white/15 bg-black/65 px-3 font-mono text-[10px] font-bold tracking-widest text-white/80"
            >
              {loaded < totalFrames ? `${loaded}/${totalFrames}` : `${pct}%`}
            </span>
          )}
        </div>

        {/* ── Center sessions — motion-presence, editorial scale ──────────── */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {activeSessions.map((s, i) => {
              const visible = frameIndex >= s.from && frameIndex <= s.to
              if (!visible) return null
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduceMotion ? 0 : -10 }}
                  transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="mx-auto w-full max-w-[760px] text-center"
                  aria-hidden={!visible}
                >
                  {s.kicker && (
                    <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-white/85 drop-shadow-[0_1px_10px_rgba(0,0,0,0.5)] sm:text-[11px]">
                      {s.kicker}
                    </p>
                  )}
                  <h2 className="mx-auto mt-3 max-w-[14ch] text-balance font-display text-[clamp(30px,6vw,56px)] font-black leading-[0.9] tracking-[-0.035em] text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.45)]">
                    {s.title}
                  </h2>
                  {s.body && (
                    <p className="mx-auto mt-4 max-w-[58ch] text-pretty font-sans text-[14px] font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_10px_rgba(0,0,0,0.45)] sm:text-[15.5px]">
                      {s.body}
                    </p>
                  )}
                  {s.ctaLabel && (
                    <a
                      href={s.ctaHref ?? "#"}
                      className="pointer-events-auto mt-7 inline-flex h-11 items-center rounded-full bg-white px-7 font-display text-sm font-extrabold tracking-tight text-foreground shadow-[0_8px_30px_rgba(0,0,0,0.22)] transition hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    >
                      {s.ctaLabel}
                    </a>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* ── Scroll hint — respects reduced motion ───────────────────────── */}
        {hint && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-[88px] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2.5 transition-opacity duration-500 sm:bottom-[96px]",
              hintOn ? "opacity-100" : "opacity-0"
            )}
            aria-hidden
          >
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-white/75 drop-shadow sm:text-[11px]">{hint}</p>
            <span className="relative flex h-9 w-[1px] overflow-hidden rounded-full bg-white/20">
              <motion.span
                aria-hidden
                initial={false}
                animate={hintOn && !reduceMotion ? { y: ["-100%", "100%"] } : { y: 0 }}
                transition={hintOn && !reduceMotion ? { duration: 1.35, repeat: Infinity, ease: "easeInOut" } : undefined}
                className="absolute inset-x-0 h-full bg-white/80"
                style={{ opacity: reduceMotion ? 0.6 : 1 }}
              />
            </span>
          </div>
        )}

        {/* ── Bottom gallery rail (when gallery supplied) ─────────────────── */}
        {galleryImages && galleryImages.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/65">
            <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-3 py-3 sm:px-4">
              <p className="hidden shrink-0 font-mono text-[10px] font-bold tracking-[0.2em] text-white/60 sm:block">GALLERY</p>
              <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto scroll-smooth">
                {galleryImages.map((g, idx) => (
                  <Button
                    key={`${g.src}-${idx}`}
                    type="button"
                    variant="ghost"
                    onClick={() => setLightbox(idx)}
                    className="group relative h-[56px] w-[88px] shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40 p-0 transition hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:h-[60px] sm:w-[96px]"
                    aria-label={`Open ${g.title ?? g.alt ?? `image ${idx + 1}`} in gallery`}
                  >
                    <img
                      src={g.thumb ?? g.src}
                      alt={g.alt ?? g.title ?? ""}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    {g.title && (
                      <span className="pointer-events-none absolute bottom-1 left-1.5 right-1.5 truncate font-mono text-[9px] font-bold tracking-widest text-white/85">
                        {g.title}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
              <a
                href="#gallery"
                className="hidden shrink-0 items-center rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-widest text-white/85 transition hover:bg-white hover:text-black sm:inline-flex"
              >
                VIEW ALL
              </a>
            </div>
          </div>
        )}

        {/* ── Progress rail ────────────────────────────────────────────────── */}
        {showProgress && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-white/15">
            <motion.div
              className="h-full bg-white"
              style={{ width: `${pct}%` }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20, mass: 0.4 }}
            />
          </div>
        )}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox !== null && galleryImages && galleryImages[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[90] flex items-center justify-center bg-black/90 p-4 sm:p-8"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-h-[86vh] w-full max-w-[1100px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={galleryImages[lightbox].title ?? galleryImages[lightbox].alt ?? "Gallery image"}
            >
              <img
                src={galleryImages[lightbox].src}
                alt={galleryImages[lightbox].alt ?? galleryImages[lightbox].title ?? ""}
                className="max-h-[76vh] w-full object-contain bg-black"
                decoding="async"
              />
              <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-black px-4 py-3 sm:px-5">
                <div>
                  {galleryImages[lightbox].title && (
                    <p className="font-display text-sm font-bold text-white">{galleryImages[lightbox].title}</p>
                  )}
                  {galleryImages[lightbox].alt && (
                    <p className="font-mono text-[11px] font-medium text-white/60">{galleryImages[lightbox].alt}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setLightbox((v) => (v === null ? null : Math.max(0, v - 1)))}
                    disabled={lightbox === 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white hover:text-black disabled:opacity-30"
                    aria-label="Previous"
                  >
                    ‹
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setLightbox((v) => (v === null ? null : Math.min((galleryImages?.length ?? 1) - 1, v + 1)))}
                    disabled={lightbox === (galleryImages.length - 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white hover:text-black disabled:opacity-30"
                    aria-label="Next"
                  >
                    ›
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setLightbox(null)}
                    className="ml-1 inline-flex h-9 items-center rounded-full bg-white px-4 font-mono text-[11px] font-bold tracking-widest text-black transition hover:bg-white/90"
                  >
                    CLOSE
                  </Button>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close gallery"
                onClick={() => setLightbox(null)}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white/80 transition hover:bg-white hover:text-black"
              >
                ✕
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
