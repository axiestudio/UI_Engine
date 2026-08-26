import * as React from "react"
import { cn } from "@/lib/utils"

export type HeroScrollProps = {
  frames?: string[]
  poster?: string
  height?: string
  alt?: string
  className?: string
  withHeader?: boolean
}

export function HeroScroll({
  frames,
  poster = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop",
  height = "400vh",
  alt = "Hero",
  className,
  withHeader = false,
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

  return (
    <div ref={containerRef} className={cn("relative bg-background", className)} style={{ height }}>
      <div
        className={cn(
          "sticky w-full overflow-hidden bg-background",
          withHeader ? "top-[56px] h-[calc(100vh-56px)] lg:top-[64px] lg:h-[calc(100vh-64px)]" : "top-0 h-screen"
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
      </div>
    </div>
  )
}
