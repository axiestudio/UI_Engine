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

// ═══ JOB         Introduce the six people behind the chairs.
// ═══ EMOTION     A front desk that already knows you — warm, not precious.
// ═══ SIGNATURE   Overlapping ink-dot initials; rest or tab on one and a
//                 w-64 member card floats in below, closing with the ghost
//                 "Book with" button.

export type TeamMember = { name: string; role: string; bio: string; initials: string }

export type FloatingAvatarCardsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  members?: TeamMember[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { name: "Klara Lindqvist", role: "Colour director", bio: "Sixteen years of blondes done right; keeps the tone charts taped inside her station.", initials: "KL" },
  { name: "Oskar Berg", role: "Front of house", bio: "Runs the board and the kettle. Knows every regular's coffee before they do.", initials: "OB" },
  { name: "Elin Sandberg", role: "Founder", bio: "Opened Quiet Times in 2017 with two chairs and the ledger that started it all.", initials: "ES" },
  { name: "Vera Ohlsson", role: "Senior stylist", bio: "Cuts dry, books tight, and never lets a fringe leave the chair wet.", initials: "VO" },
  { name: "Mika Aalto", role: "Barber", bio: "Skin fades and straight-razor finishes — Wednesday walk-ins are his stage.", initials: "MA" },
  { name: "Ingrid Holm", role: "Apprentice", bio: "Learning the ledger first and the shears second. Mixes a mean toner already.", initials: "IH" },
]

function MemberAvatar({ member, tone }: { member: TeamMember; tone: "paper" | "ink" }) {
  const [open, setOpen] = React.useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom",
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useClick(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ])

  return (
    <>
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-expanded={open}
        aria-label={`${member.name}, ${member.role}`}
        className={cn(
          "relative size-12 rounded-full border-2 bg-foreground font-mono text-[12px] font-black text-background transition-all duration-300 hover:z-10 hover:-translate-y-1 focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          tone === "ink" ? "border-foreground/25" : "border-background",
          open && "z-10 -translate-y-1",
        )}
      >
        <span aria-hidden>{member.initials}</span>
      </button>

      {open && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            aria-label={member.name}
            className="z-50 w-64 rounded-2xl border border-border bg-card p-4 shadow-[0_18px_44px_-16px_hsl(var(--foreground)/0.45)]"
          >
            <div className="flex items-center gap-3">
              <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[15px] font-black text-background">
                {member.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-bold text-foreground">{member.name}</span>
                <span className="mt-0.5 block font-mono text-[9px] font-black uppercase tracking-[0.18em] text-primary">{member.role}</span>
              </span>
            </div>
            <p className="mt-3 text-[12px] font-medium leading-relaxed text-muted-foreground">{member.bio}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-3.5 w-full rounded-lg px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book with {member.name.split(" ")[0]}
            </button>
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export function FloatingAvatarCards({
  eyebrow = "FLOATING UI · AVATAR CARDS",
  title = "Faces behind the chairs.",
  subtitle = "Six people keep Quiet Times honest. Rest on a face and their card floats in below — keyboard works too: tab through the cluster and read.",
  members = DEFAULT_MEMBERS,
  caption = "SIX ON THE FLOOR · CARDS FLIP AND SHIFT",
  tone = "paper",
  className,
}: FloatingAvatarCardsProps) {
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

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
        <div className="mt-10 flex flex-col items-center">
          <div className="flex -space-x-2">
            {members.map((m) => (
              <MemberAvatar key={m.name} member={m} tone={tone} />
            ))}
          </div>
          <p className="mt-6 max-w-md text-center text-[13px] font-medium leading-relaxed text-muted-foreground">
            Hover a face for the card — or tap to pin it open. Book with anyone; the board finds the chair hour.
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
