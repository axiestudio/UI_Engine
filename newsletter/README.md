# newsletter — UI preset

Newsletter subscribe band: centered card on ink band with animated border trail, blur-in headline, inline email form → success state with check icon. Controlled only by your `onSubmit` (no network calls). `ink` (default) or `paper`.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `card`, `input`, `label`); Motion-Primitives `text-effect`, `border-trail`, `spotlight`.

```tsx
<Newsletter
  eyebrow="Newsletter"
  onSubmit={async (email) => subscribe(email)}
  finePrint="One email a week. Unsubscribe anytime."
/>
```
