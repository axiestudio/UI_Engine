import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CalendarCheck, Camera, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { CornerTicks, Dots, MonoLabel } from "@/components/primitives/handcraft"
import { UploadQueue, type UploadFile } from "upload-queue"
import { InlineEditCell } from "inline-edit-cell"
import { AnnotationPinLayer, type Pin } from "annotation-pin-layer"
import { StorageRingMeter } from "storage-ring-meter"
import { DateRangePresets, type Range } from "date-range-presets"
import { Button } from "@/components/ui/button"

// COMPOSITE SCREEN · PROPERTY LISTING
// composed of: annotation-pin-layer (pin notes on the photo board — hero),
// date-range-presets (open-house date window), upload-queue (media queue),
// inline-edit-cell (list price in the comp ledger), storage-ring-meter
// (media quota, docked) + purpose-built open-house chips rail.
// STRUCTURE: framed editorial shell — full-bleed photo board hero on top,
// open-house chips rail band, then an asymmetric deck (comp ledger |
// uploads + facts | docked quota).

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

const WINDOWS = ["10–12", "12–14", "14–16", "16–18"] as const

const DAY_MS = 86_400_000

function openingWeekend(): Range {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() + ((4 - from.getDay() + 7) % 7 || 7))
  const to = new Date(from.getTime() + 3 * DAY_MS)
  to.setHours(23, 59, 0, 0)
  return { from, to, label: "Opening weekend" }
}

