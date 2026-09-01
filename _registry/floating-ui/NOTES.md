# Floating UI — engine notes

**Tier:** Interaction · **Kind:** engine (npm peer, never copied) · **Peer:** `@floating-ui/react ^0.27.20`

> Principle: do not spend design time rebuilding reliable interaction
> infrastructure. Positioning/collision/interaction logic is solved — compose it.

## Import contract

```tsx
import { FloatingPortal, autoUpdate, flip, offset, shift, useFloating, useInteractions, useRole } from "@floating-ui/react"
```

- `@floating-ui/react` is the full binding (positioning + interactions + portal).
  `@floating-ui/dom` is its underlying engine, pulled in transitively — don't import it directly.
- `whileElementsMounted: autoUpdate` = the anchor is *welded on*: follows scroll,
  resize, and layout shifts. Every preset that tracks a resting row/tile uses it.

## Canonical stacks in this repo

**Click popover / menu / dialog**
```tsx
useFloating({ open, onOpenChange, placement: "bottom-start",
  middleware: [offset(6), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate })
useInteractions([useClick(context), useDismiss(context), useRole(context, { role: "dialog" | "menu" })])
```

**Hover toolbar / tooltip** (see recipe `use-hover-panel.tsx`)
```tsx
middleware: [offset(10), shift({ padding: 8 })]      // no flip — follows the anchor
useInteractions([useHover(context, { move: false }), useFocus(context), useRole(context, { role: "toolbar" | "tooltip" })])
```

Middleware order matters: `offset → flip/autoPlacement → shift → size → arrow → hide`.

## Pitfalls

- `useHover({ move: false })` for toolbars — the panel must not close when the
  pointer moves onto the panel itself.
- Wrap floating elements in `FloatingPortal` so fixed-chrome hosts and overflow
  containers can't clip them (our `--fixed-inset-*` presets rely on viewport level).
- `useRole` supplies correct aria wiring; for tooltips also mirror the content
  in `aria-describedby` when it carries essential information.
- Nested/menus-within-menus need `FloatingTree` — avoid nesting until a design
  actually demands it.
- SSR-safe: positions compute after mount; render closed on the server (our
  presets are client-built libs, so this is naturally satisfied).
