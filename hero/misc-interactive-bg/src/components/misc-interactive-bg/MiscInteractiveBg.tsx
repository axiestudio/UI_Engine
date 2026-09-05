import * as React from "react"
import { motion } from "motion/react"
import { MonoLabel } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"

// ═══ JOB         Interactive background — a canvas of drifting specks that react to the cursor.
// ═══ EMOTION     Alive, generative.
// ═══ SIGNATURE   A particle field (CSS-based spots) that scatters on cursor proximity.

export type MiscInteractiveBgProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  count?: number
  className?: string
}

export function MiscInteractiveBg({ eyebrow = "Field", title = "A background that notices you.", subtitle = "Move the cursor — the specks scatter and settle.", count = 40, className }: MiscInteractiveBgProps) {
  const [mouse, setMouse] = React.useState({ x: -999, y: -999 })
  const dots = React.useMemo(() => Array.from({ length: count }).map(() => ({
    x: Math.random() * 100, y: Math.random() * 100, size: 2 + Math.random() * 4, hue: Math.random() * 60,
  })), [count])
  return (
    <section className={cn("relative isolate flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-foreground text-background", className)}
      onPointerMove={(e) => setMouse({ x: e.clientX, y: e.clientY })} onPointerLeave={() => setMouse({ x: -999, y: -999 })}>
      <div className="absolute inset-0">
        {dots.map((d, i) => {
          return <Dot key={i} d={d} mouse={mouse} />
        })}
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center sm:px-8">
        <MonoLabel className="justify-center text-background/55">{eyebrow}</MonoLabel>
        <h1 className="mt-4 font-display text-5xl font-black leading-[0.96] tracking-[-0.035em] sm:text-7xl">{title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-background/70">{subtitle}</p>
      </div>
    </section>
  )
}

function Dot({ d, mouse }: { d: { x: number; y: number; size: number; hue: number }; mouse: { x: number; y: number } }) {
  const css = { left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, background: `hsl(${d.hue} 70% 65% / 0.8)` }
  // percentage position of the dot vs. the mouse's viewport position (approx)
  const dx = d.x - (mouse.x / window.innerWidth) * 100
  const dy = d.y - (mouse.y / window.innerHeight) * 100
  const near = Math.hypot(dx, dy) < 22
  return (
    <motion.span
      className="absolute rounded-full"
      style={css}
      animate={near ? { scale: 0.3, opacity: 0.4 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    />
  )
}
