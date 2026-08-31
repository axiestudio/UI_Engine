import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — right-click done properly.
// JOB      operate on the thing under the cursor without hunting menus
// SIGNATURE items typeahead-jump (press "d" → Duplicate), flyout submenus that
//           flip sides at the viewport edge, separators read as rail ticks.
// API      provide `items` [{label|sep, run?, submenu?, shortcut?, danger?}] —
//          the host element is wrapped; contextmenu event is fully handled.
// A11Y     keyboard: Shift+F10 / Menu key opens at the element; arrows navigate;
//          role=menu + aria labels throughout.

export type MenuItem = { label?: string; sep?: boolean; run?: () => void; submenu?: MenuItem[]; shortcut?: string; danger?: boolean; disabled?: boolean }
export type ContextMenuStackProps = { items: MenuItem[]; children: React.ReactNode; label?: string; className?: string }

type PT = { x: number; y: number }

export function ContextMenuStack({ items, children, label = "Context menu", className }: ContextMenuStackProps) {
  const [pos, setPos] = React.useState<PT | null>(null)
  const [path, setPath] = React.useState<MenuItem[][]>([items])
  const [focusIdx, setFocusIdx] = React.useState(-1)
  const menuRef = React.useRef<HTMLDivElement>(null)
  const flat = path[path.length - 1] ?? []

  const open = (p: PT) => { setPos(p); setPath([items]); setFocusIdx(firstEnabled(items)) }
  const flip = (p: PT) => ({ left: Math.min(p.x, (typeof window !== "undefined" ? window.innerWidth : 1200) - 264), top: Math.min(p.y, (typeof window !== "undefined" ? window.innerHeight : 800) - (flat.length * 32 + 14)) })

  const move = (d: 1 | -1) => {
    if (!pos) return
    let i = focusIdx
    for (let k = 0; k < flat.length * 2; k++) { i = (i + d + flat.length) % flat.length; if (flat[i] && !flat[i].sep && !flat[i].disabled) break }
    setFocusIdx(i)
  }
  const activate = () => { const it = flat[focusIdx]; if (!it || it.disabled) return; if (it.submenu) { setPath((p) => [...p, it.submenu!]); setFocusIdx(firstEnabled(it.submenu!)); return } it.run?.(); setPos(null) }
  const typeahead = (ch: string) => { const i = flat.findIndex((m) => m.label?.toLowerCase().startsWith(ch.toLowerCase())); if (i >= 0) setFocusIdx(i) }

  const onKeyRoot = (e: React.KeyboardEvent) => {
    if (pos) {
      if (e.key === "Escape") { path.length > 1 ? setPath((p) => p.slice(0, -1)) : setPos(null); e.stopPropagation() }
      else if (e.key === "ArrowDown") { e.preventDefault(); move(1) }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1) }
      else if (e.key === "ArrowRight" && flat[focusIdx]?.submenu) { e.preventDefault(); setPath((p) => [...p, flat[focusIdx].submenu!]); setFocusIdx(0) }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setPath((p) => (p.length > 1 ? p.slice(0, -1) : p)) }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate() }
      else if (e.key.length === 1) typeahead(e.key)
      return
    }
    if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); open({ x: r.left + 12, y: r.top + 12 }) }
  }

  return (
    <div className={className} onContextMenu={(e) => { e.preventDefault(); open({ x: e.clientX, y: e.clientY }) }} onKeyDown={onKeyRoot} tabIndex={0} aria-haspopup="menu">
      {children}
      <AnimatePresence>
        {pos && (
          <>
            <div className="fixed inset-0 z-[95]" onClick={() => setPos(null)} onContextMenu={(e) => { e.preventDefault(); open({ x: e.clientX, y: e.clientY }) }} aria-hidden />
            <motion.div
              ref={menuRef}
              role="menu"
              aria-label={label}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.09 } }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-[96] w-60 origin-top-left rounded-lg border border-border/70 bg-popover p-1 text-popover-foreground shadow-xl"
              style={flip(pos)}
            >
              {flat.map((m, i) =>
                m.sep ? <div key={i} aria-hidden className="my-1 h-px bg-border" /> : (
                  <button
                    key={i}
                    role="menuitem"
                    aria-disabled={m.disabled}
                    onMouseEnter={() => setFocusIdx(i)}
                    onMouseLeave={() => {}}
                    onClick={activate}
                    className={cn("flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm outline-none", i === focusIdx && "bg-accent text-accent-foreground", m.disabled && "pointer-events-none opacity-40", m.danger && "text-[hsl(var(--err))]")}
                  >
                    <span className="flex-1 truncate">{m.label}</span>
                    {m.submenu ? <ChevronRight className="size-3.5 opacity-60" /> : m.shortcut && <kbd className="font-mono text-[10px] text-muted-foreground">{m.shortcut}</kbd>}
                  </button>
                )
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
function firstEnabled(ms: MenuItem[]) { return ms.findIndex((m) => !m.sep && !m.disabled) }
