# search — UI preset

⌘K command palette: shadcn `command` (cmdk) in a dialog, grouped results with icons/keywords/shortcuts, full keyboard navigation, optional global ⌘K / Ctrl+K hotkey and a search-trigger button.

**Provenance:** shadcn/ui `new-york-v4` (`command` + its `dialog`/`button` registry deps, `cmdk`).

```tsx
<Search
  groups={[
    { heading: "Pages", items: [{ label: "Pricing", icon: CreditCard, href: "/pricing" }] },
    { heading: "Actions", items: [{ label: "Book a session", icon: Calendar, shortcut: "B" }] },
  ]}
  onSelect={(item) => item.href ? router.push(item.href) : console.info(item.label)}
/>
```
