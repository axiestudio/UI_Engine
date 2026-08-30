# blog — UI preset

Journal/news listing: optional wide **lead card** (image left, text right from `sm:`), then a 2–3 column card grid. ISO `date` strings are localized; `tag` chip, `readMinutes`, `author`, image-fallback cards without images, `moreLink`, optional `TextShimmer` titles.

**Provenance:** Watermelon `blog-1`, `blog-2` (verbatim), `button`; Motion-Primitives `in-view`, `text-shimmer`.

```tsx
<BlogGrid lead moreLink={{ label: "All posts", href: "/blog" }} posts={[
  { title: "What deep tissue means", date: "2026-08-12", readMinutes: 4, image: "/p.jpg", href: "/p/1", tag: "Techniques", author: "Astrid L." },
]} />
```
