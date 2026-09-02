import * as React from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, LayoutGrid } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Rearrange dashboard widgets across a multi-zone grid.
// ═══ EMOTION     Your dashboard, your composition.
// ═══ SIGNATURE   Widgets move between named zones via a drag-over remap.

export type Widget = { id: string; title: string; body?: string }
export type WidgetZone = { id: string; title: string; widgets: Widget[] }

export type DndDashboardWidgetsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  zones?: WidgetZone[]
  onChange?: (zones: WidgetZone[]) => void
  onReset?: () => void
  className?: string
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_DASHBOARD_WIDGETS_ZONES = [ { id: "z1", title: "Headline", widgets: [{ id: "w1", title: "Revenue", body: "Monthly recurring revenue." }, { id: "w2", title: "Bookings", body: "This week's sessions." }] }, { id: "z2", title: "Operational", widgets: [{ id: "w3", title: "No-show rate", body: "Rolling 30 days." }, { id: "w4", title: "Staff load", body: "Capacity per therapist." }] }, { id: "z3", title: "Growth", widgets: [{ id: "w5", title: "Waitlist", body: "People waiting for slots." }] }, ]


export function DndDashboardWidgets({
  eyebrow = "DASH",
  title = "Compose your dashboard.",
  subtitle = "Move widgets between zones or reorder within a zone. Every zone re-flows instantly.",
  zones = DEMO_DND_DASHBOARD_WIDGETS_ZONES,
  onChange,
  className,
}: DndDashboardWidgetsProps) {
  const [state, setState] = React.useState(zones)
  React.useEffect(() => { setState(zones) }, [zones])
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(zones)
  const handleReset = () => {
    setState(initialRef.current)
    onChange?.(initialRef.current)
    setAnnounce("Dashboard reset")
  }
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const getZoneForId = React.useCallback((id: string, zonesSnapshot: WidgetZone[]): string | null => {
    if (zonesSnapshot.some((z) => z.id === id)) return id
    for (const z of zonesSnapshot) if (z.widgets.some((w) => w.id === id)) return z.id
    return null
  }, [])

  const findZone = React.useCallback((id: string): string | null => getZoneForId(id, state), [state, getZoneForId])

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragCancel = () => setActiveId(null)

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return
    const aId = String(active.id)
    const oId = String(over.id)
    setState((prev) => {
      const fromZ = getZoneForId(aId, prev)
      const toZ = getZoneForId(oId, prev)
      if (!fromZ || !toZ || fromZ === toZ) return prev
      const moving = prev.find((z) => z.id === fromZ)!.widgets.find((w) => w.id === aId)
      if (!moving) return prev
      const without = prev.map((z) => (z.id === fromZ ? { ...z, widgets: z.widgets.filter((w) => w.id !== aId) } : z))
      const oIdx = without.find((z) => z.id === toZ)!.widgets.findIndex((w) => w.id === oId)
      const insertAt = oIdx >= 0 ? oIdx : without.find((z) => z.id === toZ)!.widgets.length
      const next = without.map((z) =>
        z.id === toZ ? { ...z, widgets: [...z.widgets.slice(0, insertAt), moving, ...z.widgets.slice(insertAt)] } : z,
      )
      queueMicrotask(() => onChange?.(next))
      return next
    })
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(active.id)}`)
    if (!over) return
    const aId = String(active.id)
    const oId = String(over.id)
    setState((prev) => {
      const zid = getZoneForId(aId, prev)
      const overZid = getZoneForId(oId, prev)
      if (zid && overZid === zid) {
        const zone = prev.find((z) => z.id === zid)!
        const oldIndex = zone.widgets.findIndex((w) => w.id === aId)
        const newIndex = zone.widgets.findIndex((w) => w.id === oId)
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const next = prev.map((z) => (z.id === zid ? { ...z, widgets: arrayMove(zone.widgets, oldIndex, newIndex) } : z))
          queueMicrotask(() => onChange?.(next))
          return next
        }
      } else if (zid && overZid) {
        queueMicrotask(() => onChange?.(prev))
      }
      return prev
    })
  }

  const active = activeId ? state.flatMap((z) => z.widgets).find((w) => w.id === activeId) : null

  return (
    <SectionShell width={1280} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {state.flatMap(z=>z.widgets).length} items
          </span>
          <span className="hidden sm:inline text-xs font-medium text-muted-foreground">Drag or keyboard — Tab → Space → Arrows</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-7 rounded-full px-3 text-xs font-medium shadow-sm">
            Reset
          </Button>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">A11y • Advanced</span>
        </div>
      </div>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">{announce}</div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {state.map((zone) => (
            <Zone key={zone.id} zone={zone} />
          ))}
        </div>
        <DragOverlay>{active ? <WidgetCard widget={active} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function Zone({ zone }: { zone: WidgetZone }) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="flex items-center gap-2 px-1 pb-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <LayoutGrid className="h-3.5 w-3.5" /> {zone.title}
        <span className="ml-auto rounded-full bg-accent px-2 font-mono text-[10px] font-semibold tabular-nums">{zone.widgets.length}</span>
      </p>
      <SortableContext items={zone.widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
        <div className="grid min-h-[120px] grid-cols-1 gap-2 sm:grid-cols-2">
          {zone.widgets.map((w) => (
            <WidgetCard key={w.id} widget={w} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

function WidgetCard({ widget, overlay = false }: { widget: Widget; overlay?: boolean }) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: widget.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn("flex cursor-grab touch-none flex-col rounded-xl border bg-card p-4 active:cursor-grabbing", isDragging && "dnd-lift opacity-90", overlay && "dnd-lift")}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold tracking-tight">{widget.title}</p>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {widget.body && <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">{widget.body}</p>}
    </div>
  )
}
