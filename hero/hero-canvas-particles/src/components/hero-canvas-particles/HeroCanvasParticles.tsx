import * as React from "react"
import { motion } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Canvas particles hero — an interactive particle field rendered via an SVG weave.
// ═══ EMOTION     Generative, alive.
// ═══ SIGNATURE   A constellation of dots + connecting lines that drift and react to the cursor.

export type HeroCanvasParticlesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: { label: string; href?: string }[]
  count?: number
  className?: string
}

export function HeroCanvasParticles({ eyebrow = "FIELD", title = "A constellation that listens.", subtitle = "Move the cursor and the field bends around it.", actions = [{ label: "Explore", href: "#" }], count = 60, className }: HeroCanvasParticlesProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 })
  const dots = React.useMemo(() => Array.from({ length: count }).map(() => ({
    x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0016, vy: (Math.random() - 0.5) * 0.0016, r: 1.4 + Math.random() * 2,
  })), [count])
  return (
    <section className={cn("relative isolate flex min-h-[86vh] items-center justify-center overflow-hidden bg-foreground text-background", className)}
      onPointerMove={(e) => { const r = wrap.current?.getBoundingClientRect(); if (r) setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }) }}>
      <div ref={wrap} className="absolute inset-0">
        <Field dots={dots} mouse={mouse} />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-5 text-center sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <MonoLabel className="justify-center text-background/55">{eyebrow}</MonoLabel>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}>
          <h1 className="mt-5 font-display text-5xl font-black leading-[0.96] tracking-[-0.035em] sm:text-7xl">{title}</h1>
        </InView>
        <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.16 }}>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-relaxed text-background/70">{subtitle}</p>
          <div className="mt-8 flex justify-center">{actions.map((a) => <Button key={a.label} size="lg" onClick={() => { if (a.href) window.location.href = a.href }} className="h-11 rounded-full bg-background px-6 font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">{a.label}</Button>)}</div>
        </InView>
      </div>
    </section>
  )
}

function Field({ dots, mouse }: { dots: { x: number; y: number; vx: number; vy: number; r: number }[]; mouse: { x: number; y: number } }) {
  const [p, setP] = React.useState(dots)
  React.useEffect(() => {
    let raf = 0
    const tick = () => {
      setP((prev) => prev.map((d) => {
        let nx = d.x + d.vx, ny = d.y + d.vy
        const dx = nx - mouse.x, dy = ny - mouse.y
        const dist = Math.hypot(dx, dy)
        if (dist < 0.18) { nx += (dx / (dist || 1)) * 0.002; ny += (dy / (dist || 1)) * 0.002 }
        if (nx < 0 || nx > 1) d.vx *= -1
        if (ny < 0 || ny > 1) d.vy *= -1
        return { ...d, x: Math.max(0, Math.min(1, nx)), y: Math.max(0, Math.min(1, ny)) }
      }))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [mouse])
  return (
    <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
      {p.map((d, i) => (
        <g key={i}>
          <circle cx={d.x * 100} cy={d.y * 100} r={d.r * (0.1)} fill="hsl(var(--site-accent) / 0.8)" />
          {p.slice(i + 1, i + 4).map((o, j) => {
            const dist = Math.hypot(d.x - o.x, d.y - o.y)
            if (dist > 0.1) return null
            return <line key={j} x1={d.x * 100} y1={d.y * 100} x2={o.x * 100} y2={o.y * 100} stroke="hsl(var(--site-accent) / 0.25)" strokeWidth={0.15} />
          })}
        </g>
      ))}
    </svg>
  )
}
