import * as React from "react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useClick,
  useDismiss,
  useRole,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Explain the house's shorthand without leaving the page.
// ═══ EMOTION     A patient editor whispering footnotes above the line.
// ═══ SIGNATURE   Dotted terms open w-64 definition cards on hover AND
//                 click; flip keeps every card on stage at the margins,
//                 outside press puts it away.

export type GlossaryEntry = { term: string; definition: string }

export type FloatingGlossaryProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  entries?: GlossaryEntry[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_ENTRIES: GlossaryEntry[] = [
  {
    term: "the board",
    definition: "The magnetic day-planner behind reception. Three columns — today, in the chair, done — and one rule: if it isn't on the board, it isn't happening.",
  },
  {
    term: "chair hour",
    definition: "Forty-five minutes with a named stylist at a numbered chair. Chair hours are booked, never guessed — the board holds eight a day across three chairs.",
  },
  {
    term: "walk-in window",
    definition: "The unhallowed half-hour before lunch when the board holds two chair hours back for anyone who walks in off Västergatan. First come, first seated.",
  },
  {
    term: "the ledger",
    definition: "The paper book where every booking, move and cancellation is inked by hand. Nine years deep — the receipt for anything the board remembers wrong.",
  },
]

function Term({ entry }: { entry: GlossaryEntry }) {
  const [open, setOpen] = React.useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "tooltip" }),
  ])

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-expanded={open}
        className={cn(
          "cursor-help rounded-[2px] border-b border-dashed border-primary/60 font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "border-primary text-primary",
        )}
      >
        {entry.term}
      </button>
      {open && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-50 w-64 rounded-xl border border-border bg-card p-3.5 shadow-[0_18px_44px_-16px_hsl(var(--foreground)/0.45)]">
            <p className="text-[13px] font-bold text-foreground">{entry.term}</p>
            <p className="mt-1 text-[12px] font-medium leading-relaxed text-muted-foreground">{entry.definition}</p>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export function FloatingGlossary({
  eyebrow = "FLOATING UI · GLOSSARY",
  title = "Salon speak, defined in place.",
  subtitle = "Four words the house uses daily. Hover a dotted term.",
  entries = DEFAULT_ENTRIES,
  caption = "HOVER OR TAP A DOTTED TERM · DISMISS OUTSIDE",
  tone = "paper",
  className,
}: FloatingGlossaryProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const lookup = React.useMemo(() => new Map(entries.map((e) => [e.term, e])), [entries])
  const g = (term: string): GlossaryEntry => lookup.get(term) ?? { term, definition: "—" }

  return (
    <section className={cn("relative isolate w-full overflow-hidden", tone === 'ink' && "bg-foreground", className)}>
  <span aria-hidden className={cn("pointer-events-none absolute bottom-0 left-1/2 w-full max-w-[var(--shell-w)] -translate-x-1/2 border-b border-dashed", tone === 'ink' ? "border-background/10" : "border-border")} />
  <div className={cn("relative mx-auto w-full px-4 sm:px-6 lg:px-8", "py-20 sm:py-24")} style={{ maxWidth: (920), ["--shell-w" as string]: `${(920)}px` }}>

      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <header className={cn("relative")}>
    {eyebrow && <span className={cn("mb-5 inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]", tone === 'ink' ? "text-background/55" : "text-muted-foreground")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{eyebrow}</span>}
    <h2 className={cn("font-display text-[34px] font-black leading-[0.98] tracking-[-0.035em] sm:text-[44px] lg:text-[52px]", tone === 'ink' ? "text-background" : "text-foreground")}>{title}</h2>
    {subtitle && <p className={cn("mt-4 max-w-xl text-[15px] font-medium leading-[1.7] sm:text-base", tone === 'ink' ? "text-background/65" : "text-muted-foreground")}>{subtitle}</p>}
  </header>
      </InView>

      <InView once variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}>
        <div className="mt-10 max-w-[68ch] space-y-6 text-[15px] font-medium leading-[1.9] text-muted-foreground">
          <p>
            Every day at Quiet Times Studio starts the same way: Elin unlocks the back room, flicks the kettle on, and stands in front of <Term entry={g("the board")} />. It is nothing fancy — a sheet of steel, three columns of magnets — but it is the only plan the salon trusts. Before a single magnet moves, the day is already inked in <Term entry={g("the ledger")} />, so any change has to be argued for, not clicked in.
          </p>
          <p>
            Each magnet is a <Term entry={g("chair hour")} />: forty-five minutes, one stylist, one numbered chair. When a regular rings in sick, the gap drops straight into the <Term entry={g("walk-in window")} /> — the half-hour before lunch when anyone off Västergatan can claim a chair, first come, first seated. By six the board is wiped clean and the ledger records what actually happened, which is rarely what the magnets promised.
          </p>
        </div>

        {caption && (
          <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </p>
        )}
      </InView>
    
  </div>
</section>
  )
}
