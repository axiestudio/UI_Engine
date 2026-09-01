# notification — UI preset

Notification panel: eyebrow + title header, dismissible rows with kind badges (info/success/warning/critical), unread dots, per-row actions and an optional inbox list. Rows animate in/out with `motion/react`; the list is a vendored Watermelon UI `notification-list`.

**Provenance:** Watermelon UI `notification-list`; Motion-Primitives `in-view`.

```tsx
<Notifications
  eyebrow="Inbox"
  title="What's new"
  items={[
    { id: "n1", title: "Payout received", message: "€2,400.00 landed.", time: "2h", kind: "success", read: true },
    { id: "n2", title: "Server degraded", message: "EU-West latency up.", time: "Just now", kind: "critical" },
  ]}
  onDismiss={(id) => console.log("dismissed", id)}
/>
```
