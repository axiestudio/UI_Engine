import * as React from "react"
import { motion } from "motion/react"
import { Camera, Headset, MessageSquare, ReceiptText, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Accent, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"

export type PricingAddon = { id: string; label: string; price: number }

export type PricingAddonsProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: string
  caption?: string
  tone?: "paper" | "ink"
  plan?: string
  basePrice?: number
  addons?: PricingAddon[]
  cta?: string
  className?: string
}

const DEFAULT_ADDONS: PricingAddon[] = [
  { id: "chair-cam", label: "Chair cam", price: 120 },
  { id: "sms-reminders", label: "SMS reminders", price: 80 },
  { id: "payroll-export", label: "Payroll export", price: 140 },
  { id: "client-app", label: "Client app", price: 200 },
  { id: "priority-support", label: "Priority support", price: 160 },
]

const ADDON_ICONS: Record<string, React.ElementType> = {
  "chair-cam": Camera,
  "sms-reminders": MessageSquare,
  "payroll-export": ReceiptText,
  "client-app": Smartphone,
  "priority-support": Headset,
}

function Switch({ checked, onToggle, label, reduce }: { checked: boolean; onToggle: () => void; label: string; reduce: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        checked ? "border-transparent bg-primary" : "border-border bg-muted",
      )}
    >
      <motion.span
        className={cn("ml-[3px] block size-[18px] rounded-full shadow-sm transition-colors duration-200", checked ? "bg-background" : "bg-foreground")}
        animate={{ x: checked ? 16 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 36 }}
      />
    </button>
  )
}

export function PricingAddons({
  eyebrow = "Quiet Times Studio · Plans",
  title = (
    <>
      Bolt on what the chairs <Accent>actually need.</Accent>
    </>
  ),
  subtitle = "Five extras for the floor — flip what your salon uses and watch the monthly total move. Ex. VAT, switch off any time.",
  caption = "Ex. VAT · billed monthly · Jönköping",
  tone = "paper",
  plan = "Studio",
  basePrice = 649,
  addons = DEFAULT_ADDONS,
  cta = "Continue",
  className,
}: PricingAddonsProps) {
  const [on, setOn] = React.useState<Record<string, boolean>>({})
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const chosen = addons.filter((a) => on[a.id])
  const total = basePrice + chosen.reduce((sum, a) => sum + a.price, 0)
  const toggle = (id: string) => setOn((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <SectionShell tone={tone} width={920} rule="bottom" className={cn(className)}>
      <InView>
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </InView>

      <InView once className="mt-10">
        <div className="mx-auto w-full max-w-[500px] overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex items-end justify-between bg-foreground px-5 py-4 text-background">
            <div>
              <p className="font-display text-lg font-bold leading-tight tracking-tight">{plan}</p>
              <p className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-background/60">Quiet Times Studio</p>
            </div>
            <p className="text-right">
              <span className="font-mono text-lg font-bold tabular-nums">{basePrice} kr</span>
              <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-background/60">/ month</span>
            </p>
          </div>

          <ul className="divide-y divide-border">
            {addons.map((a) => {
              const Icon = ADDON_ICONS[a.id]
              const checked = !!on[a.id]
              return (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                  <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                    {Icon ? <Icon className="size-4" /> : <span className="size-1.5 rotate-45 bg-current" />}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{a.label}</p>
                  <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">+{a.price} kr</span>
                  <Switch checked={checked} onToggle={() => toggle(a.id)} label={`Include ${a.label}`} reduce={reduce} />
                </li>
              )
            })}
          </ul>

          <div className="border-t border-border bg-muted/40 px-5 py-4">
            <div className="flex items-center justify-between font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
              <span>Summary</span>
              <span>
                {chosen.length} / {addons.length} on
              </span>
            </div>
            <dl className="mt-3 space-y-1.5 font-mono text-[11px] font-semibold">
              <div className="flex items-baseline justify-between text-muted-foreground">
                <dt>{plan} base</dt>
                <dd className="tabular-nums">{basePrice} kr</dd>
              </div>
              {chosen.map((a) => (
                <div key={a.id} className="flex items-baseline justify-between text-foreground">
                  <dt>{a.label}</dt>
                  <dd className="tabular-nums">+{a.price} kr</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between border-t border-dashed border-border pt-2.5">
                <dt className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Total / month</dt>
                <dd aria-live="polite" className="font-display text-2xl font-black tabular-nums tracking-tight text-foreground">
                  {total} kr
                </dd>
              </div>
            </dl>
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-foreground py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {cta}
            </button>
          </div>
        </div>
      </InView>

      <p className="mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        <span>{caption}</span>
        <span aria-hidden>●</span>
      </p>
    </SectionShell>
  )
}
