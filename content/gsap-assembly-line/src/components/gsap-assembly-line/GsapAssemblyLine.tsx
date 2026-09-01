import * as React from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"

gsap.registerPlugin(ScrollTrigger)

// ═══ JOB         Show a product the only honest way: taken apart, then put
//                 back together in front of you.
// ═══ EMOTION     The assembly line, slowed down to studio pace.
// ═══ SIGNATURE   A pinned scroll scrub — five exploded parts drift in from
//                 their offsets and bolt themselves into one object as you
//                 scroll, with the step counter and part name keeping pace.
//                 Each part is its own component in the PARTS registry.

type Part = { id: string; label: string; render: () => React.ReactNode; from: { y?: number; x?: number; rotate?: string; opacity?: number } }

const PARTS: Part[] = [
  {
    id: "base", label: "The base plate",
    from: { y: 140, opacity: 0 },
    render: () => <div className="h-6 w-56 rounded-xl border border-foreground/20 bg-[hsl(var(--foreground)/0.14)]" />,
  },
  {
    id: "column", label: "The column",
    from: { y: 90, x: -120, rotate: "-14deg", opacity: 0 },
    render: () => <div className="absolute bottom-6 left-1/2 h-32 w-8 -translate-x-1/2 rounded-t-full border border-foreground/20 bg-[hsl(var(--foreground)/0.2)]" />,
  },
  {
    id: "arm", label: "The reading arm",
    from: { x: 150, rotate: "10deg", opacity: 0 },
    render: () => <div className="absolute bottom-[124px] left-1/2 h-7 w-40 -translate-x-[30%] rounded-full border border-foreground/20 bg-[hsl(var(--primary)/0.35)]" />,
  },
  {
    id: "head", label: "The lens head",
    from: { y: -120, x: 60, rotate: "18deg", opacity: 0 },
    render: () => (
      <div className="absolute bottom-[150px] left-1/2 flex size-20 -translate-x-[10%] items-center justify-center rounded-full border-4 border-foreground/25 bg-[hsl(var(--primary)/0.5)]">
        <span className="size-7 rounded-full bg-foreground/80" />
      </div>
    ),
  },
  {
    id: "bulb", label: "The warm bulb",
    from: { y: -170, opacity: 0 },
    render: () => (
      <div className="absolute bottom-[196px] left-1/2 size-5 -translate-x-1/2 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_36px_10px_hsl(var(--primary)/0.45)]" />
    ),
  },
]

export type GsapAssemblyLineProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  productName?: string
  caption?: string
  className?: string
}

export function GsapAssemblyLine({
  eyebrow = "GSAP · ASSEMBLY LINE",
  title = "Taken apart, then made whole.",
  subtitle = "Keep scrolling — the pin holds the stage while five exploded parts travel to their seats and the object assembles itself. ScrollTrigger scrubs every bolt.",
  productName = "The Reading Lamp, mk II",
  caption = "SCROLLTRIGGER · PINNED SCRUB · 5 PART COMPONENTS",
  className,
}: GsapAssemblyLineProps) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const pinsRef = React.useRef<(HTMLDivElement | null)[]>([])
  const [step, setStep] = React.useState(0)

  React.useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stageRef.current,
          start: "top top",
          end: "+=220%",
          pin: true,
          scrub: 0.6,
          onUpdate: (self) => setStep(Math.min(PARTS.length - 1, Math.floor(self.progress * PARTS.length))),
        },
      })
      pinsRef.current.forEach((el, i) => {
        if (!el) return
        tl.to(el, { ...PARTS[i].from, y: 0, x: 0, rotate: "0deg", opacity: 1, duration: 1, ease: "power2.out" }, i * 0.9)
      })
    }, stageRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className={cn("relative isolate w-full overflow-hidden", false && "bg-foreground", className)}>
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (1120), ["--shell-w" as string]: `${(1120)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", false ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", false ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", false ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      {/* the pin rail — tall enough for the scrub */}
      <div ref={stageRef} className="relative mt-10 h-screen">
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
          <div className="relative h-[340px] w-[420px] max-w-full">
            {PARTS.map((part, i) => (
              <div
                key={part.id}
                ref={(el) => {
                  pinsRef.current[i] = el
                }}
                className="absolute inset-0 opacity-0"
                aria-hidden
                style={part.from}
              >
                {part.render()}
              </div>
            ))}
            {/* stage floor */}
            <span aria-hidden className="absolute bottom-2 left-1/2 h-3 w-72 -translate-x-1/2 rounded-[100%] bg-[hsl(var(--foreground)/0.12)] blur-md" />
          </div>

          {/* step readout */}
          <div className="mt-6 flex items-center gap-3" aria-live="polite">
            <span className="font-mono text-[11px] font-black tabular-nums text-primary">
              {String(step + 1).padStart(2, "0")} / {String(PARTS.length).padStart(2, "0")}
            </span>
            <span className="h-px w-10 bg-border" aria-hidden />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {PARTS[step].label}
            </span>
          </div>
          <p className="mt-2 font-display text-[15px] font-extrabold tracking-tight text-muted-foreground">{productName}</p>
        </div>
      </div>

      <p className={cn("mx-auto flex max-w-[640px] items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground")}>
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    
  </div>
</section>
  )
}
