import * as React from "react"
import { ChevronRight, House } from "lucide-react"
import {
  FloatingPortal,
  autoUpdate,
  flip,
  hide,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
  useTypeahead,
} from "@floating-ui/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — deep nesting is a fact of webapps; the bar adapts.
// JOB      show location in hierarchy without stealing header width
// SIGNATURE when tight, it collapses the MIDDLE (keeps home + tail), overflow
//           folds into a `…` menu that opens UPWARD (flip) with the hidden
//           path — anchored by Floating UI, shift keeps it on stage.
// MEASURE  real ResizeObserver math — this is navigation, not a mock. That
//          measuring stays; the popup anchoring is pure useFloating
//          [offset → flip → shift(8) → hide] + autoUpdate, no fixed coords.
// API      items [{label, href?}] , `onNavigate` for your router (optional).
// A11Y     nav[aria-label] + ol semantics preserved when collapsed; the menu
//          is role=menu with roving focus + typeahead; trigger has
//          aria-haspopup/aria-expanded.

export type Crumb = { label: string; href?: string }
export type BreadcrumbCollapseProps = { items: Crumb[]; onNavigate?: (c: Crumb) => void; className?: string }

export function BreadcrumbCollapse({ items, onNavigate, className }: BreadcrumbCollapseProps) {
  const host = React.useRef<HTMLDivElement>(null)
  const [fit, setFit] = React.useState(items.length)
  React.useEffect(() => {
    const el = host.current
    if (!el) return
    const measure = () => {
      const w = el.clientWidth
      const per = items.map((i) => Math.max(64, i.label.length * 8 + 34))
      let total = 46 + per[per.length - 1]
      let visible = 1
      for (let i = 0; i < per.length - 1; i++) { if (total + per[0] + 10 + per[i] > w && i > 0) break; total += per[i] + 10; visible++ }
      setFit(Math.max(1, visible))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [items])
  const head = items[0]
  const tail = items.slice(-1)[0]
  const middle = items.slice(1, -1)
  const shown = fit >= items.length ? items : [head, ...middle.slice(-Math.max(0, fit - 2)), tail]
  const hidden = items.filter((i) => !shown.includes(i))

  const CrumbEl = ({ c, last }: { c: Crumb; last?: boolean }) =>
    c.href && !last ? (
      onNavigate ? <Button type="button" variant="link" onClick={() => onNavigate(c)} className="max-w-[16ch] truncate rounded px-1 text-sm font-normal text-muted-foreground underline-offset-0 hover:text-foreground hover:no-underline">{c.label}</Button>
      : <a href={c.href} className="max-w-[16ch] truncate rounded px-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{c.label}</a>
    ) : <span aria-current={last ? "page" : undefined} className={cn("max-w-[22ch] truncate", last && "font-medium text-foreground")}>{c.label}</span>

  return (
    <div ref={host} className={cn("relative flex w-full min-w-0 items-center gap-1 font-sans text-sm", className)} aria-label="Breadcrumb">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
        <ol className="flex min-w-0 items-center gap-1 list-none m-0 p-0">
          {shown.map((c, i) => {
            const afterGap = hidden.length > 0 && i === 0 && c === head
            return (
              <React.Fragment key={c.label + i}>
                {i === 1 && hidden.length > 0 && (
                  <li className="flex items-center">
                    <OverflowMenu items={hidden} onNavigate={onNavigate} />
                  </li>
                )}
                <li className={cn("flex min-w-0 items-center gap-1", afterGap && "")}>
                  {i > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0 text-muted-foreground/60" />}
                  {c === head ? <span className="flex shrink-0 items-center gap-1 text-muted-foreground"><House className="size-3.5" /><span className="sr-only">{c.label}</span></span> : <CrumbEl c={c} last={i === shown.length - 1} />}
                </li>
              </React.Fragment>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}

/** `…` chip → Floating UI menu of the collapsed middle segments. */
function OverflowMenu({ items, onNavigate }: { items: Crumb[]; onNavigate?: (c: Crumb) => void }) {
  const [menu, setMenu] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null)
  const listRef = React.useRef<Array<HTMLElement | null>>([])
  // useTypeahead matches by string; indices align with the element list
  const labelsRef = React.useRef<Array<string | null>>([])
  labelsRef.current = items.map((c) => c.label)

  const { refs, floatingStyles, context } = useFloating({
    open: menu,
    onOpenChange: setMenu,
    placement: "bottom-start",
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 }), hide()],
    whileElementsMounted: autoUpdate,
  })
  const click = useClick(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "menu" })
  const listNav = useListNavigation(context, { listRef, activeIndex, onNavigate: setActiveIndex })
  const typeahead = useTypeahead(context, { listRef: labelsRef, activeIndex, onMatch: setActiveIndex })
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([click, dismiss, role, listNav, typeahead])

  return (
    <>
      <Button type="button" ref={refs.setReference} variant="ghost" aria-label={`${items.length} hidden path segments`} {...getReferenceProps({ "aria-haspopup": "menu", "aria-expanded": menu })} className="rounded px-1.5 py-1 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">…</Button>
      <FloatingPortal>
        {menu && (
          <ul
            ref={refs.setFloating}
            style={floatingStyles}
            aria-label="Collapsed breadcrumb path"
            className="z-30 flex w-64 flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl outline-none"
            {...getFloatingProps()}
          >
            {items.map((h, i) => (
              <li key={h.label} role="none">
                <Button
                  type="button"
                  variant="ghost"
                  ref={(el) => { listRef.current[i] = el }}
                  {...getItemProps({
                    role: "menuitem",
                    onClick: () => { setMenu(false); if (onNavigate) onNavigate(h); else if (h.href) window.location.assign(h.href) },
                  })}
                  className="block w-full truncate rounded-md px-2.5 py-1.5 text-left text-sm font-normal hover:bg-accent"
                >
                  {h.label}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </FloatingPortal>
    </>
  )
}
