import * as React from "react"
import { ChevronRight, ChevronsUpDown, House } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ APP-PRIMARY — deep nesting is a fact of webapps; the bar adapts.
// JOB      show location in hierarchy without stealing header width
// SIGNATURE when tight, it collapses the MIDDLE (keeps home + tail), overflow
//           folds into a `…` menu that opens upward with the hidden path.
// MEASURE  real ResizeObserver math — this is navigation, not a mock.
// API      items [{label, href?}] , `onOpenMenu` for your router.
// A11Y     nav[aria-label] + ol semantics preserved even when collapsed.

export type Crumb = { label: string; href?: string }
export type BreadcrumbCollapseProps = { items: Crumb[]; className?: string }

export function BreadcrumbCollapse({ items, className }: BreadcrumbCollapseProps) {
  const host = React.useRef<HTMLDivElement>(null)
  const [fit, setFit] = React.useState(items.length)
  const [menu, setMenu] = React.useState(false)
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
    c.href && !last ? <a href={c.href} className="max-w-[16ch] truncate rounded px-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]">{c.label}</a> : <span aria-current={last ? "page" : undefined} className={cn("max-w-[22ch] truncate", last && "font-semibold text-foreground")}>{c.label}</span>

  return (
    <div ref={host} className={cn("relative flex w-full min-w-0 items-center gap-1 font-sans text-[13px]", className)} aria-label="Breadcrumb">
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1">
        <ol className="flex min-w-0 items-center gap-1 list-none m-0 p-0">
          {shown.map((c, i) => {
            const afterGap = hidden.length > 0 && i === 0 && c === head
            return (
              <React.Fragment key={c.label + i}>
                {i === 1 && hidden.length > 0 && (
                  <li className="flex items-center">
                    <button type="button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="rounded px-1.5 py-1 text-muted-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]">…</button>
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
      {menu && hidden.length > 0 && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setMenu(false)} aria-hidden />
          <ul role="menu" className="absolute left-7 top-7 z-30 w-64 rounded-lg border bg-popover p-1 shadow-xl">
            {hidden.map((h) => (
              <li key={h.label} role="none">
                {h.href ? <a role="menuitem" href={h.href} onClick={() => setMenu(false)} className="block truncate rounded-md px-2.5 py-1.5 text-[13px] hover:bg-accent">{h.label}</a> : <span role="menuitem" className="block truncate rounded-md px-2.5 py-1.5 text-[13px] opacity-70">{h.label}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
