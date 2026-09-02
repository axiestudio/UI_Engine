import * as React from "react"
import { ArrowRight, ChevronRight, Menu, SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type CommandLink = { label: string; href: string; group?: string; keywords?: string; shortcut?: string }

export type HeaderCommandProps = {
  brand?: string
  logo?: React.ReactNode
  links?: CommandLink[]
  cta?: { label: string; href?: string; onClick?: () => void }
  /** Keys that open the palette. Default "⌘K". */
  hotkey?: boolean
  onSelect?: (link: CommandLink) => void
  className?: string
}

// ── HeaderCommand ────────────────────────────────────────────────────────────
// Design decisions (refactored):
// · The search trigger is still a first-class nav citizen — now rendered as a
//   real field (bordered, hover-lift, focus ring, kbd stamp with shadow) so
//   it invites the click instead of hinting at it.
// · ⌘K / Ctrl+K works anywhere; "/" opens too. Links auto-group by `group`
//   in first-seen order; the palette gains a hint footer.
// · The bar stays tight (h-14, hairline, blur) — all voice lives in the
//   palette, none in the chrome. Mobile sheet mirrors the same field.

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_HEADER_COMMAND_LINKS = [ { label: "Pricing", href: "#", group: "Pages" }, { label: "Journal", href: "#", group: "Pages" }, { label: "Book a session", href: "#", group: "Actions", shortcut: "B" }, { label: "Buy gift card", href: "#", group: "Actions" }, ]


export function HeaderCommand({
  brand = "Brand",
  logo,
  links = DEMO_HEADER_COMMAND_LINKS,
  cta,
  hotkey = true,
  onSelect,
  className,
}: HeaderCommandProps) {
  const [open, setOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const isMac = React.useMemo(
    () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform ?? navigator.userAgent),
    [],
  )
  const modKey = isMac ? "⌘" : "Ctrl"

  React.useEffect(() => {
    if (!hotkey) return
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement))) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [hotkey])

  // group in first-seen order
  const groups = React.useMemo(() => {
    const map = new Map<string, CommandLink[]>()
    for (const l of links) {
      const g = l.group ?? "Pages"
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(l)
    }
    return [...map.entries()]
  }, [links])

  return (
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl", className)}>
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <a href="#" className="flex shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          {logo ?? (
            <span className="flex items-center gap-2.5">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary font-display text-[12px] font-black text-primary-foreground shadow-sm">
                {brand.slice(0, 1)}
              </span>
              <span className="font-display text-sm font-extrabold tracking-tight">{brand}</span>
            </span>
          )}
        </a>

        <nav aria-label="Primary" className="hidden flex-1 items-center gap-1 lg:flex">
          {links.slice(0, 4).map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 motion-reduce:transition-none"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* the field-as-trigger */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open search"
            aria-keyshortcuts={hotkey ? "Meta+K Control+K" : undefined}
            className={cn(
              "group inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-secondary/50 text-muted-foreground transition-colors",
              "hover:border-ring/40 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              "w-9 justify-center md:w-56 md:justify-between md:px-3",
            )}
          >
            <span className="inline-flex items-center gap-2 text-[13px] font-medium">
              <SearchIcon className="size-3.5" />
              <span className="hidden md:inline">Search…</span>
            </span>
            <kbd className="hidden items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground shadow-sm md:inline-flex">
              {modKey}K
            </kbd>
          </button>

          {cta &&
            (cta.href ? (
              <Button asChild size="sm" className="hidden rounded-full font-semibold shadow-sm sm:inline-flex">
                <a href={cta.href} onClick={cta.onClick} className="group">
                  {cta.label}
                  <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={cta.onClick} className="hidden rounded-full font-semibold shadow-sm sm:inline-flex">
                {cta.label}
              </Button>
            ))}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 lg:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div className={cn("overflow-hidden border-border transition-[max-height] duration-300 ease-out lg:hidden", mobileOpen ? "max-h-96 border-t" : "max-h-0 motion-reduce:transition-none")}>
        <div className="mx-auto max-w-[1200px] px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false)
              setOpen(true)
            }}
            className="mb-2 flex w-full items-center justify-between rounded-lg border border-input bg-secondary/50 px-3 py-2.5 text-[13px] font-medium text-muted-foreground"
          >
            <span className="inline-flex items-center gap-2">
              <SearchIcon className="size-3.5" />
              Search…
            </span>
            <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">{modKey}K</kbd>
          </button>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-lg px-2 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent last:mb-1"
            >
              {l.label}
              <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden />
            </a>
          ))}
          {cta && (
            <Button size="sm" className="mt-2 w-full rounded-full font-semibold" onClick={cta.onClick} asChild={Boolean(cta.href)}>
              {cta.href ? <a href={cta.href}>{cta.label}</a> : <span>{cta.label}</span>}
            </Button>
          )}
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {groups.map(([heading, items]) => (
            <CommandGroup key={heading} heading={heading}>
              {items.map((l) => (
                <CommandItem
                  key={l.label}
                  value={l.label}
                  keywords={l.keywords ? [l.keywords] : undefined}
                  onSelect={() => {
                    setOpen(false)
                    onSelect?.(l)
                  }}
                >
                  <span>{l.label}</span>
                  {l.shortcut && <CommandShortcut>{l.shortcut}</CommandShortcut>}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="flex items-center gap-4 border-t px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground/70">
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-background px-1 py-0.5">↑↓</kbd> navigate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-background px-1 py-0.5">↵</kbd> select
          </span>
          <span className="inline-flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-background px-1 py-0.5">esc</kbd> close
          </span>
        </div>
      </CommandDialog>
    </header>
  )
}
