import * as React from "react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useClick,
  useDismiss,
  useRole,
  useHover,
  useFocus,
  safePolygon,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { ArrowDownUp, Check, ChevronDown, Columns3, Filter, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

// ═══ JOB         Give a data table an honest toolbar — no dead buttons.
// ═══ EMOTION     Quiet command of the grid.
// ═══ SIGNATURE   Every toolbar control is a real Floating UI surface:
//                 the filter opens a popover, the columns open a menu with
//                 checkboxes, sort/search explain themselves in tooltips —
//                 and every surface flips + shifts when it runs out of room.

function usePopover(initial = false) {
  const [open, setOpen] = React.useState(initial)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "dialog" })
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role])
  return { open, setOpen, refs, floatingStyles, getReferenceProps, getFloatingProps, context }
}

function ToolbarButton({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: (ctx: { close: () => void }) => React.ReactNode
}) {
  const { open, setOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } = usePopover()
  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        aria-expanded={open}
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          open && "border-primary/60 bg-muted",
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        {label}
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} className="z-50 w-60 rounded-xl border border-border bg-card p-1.5 shadow-[0_16px_40px_-16px_hsl(var(--foreground)/0.4)]">
            {children({ close: () => setOpen(false) })}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

function MenuItem({ checked, label, onClick }: { checked?: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      role={checked === undefined ? "menuitem" : "menuitemcheckbox"}
      aria-checked={checked}
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:bg-muted focus-visible:ring-1 focus-visible:ring-ring"
    >
      <span aria-hidden className={cn("flex size-4 items-center justify-center rounded border", checked ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  )
}

const PLANTS = [
  { name: "Agapanthus", latin: "Agapanthus praecox", sun: "Full sun", water: "Minimum" },
  { name: "Aloe", latin: "Aloe vera", sun: "Full sun", water: "Minimum" },
  { name: "Blue Jacaranda", latin: "Jacaranda mimosifolia", sun: "Part sun", water: "Average" },
  { name: "Chinese Money Plant", latin: "Pilea peperomioides", sun: "Part sun", water: "Average" },
  { name: "Christmas Bush", latin: "Ceratopetalum gummiferum", sun: "Full sun", water: "Average" },
  { name: "Dwarf Yucca", latin: "Yucca filamentosa", sun: "Full sun", water: "Minimum" },
]

function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const { refs, floatingStyles, context } = useFloating({
    placement: "top",
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  })
  const hover = useHover(context, { move: false })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss])
  const [open, setOpen] = React.useState(false)
  return (
    <>
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        ref: refs.setReference,
        "aria-label": label,
        ...getReferenceProps({ onMouseEnter: () => setOpen(true), onMouseLeave: () => setOpen(false), onFocus: () => setOpen(true), onBlur: () => setOpen(false) }),
      })}
      {open && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()} role="tooltip" className="z-50 rounded-md bg-foreground px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-background shadow-lg">
            {label}
          </div>
        </FloatingPortal>
      )}
    </>
  )
}

export type FloatingFilterToolbarProps = {
  title?: string
  className?: string
}

export function FloatingFilterToolbar({ title = "The plant bench — demo grid", className }: FloatingFilterToolbarProps) {
  const [query, setQuery] = React.useState("")
  const [sun, setSun] = React.useState<string | null>(null)
  const [water, setWater] = React.useState<string | null>(null)
  const [hiddenCols, setHiddenCols] = React.useState<string[]>([])
  const [sortAsc, setSortAsc] = React.useState(true)

  const rows = PLANTS.filter(
    (p) =>
      (p.name + p.latin).toLowerCase().includes(query.toLowerCase()) &&
      (!sun || p.sun === sun) &&
      (!water || p.water === water),
  ).sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))

  const toggleCol = (c: string) => setHiddenCols((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]))

  return (
    <div className={cn("w-full", className)}>
      <InView once variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
        <MonoLabel>{title}</MonoLabel>

        {/* toolbar */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants"
              aria-label="Search plants"
              className="h-9 w-48 rounded-md border bg-background pl-8 pr-3 text-[13px] font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <ToolbarButton icon={Filter} label="Filter">
            {({ close }) => (
              <div role="menu" aria-label="Filter">
                <p className="px-2.5 pb-1 pt-1.5 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">Sunlight</p>
                {["Full sun", "Part sun"].map((s) => (
                  <MenuItem key={s} checked={sun === s} label={s} onClick={() => { setSun(sun === s ? null : s); close() }} />
                ))}
                <p className="px-2.5 pb-1 pt-2 font-mono text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">Watering</p>
                {["Minimum", "Average"].map((w) => (
                  <MenuItem key={w} checked={water === w} label={w} onClick={() => { setWater(water === w ? null : w); close() }} />
                ))}
              </div>
            )}
          </ToolbarButton>

          <ToolbarButton icon={Columns3} label="Columns">
            {() => (
              <div role="menu" aria-label="Columns">
                {["Sunlight", "Watering"].map((c) => (
                  <MenuItem key={c} checked={!hiddenCols.includes(c)} label={c} onClick={() => toggleCol(c)} />
                ))}
              </div>
            )}
          </ToolbarButton>

          <Tooltip label={sortAsc ? "Sorted A → Z" : "Sorted Z → A"}>
            <button
              type="button"
              onClick={() => setSortAsc((s) => !s)}
              className="flex size-9 items-center justify-center rounded-md border bg-background transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowDownUp className="size-3.5" aria-hidden />
            </button>
          </Tooltip>

          <span aria-live="polite" className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {rows.length} of {PLANTS.length}
          </span>
        </div>

        {/* the grid */}
        <div className="mt-3 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b bg-muted/50 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-2.5 font-black">Name</th>
                {!hiddenCols.includes("Sunlight") && <th className="px-4 py-2.5 font-black">Sunlight</th>}
                {!hiddenCols.includes("Watering") && <th className="px-4 py-2.5 font-black">Watering</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.name} className="border-b border-border/50 last:border-b-0">
                  <td className="px-4 py-2.5">
                    <span className="font-bold">{p.name}</span>
                    <span className="ml-2 text-muted-foreground">{p.latin}</span>
                  </td>
                  {!hiddenCols.includes("Sunlight") && <td className="px-4 py-2.5 font-mono text-[11px] font-semibold">{p.sun}</td>}
                  {!hiddenCols.includes("Watering") && <td className="px-4 py-2.5 font-mono text-[11px] font-semibold">{p.water}</td>}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">Nothing matches — loosen a filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </InView>
    </div>
  )
}
