# commerce-product-gallery

**JOB** — inspect-before-you-buy gallery for a product page.
**SIGNATURE** — Embla-powered draggable rail (pointer physics, snapping, loop)
with our thumbnails, counter and product story; prev/next controls built on the
`embla` instance API.

## Sources

Vendored: shadcn/ui `button` (new-york-v4), motion-primitives (`in-view`),
the in-repo `handcraft` kit. Engine peer: `embla-carousel-react`.
Re-themes with the engine tokens.

```tsx
<CommerceProductGallery frames={[{ id: "f1", src: "/frames/frame_0002.webp", alt: "Front" }]} />
```
