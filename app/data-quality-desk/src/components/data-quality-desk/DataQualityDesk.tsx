import { Fragment, useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { ListTree, ScanSearch, ShieldAlert, SquareCheckBig } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FilterTokenBuilder, type FilterToken } from "filter-token-builder"
import { InlineEditCell } from "inline-edit-cell"
import { BulkSelectBar, type BulkAction } from "bulk-select-bar"
import { SmartSkeleton } from "smart-skeleton"
import { ToastStack, type Toast } from "toast-stack"
import { Checkbox } from "@/components/watermelon/checkbox"

// COMPOSITE SCREEN · DATA QUALITY
// composed of: filter-token-builder (scope tokens), inline-edit-cell (record
// fields), bulk-select-bar (merge/quarantine), smart-skeleton (column rescan)
// + purpose-built record tree with per-row state chips.

export type QualityRecord = {
  id: string
  name: string
  email: string
  phone: string
  state: "clean" | "stale" | "conflict"
}

export type QualityGroup = { id: string; label: string; records: QualityRecord[] }

export type DataQualityDeskProps = {
  ledger?: string
  syncedAt?: string
  groups?: QualityGroup[]
  onMerged?: (count: number) => void
  className?: string
}

const DEFAULT_GROUPS: QualityGroup[] = [
  {
    id: "g-customers",
    label: "Customers",
    records: [
      { id: "r1", name: "M. Ahlberg", email: "m.ahlberg@telia.se", phone: "+46 70 122 44 81", state: "clean" },
      { id: "r2", name: "M. Ahlberg (dup)", email: "mahlberg@gmail.com", phone: "0701224481", state: "conflict" },
      { id: "r3", name: "R. Okafor", email: "r.okafor@posteo.net", phone: "+46 73 559 10 02", state: "clean" },
      { id: "r4", name: "T. Lindqvist", email: "bounced@old-domain.se", phone: "—", state: "stale" },
    ],
  },
  {
    id: "g-suppliers",
    label: "Suppliers",
    records: [
      { id: "r5", name: "Nordisk Kaffe AB", email: "orders@nordiskkaffe.se", phone: "+46 8 411 90 22", state: "clean" },
      { id: "r6", name: "Skandinavisk Tvätt", email: "info@sktvatt.se", phone: "08-411 90", state: "stale" },
    ],
  },
  {
    id: "g-staff",
    label: "Staff",
    records: [
      { id: "r7", name: "Elin Sandberg", email: "elin@salong.se", phone: "+46 70 900 31 55", state: "clean" },
      { id: "r8", name: "J. Petrov", email: "j.petrov@salong.se", phone: "+46 76 220 87 14", state: "conflict" },
    ],
  },
]

const DEFAULT_COLUMNS = [
  { name: "email", okPct: 68, note: "2 bounces, 1 unverified" },
  { name: "phone", okPct: 41, note: "mixed country codes" },
  { name: "state", okPct: 96, note: "1 unmapped value" },
  { name: "owner", okPct: 100, note: "" },
]

const STATE_STYLES: Record<QualityRecord["state"], string> = {
  clean: "border-[hsl(var(--ok)/0.4)] text-[hsl(var(--ok))]",
  stale: "border-[hsl(var(--warn)/0.5)] text-[hsl(var(--warn))]",
  conflict: "border-[hsl(var(--err)/0.4)] text-[hsl(var(--err))]",
}

function matches(r: QualityRecord, t: FilterToken): boolean {
  const v = t.field in r ? String(r[t.field as keyof QualityRecord]) : ""
  if (t.op === "=") return v === t.value
  if (t.op === "≠") return v !== t.value
  return v.toLowerCase().includes(t.value.toLowerCase())
}

