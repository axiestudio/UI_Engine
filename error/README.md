# error — UI preset

Error states (404/500): full-viewport or section, oversized outlined display code, blur-in headline, primary/secondary recovery actions, popular-pages links, optional site search field. Tone `ink` (default) or `paper` with hover spotlight.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `input`); Motion-Primitives `spotlight`, `text-effect`.

```tsx
<ErrorState
  code="404"
  title="This page went off-script."
  primaryAction={{ label: "Go home", href: "/" }}
  secondaryAction={{ label: "Contact support", href: "/contact" }}
  links={[{ label: "Pricing", href: "/pricing" }, { label: "Blog", href: "/blog" }]}
  onSearch={(q) => router.push(`/search?q=${q}`)}
/>
```
