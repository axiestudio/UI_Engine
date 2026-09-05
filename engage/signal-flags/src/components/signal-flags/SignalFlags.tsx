import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"

// ═══ JOB      a CTA that physically waves for attention the way crews do
// ═══ EMOTION  salt-air competence; the harbour is handling it
// ═══ SIGNATURE each letter = a semaphore pair (SVG) held at its real code
//               position; "replay" waves all flags in sequence like a
//               bosun running the word out
//   SITE     → playful CTA band (OPEN / BOOK / HELLO)
//   APP      → completion celebration: spell a dynamic word (NICE / DONE / +42)
//   A11Y     aria-label holds the plain word; the flag row is decorative

const CODES: Record<string, [number, number]> = {
  A: [45, -45], B: [45, -90], C: [45, -135], D: [90, -45], E: [90, -90], F: [90, -135], G: [135, -45], H: [135, -90], I: [135, -135], J: [180, -45], K: [45, 0], // not strict: K uses 0&45
  L: [90, 0], M: [135, 0], N: [180, 0], O: [-45, -90], P: [0, -45], Q: [-90, -45], R: [0, -90], S: [-45, -135], T: [-135, 45], U: [-45, 180], V: [-135, 45], W: [135, 90], X: [-135, 90], Y: [-90, -135], Z: [-135, -45], " ": [180, -180], "0": [180, 180], "1": [45, 135], "2": [90, 135], "3": [135, 135], "4": [-45, 45], "5": [-45, 90], "6": [-45, 135], "7": [-90, 45], "8": [-90, 90], "9": [-90, 135], "!": [45, -45], "+": [90, -135], "&": [135, -45], "/": [135, 90],
}

export type SignalFlagsProps = {
  word: string
  line?: React.ReactNode
  eyebrow?: string
  cta?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export function SignalFlags({ word = "HELLO", line = "The crew on shore has already seen your message.", eyebrow = "SIGNAL STATION — ALPHA", cta, className }: SignalFlagsProps) {
  const _reduce = useReducedMotion()
  const reduce = !!_reduce
  const letters = word.toUpperCase().split("").slice(0, 10)
  const [replay, setReplay] = React.useState(0)
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-[hsl(var(--sea))] px-4 py-20 text-[hsl(var(--flag-navy))] sm:px-6 lg:px-8", className)}>
      {/* horizon */}
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[64px] bg-[hsl(var(--sea-deep))]/85 [mask-image:radial-gradient(120%_100%_at_50%_100%,black_55%,transparent)]" />
      <span aria-hidden className="absolute inset-x-0 bottom-[64px] h-px bg-[hsl(var(--flag-navy))]/30" />
      <div className="relative mx-auto flex w-full max-w-[980px] flex-col items-center text-center">
        <MonoLabel className="opacity-70">{eyebrow}</MonoLabel>
        {/* the semaphore row */}
        <ul aria-hidden className="mt-8 flex flex-wrap items-end justify-center gap-6 sm:gap-8" onMouseEnter={() => setReplay((r) => r + 1)}>
          {letters.map((ch, i) => (
            <motion.li
              key={`${ch}-${i}-${replay}`}
              initial={reduce ? false : { rotate: [-60, 60, -18, 6] , opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: i * 0.09, ease: "easeOut" }}
              className="flex flex-col items-center gap-1"
            >
              <Semaphore ch={ch} />
              <span className="font-mono text-[9px] font-black tracking-[0.2em] opacity-40">{ch}</span>
            </motion.li>
          ))}
        </ul>
        <p aria-label={`Signal reading: ${word}`} className="sr-only">{word}</p>
        {line && <p className="mt-8 max-w-md text-[15px] font-semibold leading-relaxed opacity-80">{line}</p>}
        <div className="mt-7 flex items-center gap-4">
          {cta && <a href={cta.href ?? "#"} onClick={cta.onClick} className="rounded-full bg-[hsl(var(--flag-navy))] px-6 py-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[hsl(var(--flag-gold))] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--flag-navy))]">{cta.label}</a>}
          <Button variant="link" onClick={() => setReplay((r) => r + 1)} className="h-auto p-0 font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-60 hover:opacity-100">replay signal</Button>
        </div>
      </div>
    </section>
  )
}

function Semaphore({ ch }: { ch: string }) {
  const [a, b] = CODES[ch] ?? CODES[" "]
  return (
    <svg viewBox="0 0 90 90" className="h-[74px] w-[74px]" aria-hidden>
      {[[a, "var(--flag-red)"], [b, "var(--flag-navy)"]].map(([ang, col], k) => (
        <g key={k} style={{ transform: `rotate(${ang}deg)`, transformOrigin: "45px 78px", transition: "transform 500ms cubic-bezier(0.5,0,0.3,1)" }}>
          <line x1={45} y1={78} x2={45} y2={16} stroke="hsl(var(--flag-navy))" strokeWidth={3} strokeLinecap="round" />
          <rect x={45} y={16} width={16} height={12} rx={1.5} fill={`hsl(${col})`} />
          <circle cx={45} cy={78} r={3.5} fill="hsl(var(--flag-navy))" />
        </g>
      ))}
      <circle cx={45} cy={80} r={5} fill="hsl(var(--flag-gold))" />
    </svg>
  )
}
