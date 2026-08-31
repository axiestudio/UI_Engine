import * as React from "react"
import { Send } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Contact split — a form beside studio details.
// ═══ EMOTION     Approachable, direct.
// ═══ SIGNATURE   A two-column contact: form + details rail.

export type ContactSplitProps = {
  eyebrow?: string
  title?: React.ReactNode
  details?: { label: string; value: string }[]
  submitLabel?: string
  onSubmit?: (data: Record<string, string>) => void
  tone?: "paper" | "ink"
  className?: string
}

export function ContactSplit({
  eyebrow = "CONTACT",
  title = "Say hello.",
  details = [
    { label: "Email", value: "hello@studio.com" },
    { label: "Phone", value: "+46 8 12 34 56" },
    { label: "Studio", value: "Södermalm, Stockholm" },
  ],
  submitLabel = "Send message",
  onSubmit,
  tone = "paper",
  className,
}: ContactSplitProps) {
  const ink = tone === "ink"
  const [form, setForm] = React.useState({ name: "", email: "", message: "" })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={className}>
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <form
            onSubmit={(e) => { e.preventDefault(); onSubmit?.(form) }}
            className={cn("space-y-4 rounded-xl border p-6", ink ? "border-background/15 bg-background/5" : "border-border bg-card")}
          >
            <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{eyebrow}</p>
            <h2 className="font-display text-2xl font-bold">{title}</h2>
            <Field ink={ink} label="Name"><input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Your name" /></Field>
            <Field ink={ink} label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="you@studio.com" /></Field>
            <Field ink={ink} label="Message"><textarea rows={4} value={form.message} onChange={(e) => set("message", e.target.value)} className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Tell us about the project" /></Field>
            <Button type="submit" className="h-11 w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-widest"><Send className="h-4 w-4" /> {submitLabel}</Button>
          </form>
        </InView>

        <InView once variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}>
          <dl className={cn("space-y-6", ink && "text-background")}>
            {details.map((d) => (
              <div key={d.label} className={cn("border-b pb-4", ink ? "border-background/15" : "border-border")}>
                <dt className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{d.label}</dt>
                <dd className="mt-1 font-display text-lg font-bold">{d.value}</dd>
              </div>
            ))}
          </dl>
        </InView>
      </div>
    </SectionShell>
  )
}

function Field({ label, children, ink }: { label: string; children: React.ReactNode; ink: boolean }) {
  return (
    <label className="block">
      <span className={cn("mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/55" : "text-muted-foreground")}>{label}</span>
      {children}
    </label>
  )
}
