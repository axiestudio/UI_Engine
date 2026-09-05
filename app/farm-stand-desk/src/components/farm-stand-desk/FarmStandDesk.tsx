import { Fragment, useState } from "react"
import { motion, AnimatePresence, MotionConfig } from "motion/react"
import { Camera, Printer, Scale, Sprout } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FunnelStageBars, type FunnelStage } from "funnel-stage-bars"
import { InlineEditCell } from "inline-edit-cell"
import { DragNumberField } from "drag-number-field"
import { UploadQueue, type UploadFile } from "upload-queue"
import { ToastStack, type Toast } from "toast-stack"

// COMPOSITE SCREEN · FARM STAND
// composed of: upload-queue (photo-logged harvest), inline-edit-cell (product
// prices), funnel-stage-bars (CSA funnel), drag-number-field (weight scrub)
// + purpose-built product tree with stock levels.

export type Lot = { id: string; name: string; price: number; unit: string; stock: number; reserved: number }

export type FarmStandDeskProps = {
  marketDay?: string
  photos?: UploadFile[]
  products?: { id: string; label: string; lots: Lot[] }[]
  funnel?: FunnelStage[]
  onPickList?: () => void
  className?: string
}

const DEFAULT_PHOTOS: UploadFile[] = [
  { id: "f1", name: "heirloom-tomatoes-crates.jpg", size: 3_412_000, status: "uploading", progress: 64 },
  { id: "f2", name: "strawberry-flats-morning.jpg", size: 2_180_000, status: "done" },
  { id: "f3", name: "sourdough-pallet.jpg", size: 1_940_000, status: "error", tries: 2, error: "cellular link dropped at stall 4" },
]

const DEFAULT_PRODUCTS = [
  {
    id: "veg",
    label: "Vegetables",
    lots: [
      { id: "l1", name: "Heirloom tomatoes", price: 49, unit: "kg", stock: 38, reserved: 12 },
      { id: "l2", name: "New potatoes", price: 24, unit: "kg", stock: 96, reserved: 30 },
      { id: "l3", name: "Rainbow chard", price: 19, unit: "bunch", stock: 7, reserved: 4 },
    ],
  },
  {
    id: "berry",
    label: "Berries",
    lots: [
      { id: "l4", name: "Strawberries", price: 65, unit: "basket", stock: 22, reserved: 18 },
      { id: "l5", name: "Raspberries", price: 79, unit: "basket", stock: 4, reserved: 2 },
    ],
  },
  {
    id: "pantry",
    label: "Pantry",
    lots: [
      { id: "l6", name: "Sourdough loaf", price: 42, unit: "st", stock: 31, reserved: 0 },
      { id: "l7", name: "Raw honey 500 g", price: 110, unit: "st", stock: 14, reserved: 6 },
    ],
  },
]

const DEFAULT_FUNNEL: FunnelStage[] = [
  { label: "Signed up", value: 148 },
  { label: "Deposits", value: 121 },
  { label: "Boxes active", value: 96 },
  { label: "Renewed", value: 71 },
]

