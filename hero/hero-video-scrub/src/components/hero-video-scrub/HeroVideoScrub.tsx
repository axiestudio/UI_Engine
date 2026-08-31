import * as React from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { Play } from "lucide-react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Video scrub — a fullscreen video whose playhead is driven by scroll.
// ═══ EMOTION     Direct-control cinematic.
// ═══ SIGNATURE   A pinned video that scrubs with scroll + a progress playhead.

export type HeroVideoScrubProps = {
  eyebrow?: string
  title?: string
  src?: string
  runway?: string
  className?: string
}

export function HeroVideoScrub({ eyebrow = "SCRUB", title = "The film is in your hands.", src = "/videos/hero.mp4", runway = "260vh", className }: HeroVideoScrubProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const [shown, setShown] = React.useState(0)
  React.useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setShown(v)
      const vid = videoRef.current
      if (vid && vid.duration) {
        const t = v * vid.duration
        if (Math.abs(vid.currentTime - t) > 0.1) vid.currentTime = t
      }
    })
  }, [scrollYProgress])
  const clipX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  return (
    <section ref={ref} className={cn("relative w-full bg-background", className)} style={{ height: runway }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <div className="relative h-[72vh] w-[90vw] max-w-[1200px] overflow-hidden rounded-[24px] bg-foreground">
          <video ref={videoRef} className="h-full w-full object-cover" src={src} muted playsInline preload="auto" />
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur"><Play className="h-6 w-6 ml-0.5" /></span>
          </div>
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-background">
            <MonoLabel className="text-background/60">{eyebrow}</MonoLabel>
            <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">{title}</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-background/25">
                <motion.div style={{ x: clipX }} className="absolute inset-y-0 left-0 w-2 rounded-full bg-background" />
                <div style={{ width: `${shown * 100}%` }} className="h-full bg-background/80" />
              </div>
              <span className="font-mono text-[11px] font-bold tabular-nums text-background/60">{Math.round(shown * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
