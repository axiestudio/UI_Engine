import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarCheck, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { CornerTicks, Dots, MonoLabel } from "@/components/primitives/handcraft"
import { UploadQueue, type UploadFile } from "upload-queue"
import { InlineEditCell } from "inline-edit-cell"
import { AnnotationPinLayer, type Pin } from "annotation-pin-layer"
import { StorageRingMeter } from "storage-ring-meter"

// COMPOSITE SCREEN · PROPERTY LISTING
// composed of: upload-queue (media queue), inline-edit-cell (list price in the
// comp grid), annotation-pin-layer (pin notes on photos), storage-ring-meter
// (media quota) + purpose-built open-house window picker.

export type ListingDeskProps = {
  address?: string
  mls?: string
  onPublished?: () => void
  className?: string
}

type Comp = { id: string; address: string; beds: number; area: number; sold: number }

const COMPS: Comp[] = [
  { id: "c1", address: "8 Marigold Ct", beds: 4, area: 132, sold: 6_150_000 },
  { id: "c2", address: "21 Marigold Ct", beds: 4, area: 128, sold: 5_890_000 },
  { id: "c3", address: "3 Willow Row", beds: 5, area: 141, sold: 6_640_000 },
  { id: "c4", address: "17 Marigold Ct", beds: 3, area: 118, sold: 5_410_000 },
]

const DEFAULT_PINS: Pin[] = [
  { id: "p1", x: 32, y: 38, author: "S. Marek", text: "Retouch the window glare before print." },
  { id: "p2", x: 55, y: 34, author: "S. Marek", text: "Staging: hide the builder's radio." },
  { id: "p3", x: 36, y: 45, author: "J. Luna", text: "Warm the white balance here." },
]

const DEFAULT_UPLOADS: UploadFile[] = [
  { id: "u1", name: "IMG_0228 · facade.jpg", size: 6_400_000, status: "done", progress: 100 },
  { id: "u2", name: "IMG_0231 · kitchen.jpg", size: 7_100_000, status: "uploading", progress: 48 },
  { id: "u3", name: "floorplan-a3.pdf", size: 1_200_000, status: "error", tries: 1, error: "folder not approved" },
]

const DAYS = ["thu 4 jun", "fri 5 jun", "sat 6 jun", "sun 7 jun"] as const
const WINDOWS = ["10–12", "12–14", "14–16", "16–18"] as const

