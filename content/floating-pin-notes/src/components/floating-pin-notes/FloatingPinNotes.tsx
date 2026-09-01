import * as React from "react"
import { autoUpdate,
  FloatingPortal,
  useFloating,
  useHover,
  useFocus,
  useInteractions,
  useDismiss,
  flip,
  shift,
  offset,
  arrow,
} from "@floating-ui/react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import type { ReferenceType } from "@floating-ui/react-dom"
import { Button } from "@/components/ui/button"

// ═══ JOB         Let the photo explain itself.
// ═══ EMOTION     Being walked through the room by someone who knows it.
// ═══ SIGNATURE   Numbered pins open collision-aware notes that flip and
//                 shift to stay on stage — with an arrow welded to the pin.
//                 Keyboard-focusable; the note follows whichever pin you
//                 give attention to.

export type PinNote = { x: number; y: number; title: string; body: string }

export type FloatingPinNotesProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  src?: string
  alt?: string
  pins?: PinNote[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

function Pin({ pin, index, tone }: { pin: PinNote; index: number; tone: "paper" | "ink" }) {
  const arrowRef = React.useRef<HTMLDivElement>(null)
  const { refs, floatingStyles, context } = useFloating({
    placement: "top",
    middleware: [offset(10), flip({ padding: 12 }), shift({ padding: 12 }), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useDismiss(context),
  ])
  const [open, setOpen] = React.useState(false)
  const ink = tone === "ink"

  return (
    <>
      <Button type="button" ref={refs.setReference} getReferenceProps onMouseEnter setOpen true onMouseLeave false onFocus onBlur onClick o aria expanded={open} label={`${index + 1} — ${pin.title}`} style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }} variant="default" className={cn(cn(
          "absolute z-[2] flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[10px] font-black shadow-lg transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open ? "border-primary bg-primary text-primary-foreground" : "border-background bg-foreground text-background",
        ))}>
        {index + 1}
      
      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            role="tooltip"
            className="z-50 w-56 rounded-xl border border-border bg-card p-3.5 shadow-[0_18px_44px_-16px_hsl(var(--foreground)/0.45)]"
          >
            <div ref={arrowRef} aria-hidden className="absolute -z-10 size-3 rotate-45 rounded-[2px] border-b border-r border-border bg-card" />
            <p className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-primary">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary font-mono text-[8px] text-primary-foreground">{index + 1}</span>
              {pin.title}
            </p>
            <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-muted-foreground">{pin.body}</p>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}


export function FloatingPinNotes({
  eyebrow = "FLOATING UI · PIN NOTES",
  title = "The room, annotated.",
  subtitle = "Hover, focus or tap a pin — its note flips, shifts and keeps its arrow welded to the pin even at the frame's edge. Every pin is keyboard-reachable.",
  src = "/showcase/content/content-01-office.webp",
  alt = "The studio floor, annotated",
  pins = [
    { x: 0.18, y: 0.32, title: "North light", body: "Colour checks happen here between ten and two — the only honest white on the floor." },
    { x: 0.52, y: 0.58, title: "Chair 03", body: "The unlucky-lucky chair. Booked six weeks out, every time." },
    { x: 0.82, y: 0.36, title: "The ledger wall", body: "Nine years of paper diaries, kept. Every booking error in the house lives in these." },
  ],
  caption = "FLIP + SHIFT + ARROW · COLLISION AWARE",
  tone = "paper",
  className,
}: FloatingPinNotesProps) {
  const ink = tone === "ink"
  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <figure className="mt-10">
          <div className={cn("relative overflow-hidden rounded-[20px] border", ink ? "border-background/15" : "border-border")}>
            <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <span aria-hidden className={cn("pointer-events-none absolute inset-0", "text-background/70")}>
    <span className="absolute border-current top-[12px] left-[12px] border-t border-l" style={{ width: 16, height: 16 }} />
    <span className="absolute border-current top-[12px] right-[12px] border-t border-r" style={{ width: 16, height: 16 }} />
    <span className="absolute border-current bottom-[12px] left-[12px] border-b border-l" style={{ width: 16, height: 16 }} />
    <span className="absolute border-current bottom-[12px] right-[12px] border-b border-r" style={{ width: 16, height: 16 }} />
  </span>
            {pins.map((pin, i) => (
              <Pin key={pin.title} pin={pin} index={i} tone={tone} />
            ))}
          </div>

          {caption && (
            <figcaption
              className={cn(
                "mt-3 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
                ink ? "border-background/15 text-background/55" : "border-border text-muted-foreground",
              )}
            >
              <span>{caption}</span>
              <span aria-hidden>●</span>
            </figcaption>
          )}
        </figure>
      </InView>
    
  </div>
</section>
  )
}
