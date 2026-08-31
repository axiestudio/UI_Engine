import * as React from "react"
import { motion, useTransform } from "motion/react"
import type { MotionValue } from "motion/react"
import { Button } from "@/components/ui/button"
import { InView } from "@/components/primitives/in-view"
import { Grain } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { useCurtainGate } from "@/lib/curtain"

// ═══ JOB         Dolly-through reveal — the cover scales past the viewport.
// ═══ EMOTION     You pass *through* the wall, not around it.
// ═══ SIGNATURE   A single panel scales to 1.4× then unmounts.

export type CurtainZoomProps = {
  mode?: "overlay" | "stage"
  logo?: { src: string; alt?: string }
  kicker?: string
  title?: React.ReactNode
  description?: React.ReactNode
  enter?: { label?: string; href?: string; onClick?: () => void }
  hint?: string
  range?: number
  lockScroll?: boolean
  skipOnReducedMotion?: boolean
  stageHeight?: string
  onOpen?: () => void
  overlayClassName?: string
  className?: string
}

export function CurtainZoom({
  mode = "overlay",
  logo,
  kicker = "UI ENGINE",
  title = "WELCOME",
  description = "A token-first collection of pre-built website sections. Scroll to pass through.",
  enter = { label: "Enter" },
  hint = "SCROLL TO REVEAL",
  range = 900,
  lockScroll = true,
  skipOnReducedMotion = true,
  stageHeight = "240vh",
  onOpen,
  overlayClassName,
  className,
}: CurtainZoomProps) {
  const gate = useCurtainGate({ mode, range, lockScroll, skipOnReducedMotion, stageHeight, onOpen })
  const { reduce, progress, done, stageRef, enterSite } = gate

  const handleEnter = () => enterSite(enter.href, enter.onClick)

  if (mode === "overlay" && done) return null

  return (
    <div
      ref={mode === "stage" ? stageRef : undefined}
      className={cn(mode === "overlay" ? "fixed inset-0 z-[90]" : "relative isolate w-full", className)}
      style={mode === "stage" ? { height: stageHeight } : undefined}
    >
      <div
        className={cn(mode === "stage" ? "sticky top-0 h-screen w-full overflow-hidden" : "absolute inset-0", overlayClassName)}
        role={mode === "overlay" ? "presentation" : undefined}
        aria-label={mode === "overlay" ? "Intro zoom" : undefined}
      >
        <ZoomScene
          progress={progress}
          reduce={reduce}
          logo={logo}
          kicker={kicker}
          title={title}
          description={description}
          enterLabel={enter.label}
          hint={hint}
          onEnter={handleEnter}
          onEnterKey={mode === "overlay"}
        />
      </div>
    </div>
  )
}

function ZoomScene({
  progress,
  reduce,
  logo,
  kicker,
  title,
  description,
  enterLabel,
  hint,
  onEnter,
  onEnterKey,
}: {
  progress: MotionValue<number>
  reduce: boolean
  logo?: { src: string; alt?: string }
  kicker: string
  title: React.ReactNode
  description: React.ReactNode
  enterLabel?: string
  hint: string
  onEnter: () => void
  onEnterKey: boolean
}) {
  const scale = useTransform(progress, [0, 1], [1, 1.4])
  const blur = useTransform(progress, [0, 0.9], [0, 8])
  const coverOpacity = useTransform(progress, [0, 0.85], [1, 0])
  const textOpacity = useTransform(progress, [0, 0.55], [1, 0])
  const textScale = useTransform(progress, [0, 1], [0.96, 1.14])
  const textY = useTransform(progress, [0, 1], [0, -60])
  const hintOpacity = useTransform(progress, [0, 0.35], [1, 0])

  return (
    <motion.div style={{ opacity: coverOpacity }} className="absolute inset-0 overflow-hidden bg-[hsl(var(--curtain))]">
      <motion.div style={{ scale, filter: reduce ? undefined : `blur(${blur}px)` }} className="absolute inset-0 will-change-transform">
        <div className="absolute inset-0" style={{ background: `radial-gradient(120% 120% at 50% 0%, hsl(var(--curtain-lit)) 0%, transparent 55%)` }} />
        <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(90deg, hsl(var(--curtain-shade)/0.4) 0px, hsl(var(--curtain-shade)/0) 24px, hsl(var(--curtain-shade)/0) 34px, hsl(var(--curtain-shade)/0.4) 58px)` }} />
        <Grain opacity={0.08} className="z-[2]" />
      </motion.div>

      <motion.div
        style={{ opacity: textOpacity, scale: textScale, y: textY }}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <InView
          once
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.15 }}
        >
          <div className="flex flex-col items-center">
            {logo?.src && <img src={logo.src} alt={logo.alt ?? ""} className={cn("mb-6 h-16 w-16 rounded-2xl object-cover", !reduce && "shadow-2xl ring-1 ring-[hsl(var(--curtain-glow)/0.1)]")} />}
            <p className="font-mono text-[11px] font-bold tracking-[0.4em] text-[hsl(var(--curtain-text)/0.6)]">{kicker}</p>
            <h1 className="mt-3 font-display text-6xl font-extrabold tracking-tight text-[hsl(var(--curtain-text))] sm:text-8xl">{title}</h1>
            <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-[hsl(var(--curtain-text)/0.6)]">{description}</p>
            {enterLabel && (
              <Button
                type="button"
                onClick={onEnter}
                tabIndex={onEnterKey ? 0 : -1}
                className="pointer-events-auto mt-8 h-11 rounded-full border border-[hsl(var(--curtain-glow)/0.25)] bg-[hsl(var(--curtain-glow)/0.06)] px-7 font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-[hsl(var(--curtain-text))] backdrop-blur-sm transition-colors hover:border-[hsl(var(--curtain-glow)/0.5)] hover:bg-[hsl(var(--curtain-glow)/0.14)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--curtain-glow)/0.7)]"
              >
                {enterLabel}
              </Button>
            )}
          </div>
        </InView>
      </motion.div>

      <motion.div
        style={{ opacity: hintOpacity }}
        className="pointer-events-none absolute inset-x-0 bottom-9 flex flex-col items-center gap-2 text-[hsl(var(--curtain-text)/0.7)]"
      >
        <span className="font-mono text-[10px] font-bold tracking-[0.3em]">{hint}</span>
        <span className="flex h-9 w-6 items-start justify-center rounded-full border border-[hsl(var(--curtain-glow)/0.25)] p-1.5">
          <motion.span animate={reduce ? undefined : { y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="block h-1.5 w-1.5 rounded-full bg-[hsl(var(--curtain-text)/0.8)]" />
        </span>
      </motion.div>
    </motion.div>
  )
}
