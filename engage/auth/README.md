# auth — UI preset

Login / signup section: `card` (centered card) or `split` (full-height two-column with ink promo aside + spotlight). Social provider buttons, remember-me, terms checkbox, animated headline. All submit/labels prop-driven; no network calls.

**Provenance:** shadcn/ui `new-york-v4` (`button`, `card`, `input`, `label`, `checkbox`, `separator`); Motion-Primitives `text-effect`, `spotlight`.

```tsx
<Auth
  mode="login"
  layout="split"
  providers={[{ id: "google", label: "Continue with Google" }]}
  onSubmit={async (v) => console.info(v)}
  footer={{ text: "New here?", linkLabel: "Create an account", href: "/signup" }}
  aside={{ title: "Members", description: "Booking should feel as easy as walking in." }}
/>
```
