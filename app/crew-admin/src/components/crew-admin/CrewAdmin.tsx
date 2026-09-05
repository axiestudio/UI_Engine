import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/watermelon/checkbox"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/primitives/dialog"
import { PermissionMatrix } from "permission-matrix"
import { AsyncMultiselect, type PickOption } from "async-multiselect"
import { BulkSelectBar } from "bulk-select-bar"
import { TokenInput } from "token-input"
import { PasswordMeter } from "password-meter"
import { ToastStack } from "toast-stack"

// COMPOSITE — permission-matrix + async-multiselect + bulk-select-bar +
// token-input + password-meter + toast-stack, hosted in watermelon table +
// checkbox + avatar + badge + card, opened through a motion dialog.
// JOB      run the people behind the product
// MOVE     the crew table IS the selection surface — ticking rows arms the
//          floating bar; "permissions" opens the matrix in the dialog shell

const CREW = [
  { id: "k1", name: "Klara Lindqvist", role: "stylist", tags: ["colour", "school"], onboarded: "2019-02-11" },
  { id: "o2", name: "Oskar Berg", role: "stylist", tags: ["fades"], onboarded: "2022-08-02" },
  { id: "e3", name: "Elin Sandberg", role: "front of house", tags: ["doors", "boards"], onboarded: "2021-11-30" },
  { id: "v4", name: "Vera Ohlsson", role: "stylist", tags: ["texture"], onboarded: "2023-01-15" },
]
const ALL_PEOPLE = CREW.map((c) => ({ id: c.id, label: c.name, meta: c.role }))

export type CrewAdminProps = { className?: string }

export function CrewAdmin({ className }: CrewAdminProps) {
  const [sel, setSel] = React.useState<string[]>([])
  const [assign, setAssign] = React.useState<PickOption[]>([{ id: "k1", label: "Klara Lindqvist", meta: "stylist" }])
  const [toasts, setToasts] = React.useState<{ id: string; title: string; tone?: "ok" | "warn" | "err" | "info" }[]>([])
  const perms = ["bookings.read", "bookings.write", "clients.export", "payroll", "products.edit"]
  const roles = ["Owner", "Stylist", "Front desk", "Intern"]
  const [matrix, setMatrix] = React.useState<Record<string, Record<string, "allow" | "ask" | "deny">>>({
    Owner: Object.fromEntries(perms.map((p) => [p, "allow" as const])),
    Stylist: { "bookings.read": "allow", "bookings.write": "allow", "clients.export": "deny", payroll: "deny", "products.edit": "ask" },
    "Front desk": { "bookings.read": "allow", "bookings.write": "allow", "clients.export": "ask", payroll: "deny", "products.edit": "deny" },
    Intern: Object.fromEntries(perms.map((p) => [p, "deny" as const])),
  })
  const [invite, setInvite] = React.useState("")
  const [score, setScore] = React.useState(0)
  const push = (title: string, tone: "ok" | "warn" | "err" | "info" = "info") => setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl border bg-background font-sans", className)}>
      <header className="flex shrink-0 items-center gap-3 border-b bg-card px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="truncate font-display text-base font-black tracking-tight sm:text-lg">Crew &amp; access</h2>
        <Badge variant="secondary" className="hidden shrink-0 font-mono text-[9px] sm:inline-flex">{CREW.length} on the books</Badge>
        <Dialog>
          <DialogTrigger className="ml-auto h-8 shrink-0 rounded-md border px-3 font-mono text-[10px] font-black uppercase tracking-[0.14em] hover:bg-muted">role matrix →</DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Who may do what</DialogTitle></DialogHeader>
            <PermissionMatrix perms={perms} roles={roles} value={matrix} onSet={(p, r, v) => setMatrix((m) => ({ ...m, [r]: { ...m[r], [p]: v } }))} />
            <p className="text-[11px] text-muted-foreground">Click cycles allow → ask → deny. On a website this same block is the “how we govern ourselves” proof.</p>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid min-w-0 gap-6 p-4 sm:p-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          <Card>
            <CardContent className="min-w-0 overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><span className="sr-only">select</span><Checkbox checked={sel.length === CREW.length} onCheckedChange={(c: boolean) => setSel(c ? CREW.map((x) => x.id) : [])} aria-label="select all" /></TableHead>
                    <TableHead>Crew</TableHead><TableHead>Role</TableHead><TableHead className="hidden sm:table-cell">Tags</TableHead><TableHead className="hidden md:table-cell">Onboarded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CREW.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><Checkbox checked={sel.includes(c.id)} onCheckedChange={(v: boolean) => setSel((s) => v ? [...s, c.id] : s.filter((x) => x !== c.id))} aria-label={`select ${c.name}`} /></TableCell>
                      <TableCell className="min-w-[160px]"><span className="flex items-center gap-2.5"><Avatar className="size-8"><AvatarFallback className="text-[9px] font-black">{c.name.split(" ").map((w) => w[0]).join("")}</AvatarFallback></Avatar><span className="truncate text-[13px] font-bold">{c.name}</span></span></TableCell>
                      <TableCell className="truncate text-[12px] text-muted-foreground">{c.role}</TableCell>
                      <TableCell className="hidden max-w-[160px] flex-wrap gap-1 sm:table-cell">{c.tags.map((t) => <Badge key={t} variant="outline" className="font-mono text-[8px] uppercase">{t}</Badge>)}</TableCell>
                      <TableCell className="hidden font-mono text-[11px] tabular-nums text-muted-foreground md:table-cell">{c.onboarded}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Separator className="my-5" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] mb-2 block text-muted-foreground">SHIFT ASSIGNMENT (async crew search)</span>
              <AsyncMultiselect value={assign} onValueChange={setAssign} label="crew" loadItems={async (q, page) => { await new Promise((r) => setTimeout(r, 350)); const b = ALL_PEOPLE.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())); return { items: b.slice(0, 6), more: false } }} />
            </div>
            <div>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] mb-2 block text-muted-foreground">ACCESS TAGS</span>
              <TokenInput value={["till", "door-code", "press-kit"].slice(0, sel.length || 3)} onChange={() => {}} label="access tags" />
            </div>
          </div>
        </div>
        <aside className="h-fit">
          <Card>
            <CardContent className="p-5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] mb-3 block text-muted-foreground">INVITE A NEW CHAIR</span>
              <Input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="temp@studio.house" className="mb-3 focus-visible:ring-[hsl(var(--app-focus))]" />
              <label className="mb-1 flex items-center gap-2 text-[11px] font-bold text-muted-foreground"><Switch /> send invite now</label>
              <PasswordMeter value="temp-pass-" onChange={() => {}} onScore={setScore} />
              <Button type="button" variant="ghost" disabled={score < 70} onClick={() => push("temporary credentials issued", "ok")} className="mt-4 h-9 w-full rounded-md bg-primary text-[10px] font-black uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40">issue temp password</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
      <BulkSelectBar selected={sel} total={CREW.length} onClear={() => setSel([])} actions={[
        { label: "Reassign", run: (s) => { push(`${s.length} moved to shift A`, "ok"); setSel([]) } },
        { label: "Suspend", tone: "danger", run: (s) => { push(`${s.length} suspended`, "err"); setSel([]) } },
      ]} />
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </div>
  )
}
