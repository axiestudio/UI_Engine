import * as React from "react"
import { ArrowRight, Menu, SearchIcon, X } from "lucide-react"
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
  links: CommandLink[]
  cta?: { label: string; href?: string; onClick?: () => void }
  /** Keys that open the palette. Default "⌘K". */
  hotkey?: boolean
  onSelect?: (link: CommandLink) => void
  className?: string
}

// ── HeaderCommand ────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · The search trigger is a first-class nav CITIZEN: it sits where links live,
//   styled as a quiet field with a kbd stamp — the palette IS the navigation.
// · ⌘K / Ctrl+K works anywhere; links auto-group by their `group` field, in
//   first-seen order, so consumers don't hand-build groups.
// · Bar itself is tight (h-14) with hairline bottom — all voice is in the
//   palette, none in the chrome.
export function HeaderCommand({
  brand = "Brand",
  logo,
  links,
  cta,
  hotkey = true,
  onSelect,
  className,
}: HeaderCommandProps) {
  const [open, setOpen] = React.useState(false)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  React.useEffect(() => {
    if (!hotkey) return
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
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
    <header className={cn("sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur", className)}>
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <a href="#" className="flex shrink-0 items-center gap-2">
          {logo ?? (
            <span className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-foreground font-display text-[11px] font-black text-background">
                {brand.slice(0, 1)}
              </span>
              <span className="font-display text-sm font-extrabold tracking-tight">{brand}</span>
            </span>
          )}
        </a>

        <nav aria-label="Primary" className="hidden flex-1 items-center gap-5 lg:flex">
          {links.slice(0, 4).map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open search"
            className={cn(
              "inline-flex h-9 items-center gap-2 border border-border bg-secondary/60 px-3 text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
              "w-9 justify-center md:w-52 md:justify-between",
            )}
          >
            <span className="inline-flex items-center gap-2 text-xs font-semibold">
              <SearchIcon className="size-3.5" />
              <span className="hidden md:inline">Search…</span>
            </span>
            <kbd className="hidden rounded-[3px] border bg-background px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-muted-foreground md:inline">⌘K</kbd>
          </button>

          {cta &&
            (cta.href ? (
              <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
                <a href={cta.href} onClick={cta.onClick} className="font-mono text-[11px] font-bold uppercase tracking-[0.12em]">
                  {cta.label}
                  <ArrowRight className="size-3.5" />
                </a>
              </Button>
            ) : (
              <Button size="sm" onClick={cta.onClick} className="hidden rounded-full sm:inline-flex">
                {cta.label}
              </Button>
            ))}

          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* mobile sheet */}
      <div className={cn("overflow-hidden border-t border-border transition-all duration-300 lg:hidden", mobileOpen ? "max-h-96" : "max-h-0")}>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block border-b border-border/60 py-3 text-sm font-semibold text-foreground last:border-0">
              {l.label}
            </a>
          ))}
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
      </CommandDialog>
    </header>
  )
}
