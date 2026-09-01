# Sonner — engine notes

**Tier:** Interaction · **Kind:** engine (npm peer, never copied) · **Peer:** `sonner ^2.0.8`

> Principle: interaction infrastructure is not design work. Toast stacking,
> swipe-to-dismiss, pause-on-hover, promise lifecycles — solved.

## Import contract

```tsx
import { Toaster, toast } from "sonner"
// mount ONCE per page: <Toaster position="bottom-right" richColors />
toast.success("Booking confirmed")
toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Failed" })
```

- One `<Toaster />` at the shell root (page-level, like Lenis — never per preset).
- Styling: `toast.custom()` renders our own token-styled markup when the design
  demands brand-consistent toasts — the default skin is a fallback, not the goal.

## Tool-choice within the interaction tier

| Feedback | Tool |
|---|---|
| Transient notifications | **Sonner** |
| Persistent status/health strips | app-system presets (status-health-strip) |
| Inline form validation | shadcn form primitives |

## Pitfalls

- Emits from anywhere, renders at the root — presets that call `toast()` must not
  also render `<Toaster />`.
- Respect reduced motion: stack animations are decorative; content must be immediate.
