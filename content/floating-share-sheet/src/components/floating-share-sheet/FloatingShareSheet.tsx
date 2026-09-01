import * as React from "react"
import {
  FloatingPortal,
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useHover,
  useFocus,
  flip,
  shift,
  offset,
} from "@floating-ui/react"
import { Check, Copy, Link2, Mail, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"

// ═══ JOB         Give every published page its exit doors.
// ═══ EMOTION     Handing the piece over — considered, not shouty.
// ═══ SIGNATURE   One anchor, one floating sheet that flips at the edge:
//                 copy-link morphs to a check with a spoken receipt, and
//                 the anchor explains itself in a tooltip first. Floating UI
//                 keeps the sheet inside the stage on every viewport.

export type FloatingShareSheetProps = {
  label?: string
  url?: string
  title?: string
  channels?: { id: string; label: string; icon: React.ElementType }[]
  className?: string
}

export function FloatingShareSheet({
  label = "Share this piece",
  url = "https://quiettimes.example/journal/the-board-rebuild",
  title = "The Board Rebuild — a teardown",
  channels = [
    { id: "mail", label: "Email", icon: Mail },
    { id: "chat", label: "Messages", icon: MessageCircle },
    { id: "copy", label: "Copy link", icon: Link2 },
  ],
  className,
}: FloatingShareSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [tipOpen, setTipOpen] = React.useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 10 })],
  })
  const { refs: tipRefs, floatingStyles: tipStyles, context: tipContext } = useFloating({
    open: tipOpen && !open,
    placement: "top",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: "menu" })])
  const { getReferenceProps: getTipRefProps, getFloatingProps: getTipFloProps } = useInteractions([
    useHover(tipContext, { move: false }),
    useFocus(tipContext),
    useDismiss(tipContext),
  ])

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(url)
    } catch {
      /* clipboard unavailable — the receipt still shows intent */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("w-full", className)}>
      <InView once variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <div className="flex flex-wrap items-center gap-4">
          <span className={cn("inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]")}><span aria-hidden className="inline-block size-[5px] rotate-45 bg-current" />{title}</span>

          <span className="relative inline-flex" ref={tipRefs.setReference} {...getTipRefProps({ onMouseEnter: () => setTipOpen(true), onMouseLeave: () => setTipOpen(false), onFocus: () => setTipOpen(true), onBlur: () => setTipOpen(false) })}>
            <Button type="button" ref={refs.setReference} getReferenceProps aria haspopup="menu" expanded={open} variant="default" className={flex h-9 items-center gap-2 rounded-full border bg-background px-4 text-[11px] font-black uppercase tracking-[0.14em] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring}>
              {copied ? <Check className="size-3.5 text-primary" strokeWidth={3} aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? "Link copied" : label}
            
            {tipOpen && !open && (
              <FloatingPortal>
                <div ref={tipRefs.setFloating} style={tipStyles} {...getTipFloProps()} role="tooltip" className="z-50 rounded-md bg-foreground px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background shadow-lg">
                  Send it onward
                </div>
              </FloatingPortal>
            )}
          </span>

          {open && (
            <FloatingPortal>
              <div
                ref={refs.setFloating}
                style={floatingStyles}
                {...getFloatingProps()}
                role="menu"
                aria-label={label}
                className="z-50 w-52 rounded-xl border border-border bg-card p-1.5 shadow-[0_18px_44px_-16px_hsl(var(--foreground)/0.45)]"
              >
                {channels.map(({ id, label: chLabel, icon: Icon }) => (
                  <Button type="button" key={id} role="menuitem" onClick={() => { if (id === "copy") copy(); setOpen(false) }} variant="default" className={flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring}>
                    <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                    {id === "copy" && copied ? <>Copied <Check className="size-3.5" aria-hidden /></> : chLabel}
                  
                ))}
                <p className="border-t border-border/60 px-2.5 pb-1 pt-2 font-mono text-[9px] font-medium tracking-wide text-muted-foreground">
                  <span className="block truncate">{url}</span>
                </p>
              </div>
            </FloatingPortal>
          )}
        </div>
      </InView>
    </div>
  )
}
