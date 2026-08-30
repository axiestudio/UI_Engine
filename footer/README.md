# footer — UI preset

Production-grade site footer preset for the component workspace. Built from **real upstream registry sources** — no shadcn demo slop.

## Provenance

| Source | Item | Where |
| --- | --- | --- |
| Watermelon UI | `footer-1` (link-group + newsletter pattern) | `registry.watermelon.sh/r/footer-1.json` → `src/components/watermelon/footer-1.tsx` |
| Watermelon UI | `newsletter-2` (compact newsletter band) | `src/components/watermelon/newsletter-2.tsx` |
| Watermelon UI | `button`, `input` (their styled registry versions) | `src/components/ui/{button,input}.tsx` |
| Motion-Primitives | `InView`, `TextShimmer`, `Magnetic` | `github.com/ibelick/motion-primitives` `components/core/*` → `src/components/primitives/*` |

Vendored files keep a provenance header. Only local patch: type-only imports in `in-view.tsx` (required by our `verbatimModuleSyntax` tsconfig).

## Install / use

Workspace package: `import { Footer } from "footer"` + `import "footer/styles.css"` (or theme tokens in your globals).

```tsx
<Footer
  brandName="Acme Labs"
  tagline="Bold presets, shipped fast."
  columns={[
    { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Changelog", href: "#", badge: "New" }] },
    { title: "Company", links: [{ label: "About", href: "#" }] },
  ]}
  info={{ title: "Visit", lines: ["Main Street 1", "Mon–Fri 09–18"] }}
  socials={[{ label: "GitHub", href: "https://github.com", icon: Github }]}
  newsletter={{
    title: "Stay in the loop",
    description: "One email per month. No spam.",
    onSubmit: async (email) => fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email }) }),
  }}
  legal={{ links: [{ label: "Privacy", href: "#" }] }}
  showScrollTop
/>
```

## Behavior notes

- **No fake success**: omit `newsletter.onSubmit` and the form renders locked with a hint. `onSubmit` rejects → inline error.
- Mobile-first: brand stacks, columns 2-up, bottom bar reverses.
- Motion: `InView` reveal (once), `TextShimmer` heading, `Magnetic` socials + scroll-top. All respect `prefers-reduced-motion`.
- Theming: pure shadcn-style tokens (`--background`, `--font-display` …) — dark mode via `.dark`.
- `showScrollTop` renders a page-level `position: fixed` button — one footer per page.

## Build

```bash
npm run build --workspace=UI/footer   # tsc -b && vite build → dist/footer.{es,cjs}.js + footer.css
```

## Customizing for a business site

This is the **base preset**. Business sites pass their own brand/copy/columns/links and theme the tokens — exactly how massageverkstan/habesha customize `header`/`hero-scroll`. For a different raw layout, use the vendored `Footer1` / `Newsletter2` exports directly.