export function ListingDesk({ address = "14 Marigold Ct", mls = "MLS-88213", onPublished, className }: ListingDeskProps) {
  const [price, setPrice] = useState(6_250_000)
  const [slots, setSlots] = useState<Set<string>>(new Set(["sat 6 jun|12–14"]))
  const [pins, setPins] = useState(DEFAULT_PINS)
  const [published, setPublished] = useState<null | { at: string }>(null)
  const [uploads, setUploads] = useState(DEFAULT_UPLOADS)

  const area = 136
  const ppm = Math.round(price / area)
  const pendingUploads = uploads.filter((u) => u.status !== "done").length

  const toggleSlot = (d: string, w: string) =>
    setSlots((prev) => {
      const next = new Set(prev)
      const key = `${d}|${w}`
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const savePrice = async (v: string) => {
    const num = Number(v.replace(/\s/g, ""))
    if (!isFinite(num) || num <= 0) throw new Error("not a price")
    setPrice(Math.round(num))
  }

  return (
    <div className={cn("flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Listing desk</h2>
        <span className="text-[12px] text-muted-foreground">{address}</span>
        <span className="text-[12px] text-muted-foreground">· {mls} · 4 bed · {area} m²</span>
        <button onClick={() => { setPublished({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }); onPublished?.() }} disabled={!!published || pendingUploads > 0} className="ml-auto flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted disabled:opacity-40">
          <Send className="size-3.5" /> {published ? `Published · ${published.at}` : "Publish listing"}
        </button>
      </header>

      <AnimatePresence>
        {!published && pendingUploads > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="shrink-0 border-b bg-[hsl(var(--warn)/0.08)] px-4 py-1.5 text-[11px] text-[hsl(var(--warn))]">
            {pendingUploads} media item{pendingUploads === 1 ? "" : "s"} still pending — publishing is held until the set is complete.
          </motion.p>
        )}
      </AnimatePresence>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[290px_minmax(0,1fr)_290px]">
        {/* price grid */}
        <aside className="flex min-h-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Price grid</header>
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b text-left text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-3 py-1.5 font-semibold">Comp</th>
                  <th className="w-10 px-2 py-1.5 text-right font-semibold">Bed</th>
                  <th className="w-24 px-3 py-1.5 text-right font-semibold">Sold</th>
                </tr>
              </thead>
              <tbody>
                {COMPS.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-1">
                      <span className="font-medium">{c.address}</span>
                      <span className="block text-[11px] text-muted-foreground">{c.area} m² · {Math.round(c.sold / c.area).toLocaleString()} /m²</span>
                    </td>
                    <td className="px-2 py-1 text-right font-mono tabular-nums">{c.beds}</td>
                    <td className="px-3 py-1 text-right font-mono tabular-nums">{c.sold.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="bg-accent/40">
                  <td className="px-3 py-1.5">
                    <span className="text-[13px] font-bold">{address}</span>
                    <span className="block text-[11px] text-muted-foreground">subject · {area} m²</span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">4</td>
                  <td className="px-3 py-1.5 text-right">
                    <div className="flex justify-end">
                      <InlineEditCell value={String(price)} name="list price" mono width={78} onSave={savePrice} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-baseline justify-between border-t px-3 py-2">
              <MonoLabel className="text-muted-foreground" tick={false}>kr / m²</MonoLabel>
              <motion.span key={ppm} initial={{ scale: 1.12, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-[13px] font-bold tabular-nums">{ppm.toLocaleString()}</motion.span>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Facts</header>
            <div className="space-y-1.5 p-3 text-[12px]">
              {[["Living area", `${area} m²`], ["Plot", "640 m²"], ["Bathrooms", "2"], ["Energy", "C 194 kWh/m²"], ["Viewings booked", "6" + String.fromCharCode(160) + "· " + "next sat 12:00"]].map(([k, v]) => (
                <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-mono tabular-nums">{v}</span></div>
              ))}
            </div>
          </section>
        </aside>

        {/* media */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="min-h-0 flex-1 overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Photography · pin notes</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pins.length} pins</span>
            </header>
            <div className="p-3">
              <AnnotationPinLayer
                author="S. Marek"
                pins={pins}
                onAddPin={(p: { x: number; y: number }) => setPins((ps) => [...ps, { id: "p" + String(Date.now()), x: p.x, y: p.y, author: "S. Marek", text: "New note — describe the fix." }])}
                onRemove={(id: string) => setPins((ps) => ps.filter((p) => p.id !== id))}
                canvas={
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border bg-gradient-to-br from-[hsl(214_35%_88%)] via-[hsl(210_28%_78%)] to-[hsl(200_24%_58%)]">
                    <Dots className="text-white/70" />
                    <CornerTicks className="text-white/80" />
                    <span className="absolute bottom-2 left-2 rounded border bg-background/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">IMG_0231 · kitchen, south light</span>
                  </div>
                }
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Media uploads</span>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pendingUploads} pending</span>
            </header>
            <div className="p-3">
              <UploadQueue files={uploads} onRetry={() => setUploads((us) => us.map((u) => (u.status === "error" ? { ...u, status: "uploading", progress: 5, tries: (u.tries ?? 0) + 1, error: undefined } : u)))} onRemove={(id: string) => setUploads((us) => us.filter((u) => u.id !== id))} />
            </div>
          </div>
        </section>

        {/* open house + quota */}
        <aside className="flex min-h-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Open house</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--info))]"><CalendarCheck className="size-3.5" /> {slots.size} live</span>
            </header>
            <div className="grid gap-1.5 p-3">
              {DAYS.map((d) => (
                <div key={d} className="flex items-center gap-1.5">
                  <span className="w-16 shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{d}</span>
                  {WINDOWS.map((w) => {
                    const on = slots.has(`${d}|${w}`)
                    return (
                      <button key={w} onClick={() => toggleSlot(d, w)} aria-pressed={on} className={cn("h-7 flex-1 rounded border font-mono text-[10px] font-semibold tabular-nums", on ? "border-primary bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-muted/50")}>
                        {w}
                      </button>
                    )
                  })}
                </div>
              ))}
              <p className="pt-1 text-[11px] text-muted-foreground">Selected windows go live to the portal within 5 minutes · broker chat gets reminders.</p>
            </div>
          </section>
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Media quota</header>
            <div className="p-3">
              <StorageRingMeter
                segments={[
                  { label: "photos", bytes: 3_100_000_000, color: "hsl(var(--primary))" },
                  { label: "video", bytes: 2_180_000_000, color: "hsl(var(--info))" },
                  { label: "floorplan", bytes: 420_000_000, color: "hsl(var(--warn))" },
                ]}
                quota={8_000_000_000}
                label="mls storage"
                resetNote="Archive on sale resets the allocation."
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
