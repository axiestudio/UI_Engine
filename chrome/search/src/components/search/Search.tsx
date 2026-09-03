import * as React from "react"
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
import { SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type SearchItem = {
  label: string
  /** Unique value used as the item identity. Defaults to the label. */
  value?: string
  icon?: React.ElementType
  keywords?: string
  /** Right-aligned hint, e.g. "Docs". */
  shortcut?: string
}

export type SearchGroup = {
  heading: string
  items: SearchItem[]
}

export type SearchProps = {
  groups: SearchGroup[]
  onSelect?: (item: SearchItem, group: SearchGroup) => void
  placeholder?: string
  triggerLabel?: string
  /** Show the ⌘K hint inside the trigger. Default true. */
  hotkeyHint?: boolean
  /** Register a global ⌘K / Ctrl+K listener to open the palette. Default true. */
  hotkey?: boolean
  emptyLabel?: string
  className?: string
}

// ── Search ───────────────────────────────────────────────────────────────────

export function Search({
  groups,
  onSelect,
  placeholder = "Type a command or search…",
  triggerLabel = "Search",
  hotkeyHint = true,
  hotkey = true,
  emptyLabel = "No results found.",
  className,
}: SearchProps) {
  const [open, setOpen] = React.useState(false)

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

  const total = groups.reduce((n, g) => n + g.items.length, 0)
  if (!total) return null

  return (
    <div className={cn("w-full", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative isolate overflow-hidden w-full justify-between gap-8 font-medium text-muted-foreground sm:w-64"
        aria-label={triggerLabel}
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          {triggerLabel}
        </span>
        {hotkeyHint && <kbd className="pointer-events-none rounded-[3px] border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground shadow-[1px_1px_0_0_currentColor]">⌘K</kbd>}
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={placeholder} />
        <CommandList>
          <CommandEmpty>{emptyLabel}</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.heading} heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.value ?? item.label}
                    value={item.value ?? item.label}
                    keywords={item.keywords ? [item.keywords] : undefined}
                    onSelect={() => {
                      setOpen(false)
                      onSelect?.(item, group)
                    }}
                  >
                    {Icon && <Icon className="size-4 text-muted-foreground" />}
                    <span>{item.label}</span>
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </div>
  )
}
