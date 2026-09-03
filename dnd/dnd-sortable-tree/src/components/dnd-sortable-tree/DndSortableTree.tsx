import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ChevronRight, File, FileText, Folder, GripVertical } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ═══ JOB         Rearrange a collapsible, multi-level file tree.
// ═══ EMOTION     Structure you own at any depth.
// ═══ SIGNATURE   Recursive sortable rows with a flatten/flattenIndex projection.

export type TreeNode = { id: string; label: string; children?: TreeNode[]; type?: "folder" | "file" }

export type DndSortableTreeProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  nodes?: TreeNode[]
  onChange?: (nodes: TreeNode[]) => void
  className?: string
}

type FlatNode = { node: TreeNode; parentId: string | null; depth: number; index: number }

function flatten(nodes: TreeNode[], parentId: string | null = null, depth = 0): FlatNode[] {
  return nodes.flatMap((node, index) => [{ node, parentId, depth, index }, ...flatten(node.children ?? [], node.id, depth + 1)])
}

// rebuild the nested tree from a flattened list using the recorded parent links
function unflatten(flat: FlatNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>()
  const root: TreeNode[] = []
  for (const { node } of flat) map.set(node.id, { ...node, children: [] })
  for (const { node, parentId } of flat) {
    const clone = map.get(node.id)!
    if (parentId && map.has(parentId)) map.get(parentId)!.children!.push(clone)
    else root.push(clone)
  }
  return root
}

// Self-demo defaults: a bare mount (tablet/mobile device frames, library consumers)
// reproduces the same demo the engine desktop view shows.
const DEMO_DND_SORTABLE_TREE_NODES: TreeNode[] = [ { id: "root", label: "Project", type: "folder", children: [ { id: "src", label: "src", type: "folder", children: [ { id: "app", label: "app.tsx", type: "file" }, { id: "main", label: "main.tsx", type: "file" }, ] }, { id: "pkg", label: "package.json", type: "file" }, { id: "readme", label: "README.md", type: "file" }, ] }, { id: "dist", label: "dist", type: "folder", children: [] }, ]


export function DndSortableTree({
  eyebrow = "TREE",
  title = "Rebuild the tree.",
  subtitle = "Drag any node to a new spot. Children travel with their parent.",
  nodes = DEMO_DND_SORTABLE_TREE_NODES,
  onChange,
  className,
}: DndSortableTreeProps) {
  const [internal, setInternal] = React.useState(nodes)
  React.useEffect(() => { setInternal(nodes) }, [nodes])
  const tree = internal
  const flat = React.useMemo(() => flatten(tree), [tree])
  const flatIds = flat.map((f) => f.node.id)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announce, setAnnounce] = React.useState("")
  const initialRef = React.useRef(nodes)
  const handleReset = () => { setInternal(nodes); onChange?.(nodes); setAnnounce("Tree reset"); }
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const onDragStart = ({ active }: DragStartEvent) => setActiveId(String(active.id))
  const onDragCancel = () => setActiveId(null)

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null)
    setAnnounce(`Moved ${String(active.id)}`)
    if (!over) return
    const activeIdv = String(active.id)
    const overId = String(over.id)
    if (activeIdv === overId) return
    const oldIndex = flat.findIndex((f) => f.node.id === activeIdv)
    const newIndex = flat.findIndex((f) => f.node.id === overId)
    if (oldIndex < 0 || newIndex < 0) return
    const moved = arrayMove(flat, oldIndex, newIndex)
    const next = unflatten(moved)
    setInternal(next)
    onChange?.(next)
  }

  const active = activeId ? flat.find((f) => f.node.id === activeId)?.node : null

  const toggle = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }))

  return (
    <SectionShell width={760} rule="bottom" className={className}>
      <InView once variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/50 px-4 py-3 shadow-sm ">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground/80" />
            {flat.length} items
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragCancel={onDragCancel} onDragEnd={onDragEnd}>
        <SortableContext items={flatIds} strategy={verticalListSortingStrategy}>
          <ul className="mt-8 space-y-1">
            {flat.map(({ node, depth }) => {
              const collapsedAt = anyAncestorCollapsed(flat, node.id, collapsed)
              if (collapsedAt) return null
              const isCollapsed = !!collapsed[node.id]
              return (
                <TreeRow
                  key={node.id}
                  node={node}
                  depth={depth}
                  collapsed={isCollapsed}
                  hasChildren={(node.children?.length ?? 0) > 0}
                  onToggle={() => toggle(node.id)}
                />
              )
            })}
          </ul>
        </SortableContext>
        <DragOverlay>{active ? <TreeRow node={active} depth={0} collapsed={false} hasChildren={(active.children?.length ?? 0) > 0} overlay /> : null}</DragOverlay>
      </DndContext>
    </SectionShell>
  )
}

function anyAncestorCollapsed(flat: FlatNode[], id: string, collapsed: Record<string, boolean>): boolean {
  const found = flat.find((f) => f.node.id === id)
  if (!found?.parentId) return false
  if (collapsed[found.parentId]) return true
  return anyAncestorCollapsed(flat, found.parentId, collapsed)
}

function TreeRow({
  node,
  depth,
  collapsed,
  hasChildren,
  onToggle,
  overlay = false,
}: {
  node: TreeNode
  depth: number
  collapsed: boolean
  hasChildren: boolean
  onToggle?: () => void
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id })
  const Icon = node.type === "folder" ? Folder : node.type === "file" ? FileText : File
  return (
    <li>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className={cn(
          "flex items-center gap-2 rounded-xl border bg-card py-2.5 pr-3 transition-shadow",
          isDragging && "dnd-lift opacity-90",
          overlay && "dnd-lift",
        )}
      >
        <span className="pl-2" style={{ marginLeft: depth * 20 }} />
        <Button type="button" variant="ghost" size="icon-xs" onClick={onToggle} tabIndex={-1} className={cn("h-6 w-6 text-muted-foreground", hasChildren && "hover:bg-accent")} aria-label="Toggle">
          <ChevronRight className={cn("h-4 w-4 transition-transform", collapsed && "-rotate-90", !hasChildren && "opacity-0")} />
        </Button>
        {/* dnd-kit grip handle: listeners require a real <button> element, not the registry Button. */}
        <button type="button" {...attributes} {...listeners} className="flex flex-1 cursor-grab touch-none items-center gap-2 text-left active:cursor-grabbing">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="text-sm font-semibold tracking-tight">{node.label}</span>
        </button>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
    </li>
  )
}
