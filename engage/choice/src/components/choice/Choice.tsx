import * as React from "react"
import { useReducedMotion } from "motion/react"
import { Check } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"

// ── Design language ──────────────────────────────────────────────────────────
// JOB: collapse a "which one do I want?" fog into ONE decision, made twice.
// EMOTION: agency without pressure — the page visibly commits to your pick.
// SIGNATURE MOVE: two doors. The one you choose physically TAKES THE ROOM —
//   flex-weight eases from 1:1 to 1:1.6 like a bouncer stepping aside — while
//   the other settles to a quiet outline. Un-selected is not rejected: it is
//   still one click back. Mobile: stacked, chosen panel gains the ink border.
// TYPE: question as display 28px; door titles 15px bold caps-mono eyebrow.
// ─────────────────────────────────────────────────────────────────────────────

export type ChoiceOption = {
  id: string
  title: string
  description?: string
  /** corner chip — e.g. "most chosen", "quietest room" */
  tag?: string
  image?: string
  imageAlt?: string
}

export type ChoiceProps = {
  question: string
  options: ChoiceOption[]
  defaultId?: string
  value?: string
  onChange?: (id: string) => void
  /** Label shown inside the chosen door's CTA row. */
  confirmLabel?: string
  className?: string
}

function Door({
  o,
  chosen,
  grow,
  onSelect,
  confirmLabel,
}: {
  o: ChoiceOption
  chosen: boolean
  grow?: "yes" | "no" | "mobile"
  onSelect: () => void
  confirmLabel?: string
}) {
  const Icon = chosen ? Check : undefined
  return (
    <RadioGroupItem
      value={o.id}
      onClick={onSelect}
      className={cn(
        "group relative flex h-auto w-auto min-h-[220px] flex-1 shrink flex-col overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-[flex-grow,border-color,background-color,box-shadow,transform] duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[300px]",
        chosen
          ? "border-foreground bg-card shadow-md ring-1 ring-foreground/10"
          : "border-border bg-card/40 hover:border-foreground/30 hover:bg-card/60 hover:shadow-sm",
      )}
      style={grow === "yes" ? { flexGrow: 1.55 } : undefined}
    >
      {o.image && (
        <img
          src={o.image}
          alt={o.imageAlt ?? o.title}
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-700",
            chosen ? "opacity-100 scale-[1.02]" : "opacity-40 grayscale-[35%] group-hover:opacity-60"
          )}
        />
      )}
      {chosen && <span aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/0" />}

      <span className="relative z-10 flex items-start justify-between gap-3">
        {o.tag && (
          <span className={cn("rounded-full px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.15em]", chosen ? "bg-background text-foreground" : "border bg-background/80 text-muted-foreground")}>
            {o.tag}
          </span>
        )}
        <span
          className={cn(
            "ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors",
            chosen ? "border-transparent bg-foreground text-background" : "border-border bg-background/80 text-transparent group-hover:border-foreground/40"
          )}
          aria-hidden
        >
          {Icon && <Check className="h-3.5 w-3.5 stroke-[3]" />}
        </span>
      </span>

      <span className={cn("relative z-10 mt-auto block", chosen ? "text-white" : "text-foreground")}>
        <span className="block font-mono text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Option {o.id.slice(0, 1).toUpperCase() + ""}</span>
        <span className="mt-1 block font-display text-lg font-extrabold tracking-tight">{o.title}</span>
        {o.description && <span className={cn("mt-1 block max-w-[34ch] text-[13px] font-medium leading-relaxed", chosen ? "text-white/80" : "text-muted-foreground")}>{o.description}</span>}
        {chosen && confirmLabel && <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-[0.2em]">{confirmLabel}<span aria-hidden>→</span></span>}
      </span>
    </RadioGroupItem>
  )
}

export function Choice({ question, options, defaultId, value, onChange, confirmLabel = "This one", className }: ChoiceProps) {
  const reduce = useReducedMotion()
  const controlled = value !== undefined
  const [internal, setInternal] = React.useState(defaultId ?? "")
  const picked = controlled ? value : internal
  const groupId = React.useId()
  if (options.length < 2) return null

  const select = (id: string) => {
    if (!controlled) setInternal(id)
    onChange?.(id)
  }

  return (
    <section className={cn("w-full bg-background text-foreground", className)} aria-labelledby={`${groupId}-title`}>
      <InView variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} viewOptions={{ once: true, margin: "-60px" }}>
        <div className="mx-auto w-full max-w-[1000px] px-4 py-16 sm:px-6 lg:py-20">
          <h2 id={`${groupId}-title`} className="max-w-xl font-display text-[26px] font-black leading-[1.1] tracking-tight sm:text-3xl">
            {question}
          </h2>
          <p id={`${groupId}-desc`} className="mt-2 max-w-md text-sm font-medium text-muted-foreground">
            There is no wrong door — only the one you’d rather walk through today.
          </p>

          <RadioGroup
            value={picked}
            onValueChange={(v) => select(v)}
            aria-labelledby={`${groupId}-title`}
            aria-describedby={`${groupId}-desc`}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5 [&_[data-slot=radio-group-indicator]]:hidden"
          >
            {options.map((o) => (
              <Door
                key={o.id}
                o={o}
                chosen={picked === o.id}
                grow={!reduce && picked === o.id ? "yes" : undefined}
                onSelect={() => select(o.id)}
                confirmLabel={confirmLabel}
              />
            ))}
          </RadioGroup>
          <p className="sr-only" aria-live="polite">
            Selected: {options.find((o) => o.id === picked)?.title ?? "none"}
          </p>
        </div>
      </InView>
    </section>
  )
}
