import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/watermelon/checkbox"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/watermelon/table"
import { Separator } from "@/components/ui/separator"
import { MonoLabel, Grain } from "@/components/primitives/handcraft"
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
      <Grain opacity={0.035} />
      <header className="flex flex-wrap items-center gap-3 border-b bg-card px-5 py-4">
        <h2 className="font-display text-lg font-black tracking-tight">Crew & access</h2>
        <Badge variant="secondary" className="font-mono text-[9px]">{CREW.length} on the books</Badge>
        <Dialog>
          <DialogTrigger className="ml-auto h-8 rounded-md border px-3 text-[10px] font-black uppercase tracking-[0.14em] hover:bg-muted">role matrix →</DialogTrigger>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Who may do what</DialogTitle></DialogHeader>
            <PermissionMatrix perms={perms} roles={roles} value={matrix} onSet={(p, r, v) => setMatrix((m) => ({ ...m, [r]: { ...m[r], [p]: v } }))} />
            <p className="text-[11px] text-muted-foreground">Click cycles allow → ask → deny. On a website this same block is the “how we govern ourselves” proof.</p>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_300px]">
        <div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><span className="sr-only">select</span><Checkbox checked={sel.length === CREW.length} onCheckedChange={(c: boolean) => setSel(c ? CREW.map((x) => x.id) : [])} aria-label="select all" /></TableHead>
                    <TableHead>Crew</TableHead><TableHead>Role</TableHead><TableHead>Tags</TableHead><TableHead>Onboarded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CREW.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><Checkbox checked={sel.includes(c.id)} onCheckedChange={(v: boolean) => setSel((s) => v ? [...s, c.id] : s.filter((x) => x !== c.id))} aria-label={`select ${c.name}`} /></TableCell>
                      <TableCell><span className="flex items-center gap-2.5"><Avatar className="size-8"><AvatarFallback className="text-[9px] font-black">{c.name.split(" ").map((w) => w[0]).join("")}</AvatarFallback></Avatar><span className="text-[13px] font-bold">{c.name}</span></span></TableCell>
                      <TableCell className="text-[12px] text-muted-foreground">{c.role}</TableCell>
                      <TableCell className="space-x-1">{c.tags.map((t) => <Badge key={t} variant="outline" className="font-mono text-[8px] uppercase">{t}</Badge>)}</TableCell>
                      <TableCell className="font-mono text-[11px] tabular-nums text-muted-foreground">{c.onboarded}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Separator className="my-5" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <MonoLabel className="mb-2 block text-muted-foreground">SHIFT ASSIGNMENT (async crew search)</MonoLabel>
              <AsyncMultiselect value={assign} onValueChange={setAssign} label="crew" loadItems={async (q, page) => { await new Promise((r) => setTimeout(r, 350)); const b = ALL_PEOPLE.filter((p) => p.label.toLowerCase().includes(q.toLowerCase())); return { items: b.slice(0, 6), more: false } }} />
            </div>
            <div>
              <MonoLabel className="mb-2 block text-muted-foreground">ACCESS TAGS</MonoLabel>
              <TokenInput value={["till", "door-code", "press-kit"].slice(0, sel.length || 3)} onChange={() => {}} label="access tags" />
            </div>
          </div>
        </div>
        <aside className="h-fit">
          <Card>
            <CardContent className="p-5">
              <MonoLabel className="mb-3 block text-muted-foreground">INVITE A NEW CHAIR</MonoLabel>
              <input value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="temp@studio.house" className="mb-3 h-9 w-full rounded-md border bg-background px-3 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))]" />
              <label className="mb-1 flex items-center gap-2 text-[11px] font-bold text-muted-foreground"><Switch /> send invite now</label>
              <PasswordMeter value="temp-pass-" onChange={() => {}} onScore={setScore} />
              <button disabled={score < 70} onClick={() => push("temporary credentials issued", "ok")} className="mt-4 h-9 w-full rounded-md bg-primary text-[10px] font-black uppercase tracking-[0.18em] text-primary-foreground disabled:opacity-40">issue temp password</button>
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
