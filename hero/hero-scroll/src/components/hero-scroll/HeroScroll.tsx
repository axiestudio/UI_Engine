import * as React from "react"
import { cn } from "@/lib/utils"

export type HeroSession = {
  /** First frame index (inclusive) where this session is visible */
  from: number
  /** Last frame index (inclusive) where this session is visible */
  to: number
  kicker?: string
  /** Main headline — string or JSX (e.g. with <br />) */
  title: React.ReactNode
  /** Supporting copy — string or JSX */
  body?: React.ReactNode
  ctaLabel?: string
  ctaHref?: string
}

export type HeroScrollProps = {
  frames?: string[]
  poster?: string
  height?: string
  alt?: string
  className?: string
  withHeader?: boolean
  /** Sync with a header that hides itself on scroll — hero smoothly expands to full viewport. */
  headerHidden?: boolean
  /** Optional scroll-synced text sessions overlaid on the canvas. Omit for plain scrub. */
  sessions?: HeroSession[]
  /** Hint shown before the first session begins (or always, if no sessions). Set "" to disable. */
  hint?: string
}

export function HeroScroll({
  frames,
  poster = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop",
  height = "400vh",
  alt = "Hero",
  className,
  withHeader = false,
  headerHidden = false,
  sessions,
  hint = "SCROLL TO EXPLORE",
}: HeroScrollProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = React.useState(0)
  const imagesRef = React.useRef<HTMLImageElement[]>([])

  // Preload
  React.useEffect(() => {
    if (!frames?.length) return
    const imgs: HTMLImageElement[] = []
    frames.forEach((src, i) => {
      const img = new Image()
      img.src = src
      imgs[i] = img
    })
    imagesRef.current = imgs
  }, [frames])

  // Scroll -> progress 0..1 (simple, no rAF throttle — reliable)
  React.useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p = Math.min(1, Math.max(0, -rect.top / (rect.height - vh)))
      setProgress(p)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  const frameIndex = React.useMemo(() => {
    if (!frames?.length) return 0
    return Math.min(frames.length - 1, Math.floor(progress * (frames.length - 1)))
  }, [progress, frames])

  // Draw
  const draw = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = frames?.length ? imagesRef.current[frameIndex] : null
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
    ctx.drawImage(ready, x, y, nw, nh)
  }, [frameIndex, frames])

  React.useEffect(() => {
    draw()
    // redraw on resize
    const onResize = () => draw()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [draw])

  // keep drawing as frames load
  React.useEffect(() => {
    if (!frames?.length) return
    const id = setInterval(draw, 100)
    return () => clearInterval(id)
  }, [draw, frames])

  const hasFrames = !!frames?.length

  const showHeaderOffset = withHeader && !headerHidden

  const activeSessions = sessions?.length ? sessions : []
  const scrimOn = activeSessions.some((s) => frameIndex >= s.from && frameIndex <= s.to)
  const firstSessionFrom = activeSessions.length ? Math.min(...activeSessions.map((s) => s.from)) : Infinity
  const hintOn = !!hint && !scrimOn && (!activeSessions.length || frameIndex < firstSessionFrom)

  return (
    <div ref={containerRef} className={cn("relative bg-background", className)} style={{ height }}>
      <div
        className={cn(
          "sticky w-full overflow-hidden bg-background transition-all duration-300 ease-out",
          showHeaderOffset ? "top-[56px] h-[calc(100vh-56px)] sm:top-[64px] sm:h-[calc(100vh-64px)]" : "top-0 h-screen"
        )}
      >
        {hasFrames ? (
          <canvas
            ref={canvasRef}
            aria-label={alt}
            role="img"
            className="absolute inset-0 h-full w-full"
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <img src={poster} alt={alt} className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
        )}

        {/* Scrim for text readability — only when a session is visible */}
        {activeSessions.length > 0 && (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-700",
              scrimOn ? "opacity-100" : "opacity-0"
            )}
            style={{
              background: "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0.08) 35%, rgba(0,0,0,0.42) 100%)",
            }}
            aria-hidden
          />
        )}

        {/* Sessions — overlaid copy synced to frame index */}
        {activeSessions.map((s, i) => {
          const visible = frameIndex >= s.from && frameIndex <= s.to
          return (
            <div
              key={i}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center transition-all duration-700 ease-out",
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
              )}
              aria-hidden={!visible}
            >
              <div className="mx-auto max-w-3xl">
                {s.kicker && (
                  <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-white/85 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)] sm:text-xs">
                    {s.kicker}
                  </p>
                )}
                <p className="mt-3 font-display text-[30px] font-black leading-[0.9] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] sm:text-5xl lg:text-[56px]">
                  {s.title}
                </p>
                {s.body && (
                  <p className="mx-auto mt-3 max-w-[560px] font-sans text-[14px] font-medium leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] sm:text-[15px]">
                    {s.body}
                  </p>
                )}
                {s.ctaLabel && (
                  <a
                    href={s.ctaHref ?? "#"}
                    className={cn(
                      "pointer-events-auto mt-6 inline-flex h-11 items-center rounded-full bg-white px-7 font-display text-sm font-extrabold tracking-tight text-foreground shadow-[0_4px_24px_rgba(0,0,0,0.25)] transition hover:bg-white/90 active:scale-[0.98]",
                      visible ? "opacity-100" : "opacity-0"
                    )}
                  >
                    {s.ctaLabel}
                  </a>
                )}
              </div>
            </div>
          )
        })}

        {/* Scroll hint — shown before the first session (or always when plain scrub) */}
        {hint && (
          <div
            className={cn(
              "pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-500 sm:bottom-8",
              hintOn ? "opacity-100" : "opacity-0"
            )}
            aria-hidden
          >
            <p className="font-mono text-[10px] font-bold tracking-[0.18em] text-white/70 drop-shadow sm:text-xs">{hint}</p>
            <div className="h-8 w-px animate-pulse bg-white/60" />
          </div>
        )}
      </div>
    </div>
  )
}
