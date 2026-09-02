import * as React from "react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import {
  Drawer as VaulDrawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/watermelon/drawer"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type DrawerAction = {
  label: string
  href?: string
  onClick?: () => void
  /** Renders the row as a callout chip, e.g. the primary CTA. */
  primary?: boolean
}

export type DrawerProps = {
  /** Trigger element (button/link). The preset renders a token-styled one when omitted. */
  trigger?: React.ReactNode
  triggerLabel?: string
  title?: string
  description?: string
  /** Stacked action rows (nav / quick actions). */
  items?: DrawerAction[]
  /** Free slot below the actions. */
  children?: React.ReactNode
  /** Sticky-ish footer (book now…). Accepts strings for labels. */
  footer?: React.ReactNode
  onOpenChange?: (open: boolean) => void
  className?: string
}

// ── Drawer ───────────────────────────────────────────────────────────────────

// Demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same sheet the engine desktop demo shows.
const DEMO_TITLE = "Studio menu"
const DEMO_DESCRIPTION = "Everything the desktop nav has, one thumb away."
const DEMO_ITEMS: DrawerAction[] = [
  { label: "Book a session", primary: true, href: "#book" },
  { label: "Treatments", href: "#" },
  { label: "Visit us", href: "#" },
  { label: "Journal", href: "#" },
]
const DEMO_FOOTER = "Open today · until 18:00"

export function Drawer({
  trigger,
  triggerLabel = "Menu",
  title = DEMO_TITLE,
  description = DEMO_DESCRIPTION,
  items = DEMO_ITEMS,
  children,
  footer = DEMO_FOOTER,
  onOpenChange,
  className,
}: DrawerProps) {
  return (
    <VaulDrawer onOpenChange={onOpenChange}>
      {trigger ? (
        <DrawerTrigger asChild>
          {trigger}
        </DrawerTrigger>
      ) : (
        <DrawerTrigger
          className="inline-flex h-10 items-center gap-2 rounded-full border bg-card px-4 text-sm font-bold tracking-tight shadow-xs transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={triggerLabel}
        >
          <Menu className="h-4 w-4" /> {triggerLabel}
        </DrawerTrigger>
      )}
      <DrawerContent className={cn("border-border bg-background text-foreground", className)}>
        <DrawerClose className="absolute right-4 top-4 rounded-full border bg-card p-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DrawerClose>
        {(title || description) && (
          <DrawerHeader className="text-left">
            {title && <DrawerTitle className="font-display text-lg font-extrabold tracking-tight">{title}</DrawerTitle>}
            {description && <DrawerDescription className="text-sm text-muted-foreground">{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        <div className="flex flex-col gap-2 px-4 pb-4">
          {items.map((item) => {
            const inner = (
              <span className={cn("flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold tracking-tight", item.primary ? "bg-foreground text-background shadow-sm" : "border bg-card", "active:scale-[0.99] transition-transform")}>
                {item.label}
                <ArrowUpRight className={cn("h-4 w-4", item.primary ? "text-background/70" : "text-muted-foreground")} />
              </span>
            )
            const key = item.label
            return item.href ? (
              <a key={key} href={item.href} onClick={item.onClick}>
                {inner}
              </a>
            ) : (
              <button key={key} type="button" onClick={item.onClick as (() => void) | undefined}>
                {inner}
              </button>
            )
          })}
          {children}
        </div>
        {footer && <DrawerFooter>{footer}</DrawerFooter>}
      </DrawerContent>
    </VaulDrawer>
  )
}
