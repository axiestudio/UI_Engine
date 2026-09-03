import * as React from "react"
import { motion } from "motion/react"
import { ChevronRight } from "lucide-react"
import {
  FloatingPortal,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead,
  type FloatingRootContext,
  type ReferenceElement,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — right-click done properly, anchored by Floating UI.
// JOB      operate on the thing under the cursor without hunting menus
// SIGNATURE items typeahead-jump (Floating UI useTypeahead), FLYOUT submenus
//           (useHover with open/close delays), flip + shift keep every level
//           on stage near the viewport edges; separators read as rail ticks.
// POSITIONING every level is a useFloating surface: root on a virtual element
//           built from the trigger rect, submenus on their parent item;
//           autoUpdate + [offset → flip → shift(8) → hide]. No hand-rolled
//           getBoundingClientRect math anywhere.
// API      provide `items` [{label|sep, run?, submenu?, shortcut?, danger?}] —
//          the host element is wrapped; contextmenu event is fully handled.
// A11Y     keyboard: Shift+F10 / Menu key opens at the element; arrows
//          navigate (useListNavigation), Esc pops one level at a time;
//          role=menu per level + aria-haspopup/expanded on every trigger.

export type MenuItem = { label?: string; sep?: boolean; run?: () => void; submenu?: MenuItem[]; shortcut?: string; danger?: boolean; disabled?: boolean }
export type ContextMenuStackProps = { items: MenuItem[]; children: React.ReactNode; label?: string; className?: string }

type PT = { x: number; y: number }
type SubState = { idx: number; viaKey: boolean } | null

function virtualAt(p: PT): ReferenceElement {
  return { getBoundingClientRect: () => ({ x: p.x, y: p.y, width: 0, height: 0, top: p.y, bottom: p.y, left: p.x, right: p.x }) }
}
function firstEnabled(ms: MenuItem[]) { return ms.findIndex((m) => !m.sep && !m.disabled) }

/** One rendered menu panel. Positioning belongs to the caller's useFloating
 *  context; this component owns role/listnav/typeahead/dismiss + keydown. */
function MenuChrome({
  context, setFloating, floatingStyles, hoverFloatingProps, items, label, level, focusOnOpen,
  onClose, closeAll, reduce,
}: {
  context: FloatingRootContext
  setFloating: (el: HTMLElement | null) => void
  floatingStyles: React.CSSProperties
  hoverFloatingProps?: Record<string, unknown>
  items: MenuItem[]
  label: string
  level: number
  focusOnOpen: boolean
  onClose: () => void
  closeAll: () => void
  reduce: boolean
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<Array<HTMLElement | null>>([])
  // useTypeahead matches by string; indices align with the element list
  const labelsRef = React.useRef<Array<string | null>>([])
  labelsRef.current = items.map((m) => (m.sep ? null : m.label ?? null))
  const [activeIndex, setActiveIndex] = React.useState(() => firstEnabled(items))
  const [sub, setSub] = React.useState<SubState>(null)

  const role = useRole(context, { role: "menu" })
  const listNav = useListNavigation(context, { listRef, activeIndex, onNavigate: (i) => setActiveIndex(i ?? firstEnabled(items)), loop: true })
  const typeahead = useTypeahead(context, { listRef: labelsRef, activeIndex, onMatch: setActiveIndex })
  // Every level dismisses: a press outside ALL stacked panels closes it, while
  // Escape is handled in-panel below (pops exactly one level + restores focus).
  const dismiss = useDismiss(context, {
    escapeKey: false,
    outsidePress: (e) => !(e.target instanceof Element && e.target.closest("[data-menu-panel]")),
  })
  const { getFloatingProps } = useInteractions([role, listNav, typeahead, dismiss])

  React.useEffect(() => {
    if (focusOnOpen) panelRef.current?.focus()
    else if (level === 0) panelRef.current?.focus({ preventScroll: true })
  }, [focusOnOpen, level])

  // keep highlight aligned when useTypeahead jumps without a focused element
  React.useEffect(() => { listRef.current[activeIndex]?.focus() }, [activeIndex])

  return (
    <motion.div
      ref={(el) => { panelRef.current = el; setFloating(el) }}
      data-menu-panel=""
      role="menu"
      aria-label={label}
      tabIndex={-1}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reduce ? 0 : 0.14, ease: [0.16, 1, 0.3, 1] }}
      style={floatingStyles}
      className="fixed z-[96] w-60 origin-top-left rounded-lg border border-border/70 bg-popover p-1 text-popover-foreground shadow-xl outline-none"
      {...getFloatingProps({ ...(hoverFloatingProps as React.HTMLProps<HTMLElement>), onKeyDown: (e: React.KeyboardEvent) => {
        const it = items[activeIndex]
        if (e.key === "Escape" || (e.key === "ArrowLeft" && level > 0)) {
          e.preventDefault(); e.stopPropagation()
          if (sub) setSub(null)
          else onClose()
        } else if (e.key === "ArrowRight" && it?.submenu && !it.disabled) {
          e.preventDefault()
          setSub({ idx: activeIndex, viaKey: true })
        }
      } })}
    >
      {items.map((m, i) =>
        m.sep ? <div key={i} aria-hidden className="my-1 h-px bg-border" /> : (
          m.submenu ? (
            <FlyoutItem
              key={i}
              item={m}
              level={level}
              register={(el) => { listRef.current[i] = el }}
              onActivate={() => setActiveIndex(i)}
              open={sub?.idx === i}
              focusChildOnOpen={!!sub?.viaKey && sub.idx === i}
              onOpenChange={(v) => setSub(v ? { idx: i, viaKey: false } : null)}
              closeAll={closeAll}
              label={label}
              reduce={reduce}
            />
          ) : (
            <Button
              key={i}
              type="button"
              ref={(el) => { listRef.current[i] = el }}
              variant="ghost"
              role="menuitem"
              aria-disabled={m.disabled}
              disabled={m.disabled}
              onClick={() => { m.run?.(); closeAll() }}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm outline-none focus-visible:bg-accent focus-visible:text-accent-foreground",
                i === activeIndex && "bg-accent text-accent-foreground",
                m.danger && "text-[hsl(var(--err))]",
              )}
            >
              <span className="flex-1 truncate">{m.label}</span>
              {m.shortcut && <kbd className="font-mono text-[10px] text-muted-foreground">{m.shortcut}</kbd>}
            </Button>
          )
        )
      )}
    </motion.div>
  )
}