export function FarmStandDesk({ marketDay = "Sat · stall 4–7", photos = DEFAULT_PHOTOS, products = DEFAULT_PRODUCTS, funnel = DEFAULT_FUNNEL, onPickList, className }: FarmStandDeskProps) {
  const [tree, setTree] = useState(products)
  const [files, setFiles] = useState<UploadFile[]>(photos)
  const [unit, setUnit] = useState<"kg" | "lb">("kg")
  const [gross, setGross] = useState(18.4)
  const [tare, setTare] = useState(1.2)
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = (title: string, tone: Toast["tone"] = "ok") =>
    setToasts((t) => [...t.slice(-2), { id: String(Date.now() + Math.random()), title, tone }])

  const KG_PER_LB = 0.4536
  const shown = (kg: number) => (unit === "kg" ? kg : kg / KG_PER_LB)
  const stash = (v: number) => (unit === "kg" ? v : v * KG_PER_LB)
  const netKg = Math.max(0, gross - tare)
  const fmt = (kg: number) => `${(unit === "kg" ? kg : kg / KG_PER_LB).toFixed(1)} ${unit}`

  const setPrice = (lotId: string, v: number) =>
    setTree((gs) => gs.map((g) => ({ ...g, lots: g.lots.map((l) => (l.id === lotId ? { ...l, price: v } : l)) })))

  return (
    <div className={cn("relative isolate flex min-h-[540px] w-full flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <MotionConfig reducedMotion="user">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Farm stand</h2>
        <span className="text-[12px] text-muted-foreground">Stallbacka market · {marketDay}</span>
        <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Sprout className="size-3.5" /> harvest logged by 3 growers</span>
        <Button type="button" variant="ghost" onClick={() => { push("pick list sent to the barn printer"); onPickList?.() }} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted">
          <Printer className="size-3.5" /> Print pick list
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[270px_minmax(0,1fr)_260px]">
        {/* harvest log + funnel */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Camera className="size-3.5" /> Photo log
            </header>
            <UploadQueue files={files} onRetry={(id: string) => { setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 5, tries: (f.tries ?? 1) + 1, error: undefined } : f))); push("retrying from the stall hotspot", "info") }} onRemove={(id: string) => setFiles((fs) => fs.filter((f) => f.id !== id))} className="border-0" />
          </section>
          <section className="rounded-lg border bg-card p-3">
            <FunnelStageBars stages={funnel} eyebrow="CSA spring share" topLabel="member journey" orientation="vertical" />
          </section>
        </aside>

        {/* product tree */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Product tree · {tree.reduce((a, g) => a + g.lots.length, 0)} lots</span>
            <span className="text-[11px] font-bold text-[hsl(var(--info))]">tap a price to edit</span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-3 py-1.5 font-semibold">Lot</th>
                <th className="px-2 py-1.5 font-semibold">Price</th>
                <th className="px-2 py-1.5 text-right font-semibold">Stock</th>
                <th className="px-2 py-1.5 text-right font-semibold">Reserved</th>
                <th className="px-3 py-1.5 text-right font-semibold">Flag</th>
              </tr>
            </thead>
            <tbody>
              {tree.map((g) => (
                <Fragment key={g.id}>
                  <tr className="border-b bg-muted/20">
                    <td colSpan={5} className="px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                      {g.label} · {g.lots.length}
                    </td>
                  </tr>
                  {g.lots.map((l) => {
                    const low = l.stock - l.reserved < 8
                    return (
                      <tr key={l.id} className="border-b border-app-line/60 last:border-0">
                        <td className="px-3 py-1 font-medium">{l.name} <span className="text-[10px] text-muted-foreground">/ {l.unit}</span></td>
                        <td className="px-2 py-1">
                          <InlineEditCell
                            value={String(l.price)}
                            name={`price of ${l.name}`}
                            mono
                            width={52}
                            onSave={async (v: string) => {
                              const n = Number(v)
                              if (!isFinite(n) || n < 0) throw new Error("price")
                              setPrice(l.id, Math.round(n))
                              push(`${l.name} repriced to ${Math.round(n)} ${l.unit === "st" ? "kr/st" : `kr/${l.unit}`}`)
                            }}
                          />
                        </td>
                        <td className="px-2 py-1 text-right font-mono tabular-nums">{l.stock}</td>
                        <td className="px-2 py-1 text-right font-mono tabular-nums text-muted-foreground">{l.reserved}</td>
                        <td className="px-3 py-1 text-right">
                          <AnimatePresence mode="popLayout" initial={false}>
                            {low ? (
                              <motion.span key="low" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="inline-block rounded border border-[hsl(var(--warn)/0.5)] px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--warn))]">
                                pick more
                              </motion.span>
                            ) : (
                              <motion.span key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] font-semibold text-muted-foreground">ok</motion.span>
                            )}
                          </AnimatePresence>
                        </td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
          </div>
          <div className="border-t px-3 py-2 text-[11px] text-muted-foreground">Reserved counts CSA boxes already promised for tomorrow's drop      
          
    </div>
        </section>

        {/* weights */}
        <aside className="flex flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center gap-1.5 border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Scale className="size-3.5" /> Lot weighing
            </header>
            <div className="space-y-3 p-3">
              <div className="flex gap-1.5">
                {(["kg", "lb"] as const).map((u) => (
                  <Button type="button" variant="ghost" key={u} onClick={() => setUnit(u)} className={cn("h-7 flex-1 rounded-md border text-[11px] font-semibold", unit === u ? "border-primary bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted/50")}>
                    {u}
                  </Button>
                ))}
              </div>
              <DragNumberField label="Gross" value={Number(shown(gross).toFixed(2))} onValueChange={(v: number) => setGross(Math.max(0, stash(v)))} step={0.05} precision={2} min={0} unit={unit} />
              <DragNumberField label="Tare (crate)" value={Number(shown(tare).toFixed(2))} onValueChange={(v: number) => setTare(Math.max(0, stash(v)))} step={0.05} precision={2} min={0} unit={unit} />
              <div className="flex items-baseline justify-between rounded-md border bg-muted/30 px-3 py-2">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[10px] text-muted-foreground">Net</span>
                <motion.span key={fmt(netKg)} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="font-mono text-[18px] font-bold tabular-nums">
                  {fmt(netKg)}
                </motion.span>
              </div>
              <p className="text-[11px] text-muted-foreground">Drag a number to scrub · units convert at 1 lb = 0.4536 kg</p>
            </div>
          </section>
          <section className="rounded-lg border bg-card p-3">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Stall notes</span>
            <ol className="mt-2 space-y-1.5 text-[11px] leading-[1.5] text-muted-foreground">
              {["chard moves first — front the crate", "hold 2 baskets strawberries for Lågpris", "honey price matches online shop"].map((n, i) => (
                <li key={n} className="flex gap-2"><span className="font-mono text-[11px] font-semibold tabular-nums text-muted-foreground shrink-0 opacity-70">{String(i + 1).padStart(2, "0")}</span> {n}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
      <ToastStack toasts={toasts} onDismiss={(id: string) => setToasts((t) => t.filter((x) => x.id !== id))} pos="br" />
          </MotionConfig>
    </div>
  )
}
