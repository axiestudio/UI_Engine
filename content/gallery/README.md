# gallery — UI preset

Photo grid with a **morphing lightbox**: each card shares its layoutId with a portal panel (MorphingDialog), spring-morphing on open/close, keyboard-dismissable. Optional before/after `comparison` block (draggable ImageComparison). Column clamp 2–4, mobile single.

**Provenance:** Motion-Primitives `morphing-dialog` (+ `useClickOutside` hook), `image-comparison`, `in-view` — snapshots in `UI/_registry/motion-primitives/`.

```tsx
<Gallery photos={[{ id: "room-1", src: "/p/room-1.webp", alt: "Treatment room", title: "Room 1", caption: "Evening light" }]}
         comparison={{ before: "/b.webp", after: "/a.webp", label: "Renovation" }} />
```
