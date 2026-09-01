import * as React from "react"
import { motion } from "motion/react"
import { ArrowRight, Check, HelpCircle } from "lucide-react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useClick,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  shift,
  offset,
  arrow,
  autoUpdate,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { SectionShell, SectionHead, MonoLabel } from "@/components/primitives/handcraft"

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const REVEAL = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type FieldId = "name" | "phone" | "notes"

const HELP_NOTES: Record<FieldId, { title: string; note: string }> = {
  name: {
    title: "Name",
    note: "Required — every booking is filed under a name and sorted onto the chair roster. Nicknames are fine, spelling matters.",
  },
  phone: {
    title: "Phone",
    note: "Used for a single SMS confirmation and any same-day changes. Never for marketing — the studio doesn't send promos.",
  },
  notes: {
    title: "Notes",
    note: "Allergies, timing, a preferred chair — anything your stylist should know before you arrive. Optional, read by humans.",
  },
}

const FIELD =
  "w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function HelpPopover({
  field,
  open,
  onOpenChange,
}: {
  field: FieldId
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const arrowRef = React.useRef<HTMLDivElement | null>(null)
  const reduced = React.useMemo(prefersReducedMotion, [])

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: "top",
    middleware: [offset(10), shift({ padding: 8 }), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useHover(context, { move: false }),
    useFocus(context),
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
        aria-haspopup="dialog"
        aria-label={`Help — ${HELP_NOTES[field].title}`}
        className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <HelpCircle className="size-3.5" aria-hidden />
      </button>
      {open && (
        <FloatingPortal>
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            initial={reduced ? false : { opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="relative z-50 w-60 rounded-xl border bg-card p-3.5 shadow-xl"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">
              {HELP_NOTES[field].title}
            </p>
            <p className="mt-1.5 text-[12px] leading-5 text-muted-foreground">{HELP_NOTES[field].note}</p>
            <div
              ref={arrowRef}
              aria-hidden
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-b border-r border-border bg-card"
            />
          </motion.div>
        </FloatingPortal>
      )}
    </>
  )
}

export type FloatingFormHelpProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

export function FloatingFormHelp({
  eyebrow = "Engage · Booking",
  title = "Inline help, on tap",
  subtitle = "Every field carries its own note — hover, focus or tap the marker for context without ever leaving the form.",
  caption = "Quiet Times Studio — booking · Tue–Sat 09–18",
  tone = "paper",
  className,
}: FloatingFormHelpProps) {
  const [name, setName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [error, setError] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const [openHelp, setOpenHelp] = React.useState<FieldId | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!name.trim()) {
      setError(true)
      setOpenHelp(null)
      return
    }
    setError(false)
    setSubmitted(true)
  }

  return (
    <SectionShell width={920} tone={tone} rule="bottom" className={className}>
      <InView once variants={REVEAL} transition={{ duration: 0.8, ease: EASE }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-10 rounded-2xl border bg-card p-5 shadow-sm sm:max-w-sm">
        <div className="flex items-center justify-between">
          <MonoLabel>Booking request</MonoLabel>
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Jönköping
          </span>
        </div>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="qts-help-name" className="text-[12px] font-semibold text-foreground">
                Name
              </label>
              <HelpPopover
                field="name"
                open={openHelp === "name"}
                onOpenChange={(o) => setOpenHelp(o ? "name" : null)}
              />
            </div>
            <input
              id="qts-help-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError(false)
              }}
              placeholder="Elsa Bergström"
              autoComplete="name"
              aria-invalid={error || undefined}
              className={cn(FIELD, "mt-1.5 h-10", error && "border-primary")}
            />
            {error && (
              <p className="mt-1.5 font-mono text-[11px] font-semibold text-primary">
                Required — we book by name
              </p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="qts-help-phone" className="text-[12px] font-semibold text-foreground">
                Phone
              </label>
              <HelpPopover
                field="phone"
                open={openHelp === "phone"}
                onOpenChange={(o) => setOpenHelp(o ? "phone" : null)}
              />
            </div>
            <input
              id="qts-help-phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+46 70 123 45 67"
              autoComplete="tel"
              className={cn(FIELD, "mt-1.5 h-10")}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="qts-help-notes" className="text-[12px] font-semibold text-foreground">
                Notes
              </label>
              <HelpPopover
                field="notes"
                open={openHelp === "notes"}
                onOpenChange={(o) => setOpenHelp(o ? "notes" : null)}
              />
            </div>
            <textarea
              id="qts-help-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, timing, preferred chair…"
              rows={3}
              className={cn(FIELD, "mt-1.5 min-h-20 py-2 leading-5")}
            />
          </div>
          <Button
            type="submit"
            className="h-10 w-full gap-2 rounded-md text-[13px] font-semibold"
          >
            {submitted ? (
              <>
                <Check className="size-4" aria-hidden />
                Request sent
              </>
            ) : (
              <>
                Request booking
                <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </button>
          <p aria-live="polite" className="sr-only">
            {submitted ? "Booking request sent — we will confirm by SMS" : ""}
          </p>
          {submitted && (
            <p className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              We confirm by SMS within the hour
            </p>
          )}
        </form>
      </div>
      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </SectionShell>
  )
}
