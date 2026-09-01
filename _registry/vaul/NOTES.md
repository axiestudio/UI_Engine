# Vaul — engine notes

**Tier:** Interaction · **Kind:** engine (npm peer, never copied) · **Peer:** `vaul ^1.1.2`

> Principle: do not rebuild interaction infrastructure. Drag-to-dismiss drawer
> semantics (velocity tracking, dismissal thresholds, scroll locking, focus
> trapping) are solved — compose them.

## Import contract

```tsx
import { Drawer } from "vaul"
<Drawer.Root>
  <Drawer.Trigger>Open</Drawer.Trigger>
  <Drawer.Portal>
    <Drawer.Overlay />
    <Drawer.Content>…</Drawer.Content>
  </Drawer.Portal>
</Drawer.Root>
```

- Radix Dialog under the hood — a11y (focus trap, escape, aria) comes free; our
  shadcn tokens apply directly.
- Snap points: `snap={["120px", 0.5, 1]}` + `snapToSnapPoint` via `onSnap`; nested drawers supported.
- Direction: `direction="bottom" | "left" | "right" | "top"`.
- Mobile keyboards: `repositionInputs={false}` when forms inside misbehave.

## Tool-choice within the interaction tier

| Panel | Tool |
|---|---|
| Draggable bottom sheet / mobile nav | **Vaul** |
| Centered modal | shadcn Dialog |
| Hover/click floating panel | Floating UI |
| Toasts | Sonner |

## Pitfalls

- Scrollable content inside needs `overflow-y-auto` on an inner wrapper, not the Content itself.
- Dismissible-by-default; controlled usage via `open` + `onOpenChange` (match our
  Floating UI preset patterns).
