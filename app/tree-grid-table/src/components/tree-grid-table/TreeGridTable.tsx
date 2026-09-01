import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — org charts, file systems, BOMs: hierarchy that streams.
// JOB      browse unlimited nested rows without loading the ocean
// SIGNATURE rows reveal with a height spring; expanding a never-loaded row
//           calls loadChildren and shows an inline skeleton row first;
//           guides draw a subtle indentation rail per level.
// A11Y     nested lists with aria-expanded/owns; keyboard ←/→ fold + unfold.

export type TreeNode = { id: string; label: string; meta?: string; children?: TreeNode[] }
export type TreeGridTableProps = { nodes: TreeNode[]; loadChildren?: (n: TreeNode) => Promise<TreeNode[]>; defaultOpen?: string[]; className?: string }

export function TreeGridTable({ nodes, loadChildren, defaultOpen = [], className }: TreeGridTableProps) {
  const [open, setOpen] = React.useState<Set<string>>(new Set(defaultOpen))
  const [loading, setLoading] = React.useState<Set<string>>(new Set())
  const [kids, setKids] = React.useState<Record<string, TreeNode[]>>({})
  const toggle = async (n: TreeNode) => {
    setOpen((s) => { const c = new Set(s); if (c.has(n.id)) c.delete(n.id); else if (n.children || !loadChildren) c.add(n.id); else {
      if (!kids[n.id]) { setLoading((l) => new Set(l).add(n.id)) }
      c.add(n.id)
    } return c })
    if (!n.children && loadChildren && !kids[n.id]) {
      const r = await loadChildren(n)
      setKids((k) => ({ ...k, [n.id]: r }))
      setLoading((l) => { const c = new Set(l); c.delete(n.id); return c })
    }
  }
  const Row = ({ n, depth }: { n: TreeNode; depth: number }) => {
    const expanded = open.has(n.id)
    const children = n.children ?? kids[n.id]
    const fake = loadChildren && !children && expanded
    return (
      <li role="treeitem" aria-expanded={children || fake ? expanded : undefined}>
        <div style={{ paddingLeft: 10 + depth * 18 }} className="group relative flex h-9 items-center gap-1.5 text-[13px]">
          {depth > 0 && <span aria-hidden className="absolute left-[calc(10px+(var(--d)*18px)-9px)] top-0 h-full w-px bg-border/70" style={{ ["--d" as string]: depth - 1 } as React.CSSProperties} />}
          {children || fake ? (
            <Button type="button" variant="ghost" aria-label={`${expanded ? "Collapse" : "Expand"} ${n.label}`} onClick={() => toggle(n)} className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-accent"><motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.18 }} className="block"><ChevronRight className="size-4" /></motion.span></Button>
          ) : <span aria-hidden className="size-6 shrink-0" />}
          <span className="min-w-0 flex-1 truncate font-medium">{n.label}</span>
          {n.meta && <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 md:opacity-100">{n.meta}</span>}
        </div>
        {expanded && (
          <ul role="group">
            {loading.has(n.id) && <li className="flex h-8 items-center gap-2 px-4" style={{ paddingLeft: 10 + (depth + 1) * 18 + 28 }}><Loader2 className="size-3.5 animate-spin text-muted-foreground" /><span className="text-xs text-muted-foreground">loading…</span></li>}
            <AnimatePresence initial={false}>
              {children?.map((c) => (
                <motion.ul key={c.id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden list-none">
                  <Row n={c} depth={depth + 1} />
                </motion.ul>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </li>
    )
  }
  return <ul role="tree" className={cn("divide-y divide-border/70 border border-border/70", className)}>{nodes.map((n) => <Row key={n.id} n={n} depth={0} />)}</ul>
}
