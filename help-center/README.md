# help-center — UI preset

Help center: centered search field (consumer-wired via `onSearch`) over an icon-led category card grid with article counts and hover arrows; optional footer link badge. `paper` (default) or `ink`.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `input`, `card`, `badge`); Motion-Primitives `in-view`.

```tsx
<HelpCenter
  categories={[
    { title: "Getting started", description: "Set up your first space in minutes.", icon: Rocket, href: "/help/start", count: 12 },
    { title: "Billing", description: "Invoices, plans and refunds.", icon: CreditCard, href: "/help/billing", count: 8 },
  ]}
  onSearch={(q) => router.push(`/help/search?q=${q}`)}
/>
```