/** Menu item owning a floating flyout: its own useFloating surface, opened by
 *  hover (delayed) or by the parent level's ArrowRight. */
function FlyoutItem({
  item, level, register, onActivate, open, onOpenChange, focusChildOnOpen, closeAll, label, reduce,
}: {
  item: MenuItem
  level: number
  register: (el: HTMLElement | null) => void
  onActivate: () => void
  open: boolean
  onOpenChange: (v: boolean) => void
  focusChildOnOpen: boolean
  closeAll: () => void
  label: string
  reduce: boolean
}) {
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    placement: "right-start",
    middleware: [
      offset({ mainAxis: 0, crossAxis: 6 }),
      // stacks must flip sides near the viewport edge
      flip({ fallbackPlacements: ["left-start"], padding: 8 }),
      shift({ padding: 8 }),
      hide(),
    ],
    whileElementsMounted: autoUpdate,
  })
  const hover = useHover(context, { delay: { open: 150, close: 300 }, mouseOnly: true })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover])

  return (
    <>
      <Button
        type="button"
        ref={useMergeRefs([btnRef, register, (el: HTMLElement | null) => { if (!refs.reference) refs.setReference(el) }])}
        variant="ghost"
        {...getReferenceProps({
          role: "menuitem",
          "aria-haspopup": "menu",
          "aria-expanded": open,
          "aria-disabled": item.disabled,
          disabled: item.disabled,
          onMouseEnter: onActivate,
          onClick: () => onOpenChange(!open),
        })}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm outline-none focus-visible:bg-accent focus-visible:text-accent-foreground",
          item.danger && "text-[hsl(var(--err))]",
        )}
      >
        <span className="flex-1 truncate">{item.label}</span>
        <ChevronRight className="size-3.5 opacity-60" aria-hidden />
      </Button>
      <FloatingPortal>
        {open && (
          <MenuChrome
            context={context}
            setFloating={refs.setFloating}
            floatingStyles={floatingStyles}
            hoverFloatingProps={getFloatingProps()}
            items={item.submenu ?? []}
            label={item.label ?? label}
            level={level + 1}
            focusOnOpen={focusChildOnOpen}
            onClose={() => { onOpenChange(false); btnRef.current?.focus() }}
            closeAll={closeAll}
            reduce={reduce}
          />
        )}
      </FloatingPortal>
    </>
  )
}

export function ContextMenuStack({ items, children, label = "Context menu", className }: ContextMenuStackProps) {
  const [pos, setPos] = React.useState<PT | null>(null)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const openedByKeyboard = React.useRef(false)
  const closeAll = () => { setPos(null); wrapperRef.current?.focus() }
  const virtualRef = React.useMemo(() => (pos ? virtualAt(pos) : null), [pos])

  const { refs, floatingStyles, context } = useFloating({
    open: pos !== null,
    onOpenChange: (v) => { if (!v) closeAll() },
    elements: { reference: virtualRef as Element | null },
    placement: "bottom-start",
    middleware: [offset(4), flip(), shift({ padding: 8 }), hide()],
    whileElementsMounted: autoUpdate,
  })

  const open = (p: PT, viaKey: boolean) => { openedByKeyboard.current = viaKey; setPos(p) }

  return (
    <div
      ref={wrapperRef}
      className={cn("relative isolate overflow-hidden", className)}
      onContextMenu={(e) => { e.preventDefault(); open({ x: e.clientX, y: e.clientY }, false) }}
      onKeyDown={(e) => {
        if (pos) return
        if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
          open({ x: r.left + 12, y: r.top + 12 }, true)
        }
      }}
      tabIndex={0}
      aria-haspopup="menu"
      aria-expanded={pos !== null}
    >
      {children}
      <FloatingPortal>
        {pos && (
          <MenuChrome
            context={context}
            setFloating={refs.setFloating}
            floatingStyles={floatingStyles}
            items={items}
            label={label}
            level={0}
            focusOnOpen={openedByKeyboard.current}
            onClose={closeAll}
            closeAll={closeAll}
            reduce={reduce}
          />
        )}
      </FloatingPortal>
    </div>
  )
}
