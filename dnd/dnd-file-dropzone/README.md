# dnd-file-dropzone

**JOB** — File dropzone — drag OS files onto a drop target, thumbnails
**EMOTION** — Direct manipulation that feels physical without fighting you.
**SIGNATURE** — dnd-kit powered drag & drop. Pointer + Keyboard sensors by default,
reduced-motion friendly, token-driven so it re-themes with the engine.

## Sources

Vendored: shadcn/ui `button` (new-york-v4), motion-primitives (`in-view`), the in-repo
`handcraft` kit. dnd-kit (`@dnd-kit/core|sortable|utilities|modifiers`) is a **peer
dependency** (real maintainer -> npm dep, not vendored) — see UI/VENDORING-STRATEGY.md.
