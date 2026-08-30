# faq — UI preset

Question/answer section: Motion-Primitives `Accordion` (smooth height motion, single-open), category chips, client-side search with `<mark>` highlighting, `#id` deep-links (auto-open + scroll), columns 1/2, CTA + `Magnetic` button, empty state.

## Provenance
| Source | Item |
| --- | --- |
| Motion-Primitives | `accordion`, `in-view`, `magnetic` |
| Watermelon UI registry | `faq-2` (category-chip pattern → `FaqCategories2` verbatim), `accordion` base (`ui/accordion`, radix variant for hosts that prefer it) |

## Use
```tsx
<Faq items={[{ id: "prices", question: "What does it cost?", answer: "…", category: "General" }]}
     cta={{ label: "Ask us", href: "/contact" }} />
```
Search requires `answer` to be a string (ReactNode allowed but not searchable). `slugify`d question = id when omitted.

## Compat patches to vendored files (annotated inline)
- `accordion.tsx`: `type` imports; `cloneElement` cast for React 19 types.

Build: `npm run build --workspace=faq`.