export function ListingDesk({ address = "14 Marigold Ct", mls = "MLS-88213", onPublished, className }: ListingDeskProps) {
  const [price, setPrice] = useState(6_250_000)
  const [range, setRange] = useState<Range | null>(openingWeekend)
  const [slots, setSlots] = useState<Set<string>>(new Set(["12–14", "14–16"]))
  const [pins, setPins] = useState(DEFAULT_PINS)
  const [published, setPublished] = useState<null | { at: string }>(null)
  const [uploads, setUploads] = useState(DEFAULT_UPLOADS)

  const area = 136
  const ppm = Math.round(price / area)
  const pendingUploads = uploads.filter((u) => u.status !== "done").length
  const daysInRange = range ? Math.max(1, Math.ceil((+range.to - +range.from) / DAY_MS) + 1) : 0
  const liveSlots = slots.size * daysInRange

  const toggleWindow = (w: string) =>
    setSlots((prev) => {
      const next = new Set(prev)
      if (next.has(w)) next.delete(w)
      else next.add(w)
      return next
    })

  const savePrice = async (v: string) => {
    const num = Number(v.replace(/\s/g, ""))
    if (!isFinite(num) || num <= 0) throw new Error("not a price")
    setPrice(Math.round(num))
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded-xl border bg-background font-sans text-foreground", className)}>
      {/* editorial masthead — the address is the title */}
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-[21px] font-bold leading-none tracking-[-0.02em]">{address}</h2>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{mls} · 4 bed · {area} m²</span>
          </div>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Camera className="size-3.5" aria-hidden /> {pins.length} pin note{pins.length === 1 ? "" : "s"} on the board · {pendingUploads} media item{pendingUploads === 1 ? "" : "s"} pending
          </p>
        </div>
        <Button onClick={() => { setPublished({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }); onPublished?.() }} disabled={!!published || pendingUploads > 0}>
          <Send className="size-3.5" />
          {published ? `Published · ${published.at}` : "Publish listing"}
        </Button>
      </header>

      <AnimatePresence>
        {!published && pendingUploads > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="shrink-0 border-y bg-[hsl(var(--warn)/0.08)] px-6 py-1.5 text-[11px] text-[hsl(var(--warn))]">
            {pendingUploads} media item{pendingUploads === 1 ? "" : "s"} still pending — publishing is held until the set is complete.
          </motion.p>
        )}
      </AnimatePresence>

      {/* hero — the photo board owns the full bleed */}
      <div className="relative border-b">
        <AnnotationPinLayer
          author="S. Marek"
          pins={pins}
          onAddPin={(p: { x: number; y: number }) => setPins((ps) => [...ps, { id: "p" + String(Date.now()), x: p.x, y: p.y, author: "S. Marek", text: "New note — describe the fix." }])}
          onRemove={(id: string) => setPins((ps) => ps.filter((p) => p.id !== id))}
          canvas={
            <div className="relative aspect-[16/9] max-h-[380px] w-full overflow-hidden bg-gradient-to-br from-accent via-secondary to-primary/40 sm:aspect-[21/9]">
              <Dots className="text-background/70" />
              <CornerTicks className="text-background/80" />
              <span className="absolute left-3 top-3 rounded border bg-background/85 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Photography · {pins.length} pin{pins.length === 1 ? "" : "s"}
              </span>
              <span className="absolute bottom-3 left-3 rounded border bg-background/85 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">IMG_0231 · kitchen, south light</span>
            </div>
          }
        />
      </div>

      {/* open-house chips rail — date window + time-window chips */}
      <section className="border-b bg-muted/20 px-6 py-3" aria-label="Open house windows">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
          <div className="flex items-center gap-2">
            <MonoLabel className="text-muted-foreground" tick={false}>Open house</MonoLabel>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[hsl(var(--info))]">
              <CalendarCheck className="size-3.5" aria-hidden /> {liveSlots} slot{liveSlots === 1 ? "" : "s"} live
            </span>
          </div>
          <DateRangePresets
            value={range}
            onChange={setRange}
            presets={[
              { label: "This weekend", days: 2 },
              { label: "Next 7 days", days: 7 },
              { label: "Next 14 days", days: 14 },
            ]}
          />
          <div role="group" aria-label="Daily time windows" className="flex flex-wrap items-center gap-1.5">
            {WINDOWS.map((w) => {
              const on = slots.has(w)
              return (
                <button
                  key={w}
                  onClick={() => toggleWindow(w)}
                  aria-pressed={on}
                  className={cn(
                    "h-7 rounded-full border px-3 font-mono text-[11px] font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--app-focus))] focus-visible:ring-offset-1",
                    on ? "border-primary bg-accent text-accent-foreground" : "bg-background text-muted-foreground hover:bg-muted/60"
                  )}
                >
                  {w}
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {range ? `${range.label ?? "window"} · ${daysInRange} day${daysInRange === 1 ? "" : "s"} × ${slots.size} window${slots.size === 1 ? "" : "s"}` : "pick a date window, then the daily times"} — goes live to the portal within 5 minutes · broker chat gets reminders.
          </p>
        </div>
      </section>

      {/* deck — comp ledger | media + facts | docked quota */}
      <div className="grid flex-1 grid-cols-1 gap-x-6 gap-y-5 px-6 py-5 lg:grid-cols-12">
        {/* comp ledger */}
        <section className="overflow-hidden rounded-lg border bg-card lg:col-span-4" aria-label="Price grid">
          <div className="flex items-baseline justify-between border-b px-4 pb-2 pt-3">
            <MonoLabel className="text-muted-foreground" tick={false}>Comp ledger</MonoLabel>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{COMPS.length} sold nearby</span>
          </div>
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="border-b text-left font-mono text-[10px] text-muted-foreground">
                <th className="px-4 py-1.5 font-semibold">Comp</th>
                <th className="w-10 px-2 py-1.5 text-right font-semibold">B</th>
                <th className="w-24 px-4 py-1.5 text-right font-semibold">Sold</th>
              </tr>
            </thead>
            <tbody>
              {COMPS.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-1.5">
                    <span className="font-medium">{c.address}</span>
                    <span className="block font-mono text-[10px] tabular-nums text-muted-foreground">{c.area} m² · {Math.round(c.sold / c.area).toLocaleString()} /m²</span>
                  </td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums">{c.beds}</td>
                  <td className="px-4 py-1.5 text-right font-mono tabular-nums">{c.sold.toLocaleString()}</td>
                </tr>
              ))}
              <tr className="bg-accent/40">
                <td className="px-4 py-2">
                  <span className="text-[13px] font-bold">{address}</span>
                  <span className="block font-mono text-[10px] tabular-nums text-muted-foreground">subject · {area} m²</span>
                </td>
                <td className="px-2 py-2 text-right font-mono tabular-nums">4</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end">
                    <InlineEditCell value={String(price)} name="list price" mono width={78} onSave={savePrice} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-baseline justify-between border-t px-4 py-2">
            <MonoLabel className="text-muted-foreground" tick={false}>kr / m²</MonoLabel>
            <motion.span key={ppm} initial={{ scale: 1.12, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} className="font-mono text-[13px] font-bold tabular-nums">{ppm.toLocaleString()}</motion.span>
          </div>
        </section>

        {/* media queue + facts */}
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5">
          <section aria-label="Media uploads">
            <div className="flex items-baseline justify-between">
              <MonoLabel className="text-muted-foreground" tick={false}>Media uploads</MonoLabel>
              <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{pendingUploads} pending</span>
            </div>
            <UploadQueue
              className="mt-2 rounded-none border-0 bg-transparent p-0 shadow-none"
              files={uploads}
              onRetry={() => setUploads((us) => us.map((u) => (u.status === "error" ? { ...u, status: "uploading", progress: 5, tries: (u.tries ?? 0) + 1, error: undefined } : u)))}
              onRemove={(id: string) => setUploads((us) => us.filter((u) => u.id !== id))}
            />
          </section>
          <section aria-label="Facts" className="mt-auto border-t pt-3">
            <MonoLabel className="text-muted-foreground">Facts</MonoLabel>
            <dl className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 text-[12px] sm:grid-cols-2">
              {[
                ["Living area", `${area} m²`],
                ["Plot", "640 m²"],
                ["Bathrooms", "2"],
                ["Energy", "C 194 kWh/m²"],
                ["Viewings booked", "6"],
                ["Next viewing", "sat 12:00"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-dashed py-1 last:border-0">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-mono tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* quota — docked flush against the deck's bottom rail */}
        <aside className="flex flex-col border-t pt-4 lg:col-span-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0" aria-label="Media quota">
          <div className="mt-auto">
            <MonoLabel className="text-muted-foreground" tick={false}>Media quota</MonoLabel>
            <StorageRingMeter
              className="mt-3"
              segments={[
                { label: "photos", bytes: 3_100_000_000, color: "hsl(var(--primary))" },
                { label: "video", bytes: 2_180_000_000, color: "hsl(var(--info))" },
                { label: "floorplan", bytes: 420_000_000, color: "hsl(var(--warn))" },
              ]}
              quota={8_000_000_000}
              label="mls storage"
              resetNote="Archive on sale resets the allocation."
            />
            <p className="mt-4 border-t border-dashed pt-2.5 text-[11px] leading-[1.5] text-muted-foreground">
              Publish stays held while the media set is incomplete — the queue above gates the masthead button.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
