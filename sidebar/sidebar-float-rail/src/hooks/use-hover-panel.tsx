/**
 * Vendored from UI/_registry/floating-ui (hover/focus-reveal anchored panel (tooltip/toolbar pattern)).
 * Registry recipe — Floating UI: hover/focus-reveal anchored panel.
 * Distilled from the repo's toolbar/tooltip presets (floating-row-actions,
 * floating-pin-notes): the reference element reveals a panel that is welded
 * on with autoUpdate and kept on-stage by shift.
 *
 * Engine library — NOT vendored code. `@floating-ui/react` stays an npm peer.
 * Usage:
 *   const panel = useHoverPanel({ placement: "left-start", gap: 10 })
 *   <button ref={panel.refs.setReference} {...panel.getReferenceProps()}>…</button>
 *   {panel.open && (
 *     <FloatingPortal>
 *       <div ref={panel.refs.setFloating} style={panel.floatingStyles} {...panel.getFloatingProps()}>…</div>
 *     </FloatingPortal>
 *   )}
 */
import * as React from "react"
import { autoUpdate, offset, shift, useFloating, useHover, useFocus, useInteractions, useRole, type Placement } from "@floating-ui/react"

export function useHoverPanel({
  placement = "top",
  gap = 8,
  role = "tooltip",
} : {
  placement?: Placement
  gap?: number
  // floating-ui's AriaRole is narrower than the HTML aria spec — "toolbar" needs a cast
  // (see app/floating-row-actions); this recipe sticks to the type-clean "tooltip".
  role?: "tooltip"
} = {}) {
  const [open, setOpen] = React.useState(false)
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    // hover panels don't flip (they follow the anchor); shift keeps them on-stage
    middleware: [offset(gap), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const hover = useHover(context, { move: false })
  const focus = useFocus(context)
  const a11y = useRole(context, { role })
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, a11y])

  return { open, setOpen, refs, floatingStyles, context, getReferenceProps, getFloatingProps }
}