export function DataQualityDesk({ ledger = "CRM mirror · prod-1", syncedAt = "03:00", groups = DEFAULT_GROUPS, onMerged, className }: DataQualityDeskProps) {
  const [rows, setRows] = useState(groups)
  const [tokens, setTokens] = useState<FilterToken[]>([{ field: "state", op: "≠", value: "clean" }])
  const [and, setAnd] = useState(true)
  const [open, setOpen] = useState<Record<string, boolean>>({ "g-customers": true, "g-suppliers": true, "g-staff": false })
  const [sel, setSel] = useState<string[]>([])
  const [scan, setScan] = useState(false)
  const [cols, setCols] = useState(DEFAULT_COLUMNS)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok", action?: Toast["action"]) =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone, action }])

  const active = (g: QualityGroup) => g.records.filter((r) => tokens.every((t) => matches(r, t)))
  const visible = rows.map((g) => ({ ...g, active: active(g) })).filter((g) => g.active.length > 0)
  const leafIds = visible.flatMap((g) => g.active.map((r) => r.id))
  const conflicts = rows.flatMap((g) => g.records).filter((r) => r.state === "conflict").length

  const toggle = (id: string, on: boolean) => setSel((s) => (on ? [...new Set([...s, id])] : s.filter((x) => x !== id)))
  const patch = (id: string, p: Partial<QualityRecord>) =>
    setRows((gs) => gs.map((g) => ({ ...g, records: g.records.map((r) => (r.id === id ? { ...r, ...p } : r)) })))

  const rescan = () => {
    setScan(true)
    window.setTimeout(() => {
      setScan(false)
      setCols((cs) => cs.map((c) => ({ ...c, okPct: Math.min(100, Math.max(5, c.okPct + (c.okPct < 80 ? Math.round(Math.random() * 6) : 0))) })))
      push("column rescan finished — validity recomputed")
    }, 1500)
  }

  const actions: BulkAction[] = [
    {
      label: "Merge",
      run: (ids) => {
        let merged = 0
        setRows((gs) =>
          gs.map((g) => {
            const dupes = g.records.filter((r) => ids.includes(r.id) && r.state === "conflict")
            merged += dupes.length
            const keepFirst = new Set(dupes.slice(1).map((d) => d.id))
            return { ...g, records: g.records.filter((r) => !ids.includes(r.id) || !keepFirst.has(r.id)).map((r) => (ids.includes(r.id) ? { ...r, state: "clean" as const } : r)) }
          }),
        )
        setSel([])
        push(`${merged || ids.length} records merged — survivor kept, history attached`, "ok")
        onMerged?.(merged || ids.length)
      },
    },
    {
      label: "Mark reviewed",
      run: (ids) => {
        ids.forEach((id) => patch(id, { state: "clean" }))
        push(`${ids.length} records marked reviewed`)
        setSel([])
      },
    },
    {
      label: "Quarantine",
      tone: "danger",
      run: (ids) => {
        ids.forEach((id) => patch(id, { state: "conflict" }))
        push(`${ids.length} records quarantined from sync`, "warn")
        setSel([])
      },
    },
  ]

  return (
    <div className={cn("relative isolate flex min-h-[540px] w-full flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Data quality</h2>
        <span className="text-[12px] text-muted-foreground">{ledger}</span>
        <span className="text-[12px] text-muted-foreground">· nightly sync {syncedAt}</span>
        <span className="flex items-center gap-1.5 rounded border border-[hsl(var(--err)/0.4)] bg-[hsl(var(--err)/0.08)] px-2 py-0.5 text-[11px] font-semibold text-[hsl(var(--err))]">
          <ShieldAlert className="size-3.5" /> {conflicts} conflicts
        </span>
        <Button type="button" variant="ghost" onClick={rescan} disabled={scan} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <ScanSearch className="size-3.5" /> {scan ? "Scanning…" : "Rescan columns"}
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-4 p-4 lg:grid-cols-[260px_minmax(0,1fr)_230px]">
        {/* scope rail */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <ListTree className="size-3.5" /> Scope
            </header>
            <div className="p-3">
              <FilterTokenBuilder tokens={tokens} onChange={setTokens} and={and} onAnd={setAnd} fields={["name", "email", "phone", "state"]} placeholder="field op value…" />
              <p className="mt-2.5 text-[11px] text-muted-foreground">Tokens scope the record tree below. <code className="font-mono">:</code> means contains.</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(["stale", "conflict"] as const).map((s) => (
                  <Button type="button" variant="ghost" key={s} onClick={() => setTokens([{ field: "state", op: "=", value: s }])} className="rounded border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted">
                    {s} only
                  </Button>
                ))}
          
    </div>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Sync window</span>
            <dl className="mt-2 space-y-1 text-[12px]">
              <div className="flex justify-between"><dt className="text-muted-foreground">Last run</dt><dd className="font-mono tabular-nums">{syncedAt}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Records</dt><dd className="font-mono tabular-nums">{rows.reduce((a, g) => a + g.records.length, 0)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">In scope</dt><dd className="font-mono tabular-nums">{leafIds.length}</dd></div>
            </dl>
          </section>
        </aside>

        {/* record tree */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Record tree · {leafIds.length} in scope</span>
            <Button type="button" variant="ghost"
              onClick={() => setSel(leafIds.length && sel.length === leafIds.length ? [] : leafIds)}
              className="flex items-center gap-1 text-[11px] font-bold text-[hsl(var(--info))]"
            >
              <SquareCheckBig className="size-3.5" /> {sel.length === leafIds.length && leafIds.length > 0 ? "clear" : "select all"}
            </Button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="w-8 px-2 py-1.5" />
                <th className="px-3 py-1.5 font-semibold">Record</th>
                <th className="px-2 py-1.5 font-semibold">Email</th>
                <th className="px-2 py-1.5 font-semibold">Phone</th>
                <th className="px-3 py-1.5 text-right font-semibold">State</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((g) => {
                const allSel = g.active.every((r) => sel.includes(r.id))
                return (
                  <Fragment key={g.id}>
                    <tr className="border-b bg-muted/20">
                      <td className="px-2 py-1">
                        <Checkbox
                          checked={allSel ? true : g.active.some((r) => sel.includes(r.id)) ? "indeterminate" : false}
                          onCheckedChange={(v: boolean | "indeterminate") => g.active.forEach((r) => toggle(r.id, v === true))}
                          aria-label={`Select all in ${g.label}`}
                          className="size-3.5"
                        />
                      </td>
                      <td colSpan={4} className="px-3 py-1">
                        <Button type="button" variant="ghost" onClick={() => setOpen((o) => ({ ...o, [g.id]: !o[g.id] }))} className="flex items-center gap-1.5 text-left text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground">
                          <span className={cn("transition-transform", open[g.id] && "rotate-90")}>▸</span> {g.label} · {g.active.length}
                        </Button>
                      </td>
                    </tr>
                    {open[g.id] !== false &&
                      g.active.map((r) => (
                        <tr key={r.id} className={cn("border-b border-app-line/60 last:border-0", sel.includes(r.id) && "bg-accent/40")}>
                          <td className="px-2 py-1">
                            <Checkbox checked={sel.includes(r.id)} onCheckedChange={(v: boolean | "indeterminate") => toggle(r.id, v === true)} aria-label={`Select ${r.name}`} className="size-3.5" />
                          </td>
                          <td className="px-3 py-1">
                            <InlineEditCell value={r.name} name={`name of ${r.id}`} onSave={async (v: string) => { if (v.trim().length < 2) throw new Error("name"); patch(r.id, { name: v.trim() }) }} width={130} />
                          </td>
                          <td className="px-2 py-1">
                            <InlineEditCell value={r.email} name={`email of ${r.id}`} mono onSave={async (v: string) => { if (!v.includes("@")) throw new Error("email"); patch(r.id, { email: v }) }} width={170} />
                          </td>
                          <td className="px-2 py-1 font-mono tabular-nums text-muted-foreground">{r.phone}</td>
                          <td className="px-3 py-1 text-right">
                            <span className={cn("inline-block rounded border px-1.5 py-0.5 text-[10px] font-semibold", STATE_STYLES[r.state])}>{r.state}</span>
                          </td>
                        </tr>
                      ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Tap a name or email to correct it · merges keep the first record and attach history</div>
          <AnimatePresence>
            {sel.length > 0 && (
              <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }} className="border-t bg-background">
                <BulkSelectBar selected={sel} total={leafIds.length} actions={actions} onClear={() => setSel([])} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* column audit */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Column audit {scan && <span className="text-[hsl(var(--info))]">scanning…</span>}
            </header>
            <SmartSkeleton loading={scan} lines={4} slowAfterMs={900} slowLabel="registry is slow — holding the scan">
              <div className="divide-y">
                {cols.map((c) => (
                  <div key={c.name} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="font-mono text-[12px] font-semibold">{c.name}</p>
                      {c.note && <p className="text-[10px] text-muted-foreground">{c.note}</p>}
                    </div>
                    <span className={cn("font-mono text-[12px] font-bold tabular-nums", c.okPct < 60 ? "text-[hsl(var(--err))]" : c.okPct < 85 ? "text-[hsl(var(--warn))]" : "text-[hsl(var(--ok))]")}>
                      {c.okPct}%
                    </span>
                  </div>
                ))}
              </div>
            </SmartSkeleton>
          </section>
          <section className="rounded-lg border bg-card p-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">House rules</span>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-[1.5] text-muted-foreground">
              <li>· duplicates merge, never delete — history stays attached</li>
              <li>· quarantined rows are excluded from the nightly sync</li>
              <li>· every edit is stamped with the operator on duty</li>
            </ul>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
