import * as React from "react"
import { MotionConfig } from "motion/react"
import { ExternalLink, Globe, Pin, PinOff, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationQuote,
  InlineCitationSource,
} from "@/components/ai-elements/inline-citation"
import { HoverCardTrigger } from "@/components/ui/hover-card"

// ═══ APP-PRIMARY — answers people can trust have receipts visible on hover.
// JOB      prove generated claims without leaving the page
// ROUND 2  every [n] chip is an AI Elements InlineCitation on the vendored
//           Radix HoverCard (anchoring + collision is Radix's now — the old
//           getBoundingClientRect card is gone). Focus opens the card for
//           real (Radix trigger onFocus → open). Pin/unpin and list removal
//           are a live state machine under the prose.
// SIGNATURE [3] markers sup-style with a dotted underline; hover/focus pops a
//           CARD (title, domain favicon slot, snippet quoted); the source
//           column underneath marks used/unused, pins rows (they ride to the
//           top with the brand ring) and REMOVES them — a removed source
//           deactivates its chip in the body above.
// A11Y     chips are registry Buttons inside HoverCardTrigger (focus shows
//           card); pin/remove announce politely.

export type Source = { n: number; title: string; domain: string; snippet: string; href?: string }
export type CitationHoverCardProps = { children: string; sources: Source[]; className?: string; defaultPinned?: number[]; showList?: boolean; /** render root as inline span for embedding inside answer prose */ as?: "div" | "span" }

export function CitationHoverCard({ children, sources, className, defaultPinned = [], showList = true, as: Root = "div" }: CitationHoverCardProps) {
  const [pinned, setPinned] = React.useState<number[]>(defaultPinned)
  const [removed, setRemoved] = React.useState<number[]>([])
  const [announce, setAnnounce] = React.useState("")
  const parts = React.useMemo(() => children.split(/(\[\d+\])/g), [children])
  const live = sources.filter((s) => !removed.includes(s.n))
  const isUsed = (n: number) => new RegExp(`\\[${n}\\](?!\\d)`).test(children)
  const togglePin = (n: number) => {
    setPinned((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))
    setAnnounce(pinned.includes(n) ? `Citation ${n} unpinned.` : `Citation ${n} pinned to the receipt list.`)
  }
  const ordered = [...live].sort((a, b) => Number(pinned.includes(b.n)) - Number(pinned.includes(a.n)) || a.n - b.n)
  return (
    <Root className={cn("font-sans text-[13px] leading-[1.75]", showList ? "block" : "inline", className)}>
      <MotionConfig reducedMotion="user">
        <span className={cn(showList ? "block whitespace-pre-wrap" : "inline whitespace-pre-wrap")}>
          {parts.map((p, i) => {
            const m = p.match(/^\[(\d+)\]$/)
            if (!m) return <React.Fragment key={i}>{p}</React.Fragment>
            const n = +m[1]
            const src = live.find((s) => s.n === n)
            if (!src) {
              return <sup key={i} aria-label={`Citation ${n} removed from the list`} className="mx-px font-mono text-[10px] text-muted-foreground/50 line-through">{p}</sup>
            }
            return (
              <InlineCitationCard key={i}>
                <HoverCardTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Citation ${n}: ${src.title}. Pinned: ${pinned.includes(n) ? "yes" : "no"}`}
                    className={cn("mx-px inline-flex h-auto items-baseline rounded px-0.5 align-super font-mono text-[10px] font-medium leading-none text-[hsl(var(--info))] underline decoration-dotted underline-offset-2 hover:bg-[hsl(var(--info)/0.08)]", pinned.includes(n) && "ring-1 ring-[hsl(var(--pinned)/0.6)]")}
                  >
                    {p}
                  </Button>
                </HoverCardTrigger>
                <InlineCitationCardBody align="start" sideOffset={6}>
                  <InlineCitationSource
                    title={src.title}
                    url={src.href ?? `https://${src.domain}`}
                    description={undefined}
                    className="space-y-0"
                  >
                    <span className="mb-1 flex items-center gap-1.5">
                      <span aria-hidden className="grid size-5 shrink-0 place-items-center rounded border border-border/60 bg-muted/40 text-[9px] font-black uppercase text-muted-foreground">{src.domain.slice(0, 2)}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Globe className="size-3" aria-hidden />{src.domain}</span>
                    </span>
                    <InlineCitationQuote className="mt-2 not-italic">“{src.snippet}”</InlineCitationQuote>
                  </InlineCitationSource>
                  <span className="mt-2 flex items-center gap-1.5 border-t border-border/60 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => togglePin(n)} className="h-6 gap-1.5 px-2 text-[11px] font-medium" aria-pressed={pinned.includes(n)}>
                      {pinned.includes(n) ? <PinOff className="size-3" /> : <Pin className="size-3" />} {pinned.includes(n) ? "unpin" : "pin"}
                    </Button>
                    {src.href && (
                      <a href={src.href} className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--info))] hover:underline">open source <ExternalLink className="size-3" /></a>
                    )}
                  </span>
                </InlineCitationCardBody>
              </InlineCitationCard>
            )
          })}
        </span>
        {showList && (
          <section aria-label="Citation list" className="mt-3 rounded-lg border border-border/60 bg-card">
            <header className="flex h-8 items-center justify-between border-b border-border/60 bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Receipts · {live.length} source{live.length === 1 ? "" : "s"}</span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{pinned.filter((n) => live.some((s) => s.n === n)).length} pinned</span>
            </header>
            {ordered.length === 0 ? (
              <p className="px-3 py-2.5 text-[11px] text-muted-foreground">All sources were removed from the list.</p>
            ) : (
              <ul className="divide-y divide-[hsl(var(--app-line))]">
                {ordered.map((s) => (
                  <li key={s.n} className={cn("flex items-start gap-2 px-3 py-2", pinned.includes(s.n) && "bg-[hsl(var(--pinned)/0.06)] shadow-[inset_2px_0_0_hsl(var(--pinned))]")}>
                    <span className={cn("mt-px shrink-0 rounded border px-1 font-mono text-[10px] font-bold", pinned.includes(s.n) ? "border-[hsl(var(--pinned)/0.5)] text-[hsl(var(--pinned))]" : "border-border/60 text-muted-foreground")}>{s.n}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-semibold">{s.title}</span>
                      <span className="block truncate text-[10px] text-muted-foreground">{s.domain}</span>
                    </span>
                    <span className={cn("shrink-0 rounded-full border px-1.5 py-px font-mono text-[9px] font-bold uppercase", isUsed(s.n) ? "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]" : "border-border/60 text-muted-foreground")}>{isUsed(s.n) ? "used" : "unused"}</span>
                    <Button type="button" variant="ghost" size="icon" aria-label={`${pinned.includes(s.n) ? "Unpin" : "Pin"} citation ${s.n}`} onClick={() => togglePin(s.n)} className={cn("size-6 shrink-0 text-muted-foreground hover:text-foreground", pinned.includes(s.n) && "text-[hsl(var(--pinned))]")}>
                      {pinned.includes(s.n) ? <PinOff className="size-3.5" /> : <Pin className="size-3.5" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remove citation ${s.n} from the list`} onClick={() => { setRemoved((r) => [...r, s.n]); setPinned((p) => p.filter((x) => x !== s.n)); setAnnounce(`Citation ${s.n} removed; its marker is inert.`) }} className="size-6 shrink-0 text-muted-foreground hover:text-[hsl(var(--err))]">
                      <X className="size-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
        <span className="sr-only" aria-live="polite">{announce}</span>
      </MotionConfig>
    </Root>
  )
}
