import * as React from "react"
import {
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
import { CornerTicks, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

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
    whileElementsMounted: React.useCallback((ref: HTMLElement, flo: HTMLElement, upd: () => void) => autoUpd(ref, flo, upd), []),
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
      <button
        ref={refs.setReference}
        {...getReferenceProps({
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
          onFocus: () => setOpen(true),
          onBlur: () => setOpen(false),
          onClick: () => setOpen((o) => !o),
        })}
        aria-expanded={open}
        aria-label={`${index + 1} — ${pin.title}`}
        className={cn(
          "absolute z-[2] flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 font-mono text-[10px] font-black shadow-lg transition-transform hover:scale-110 focus-visible:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open ? "border-primary bg-primary text-primary-foreground" : "border-background bg-foreground text-background",
        )}
        style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
      >
        {index + 1}
      </button>
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

// tiny autoUpdate shim (keeps the note pinned on scroll/resize)
function autoUpd(ref: HTMLElement, flo: HTMLElement, update: () => void) {
  const io = new ResizeObserver(update)
  io.observe(ref)
  io.observe(flo)
  const ro = new ResizeObserver(update)
  ro.observe(document.documentElement)
  window.addEventListener("scroll", update, true)
  window.addEventListener("resize", update)
  return () => {
    io.disconnect()
    ro.disconnect()
    window.removeEventListener("scroll", update, true)
    window.removeEventListener("resize", update)
  }
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
    <SectionShell tone={tone} width={920} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
        <figure className="mt-10">
          <div className={cn("relative overflow-hidden rounded-[20px] border", ink ? "border-background/15" : "border-border")}>
            <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <CornerTicks size={16} offset={12} className="text-background/70" />
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
    </SectionShell>
  )
}
