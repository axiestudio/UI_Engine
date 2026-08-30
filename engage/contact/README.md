# contact — UI preset

Production contact FORM: schema-driven fields, inline validation (blur + submit, focus-first-error), honeypot anti-spam, async `onSubmit` with idle/submitting/success/error states, live character counters, optional info rail. Mobile-first 2-col grid.

## Provenance
| Source | Item |
| --- | --- |
| Watermelon UI registry | `contact-3` (rich inquiry pattern → `ProjectInquirySection`), `button`, `input`, `label`, `select`, `textarea`, `card` |
| Motion-Primitives | `InView`, `Magnetic`, `TextEffect` |

## Use
```tsx
<Contact
  fields={[{ name: "email", label: "Email", type: "email", required: true }]}
  onSubmit={async (values) => { await api.post("/contact", values) }}
  info={{ title: "Studio", items: [{ label: "Phone", value: "…", href: "tel:…" }] }}
/>
```
`onSubmit` is required — no silent fake success. Errors use `aria-describedby`/`role=alert`; honeypot is `aria-hidden` + tabIndex −1.

## Customizing
Business sites pass their own fields/copy/endpoint. `ProjectInquirySection` is the verbatim vendor if you want the registry layout as-is.

Build: `npm run build --workspace=contact`.
