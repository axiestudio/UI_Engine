import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { KeyRound, PackageOpen, Printer } from "lucide-react"
import { cn } from "@/lib/utils"
import { MonoLabel, Grain, Ordinal } from "@/components/primitives/handcraft"
import { SegmentedControl } from "segmented-control"
import { TabsOverflowStrip, type AppTab } from "tabs-overflow-strip"
import { AnnotationPinLayer, type Pin } from "annotation-pin-layer"
import { UploadQueue, type UploadFile } from "upload-queue"
import { CopySecretField } from "copy-secret-field"

// COMPOSITE SCREEN · EXHIBITION TOOLING
// composed of: segmented-control (collection), tabs-overflow-strip (rooms),
// annotation-pin-layer (label pins on a wall mock), upload-queue (artefact
// scans), copy-secret-field (embed keys) + purpose-built gallery wall.
//
// DESIGN BAR: header strip ≤48px · labels 11px semibold uppercase 12% tracking
// · body 13px · numerics 12px mono tabular right · panels rounded-lg with 36px
// header strips · motion marks state changes only.

export type WallWork = { id: string; title: string; artist: string; year: number; medium: string; width: number; height: number }

export type CuratorDeskProps = {
  exhibition?: string
  onPrintLabels?: (count: number) => void
  className?: string
}

type Collection = { id: string; label: string; rooms: AppTab[] }

const COLLECTIONS: Collection[] = [
  {
    id: "nm", label: "Nordic modernism",
    rooms: [
      { id: "r1", label: "Room 1 · Breakthrough", pinned: true },
      { id: "r2", label: "Room 2 · War years" },
      { id: "r3", label: "Room 3 · Late work", pinned: true },
    ],
  },
  { id: "cer", label: "Ceramics", rooms: [{ id: "r4", label: "Room 4 · Studio potters" }] },
  { id: "ph", label: "Photography", rooms: [{ id: "r5", label: "Room 5 · Contact prints" }, { id: "r6", label: "Room 6 · New topographics" }] },
]

const WORKS: Record<string, WallWork[]> = {
  r1: [
    { id: "w1", title: "Fågel blå", artist: "S. Derkert", year: 1934, medium: "etching", width: 20, height: 150 },
    { id: "w2", title: "Komposition nr 4", artist: "O. Hultén", year: 1937, medium: "oil on board", width: 26, height: 190 },
    { id: "w3", title: "Hamnstudie", artist: "A. Breda", year: 1932, medium: "lithograph", width: 18, height: 120 },
  ],
  r2: [
    { id: "w4", title: "Svart år", artist: "G. Nordenswan", year: 1943, medium: "ink", width: 22, height: 170 },
    { id: "w5", title: "Brev hem", artist: "S. Derkert", year: 1944, medium: "charcoal", width: 24, height: 140 },
  ],
  r3: [
    { id: "w6", title: "Vit relief", artist: "E. Ilves", year: 1961, medium: "plaster", width: 28, height: 180 },
    { id: "w7", title: "Sena linjer", artist: "O. Hultén", year: 1959, medium: "gouache", width: 20, height: 130 },
    { id: "w8", title: "Fönster, mars", artist: "A. Breda", year: 1963, medium: "watercolour", width: 16, height: 110 },
  ],
  r4: [{ id: "w9", title: "Tonnkärl", artist: "W. Kåge", year: 1949, medium: "stoneware", width: 30, height: 200 }],
  r5: [
    { id: "w10", title: "Kontakt 36 exp", artist: "I. Morath", year: 1955, medium: "gelatin silver", width: 24, height: 160 },
    { id: "w11", title: "Handel, natt", artist: "T. Berglund", year: 1958, medium: "bromoil", width: 20, height: 140 },
  ],
  r6: [{ id: "w12", title: "E4 norrut", artist: "T. Berglund", year: 1969, medium: "chromogenic print", width: 32, height: 210 }],
}

const INITIAL_PINS: Pin[] = [
  { id: "p1", x: 0.24, y: 0.72, author: "label · RM-104", text: "Siri Derkert — Fågel blå, 1934 · etching · 42×56 cm · lender: Moderna samlingen" },
  { id: "p2", x: 0.55, y: 0.68, author: "label · RM-105", text: "Otto Hultén — Komposition nr 4, 1937 · oil on board · not yet proofread" },
]

const INITIAL_FILES: UploadFile[] = [
  { id: "u1", name: "condition-report-1934.pdf", size: 412_000, status: "done", progress: 100 },
  { id: "u2", name: "highres-etching-42mp.tiff", size: 88_400_000, status: "uploading", progress: 23 },
  { id: "u3", name: "loan-agreement-signed.pdf", size: 1_020_000, status: "waiting" },
]

export function CuratorDesk({ exhibition = "New light · autumn hang", onPrintLabels, className }: CuratorDeskProps) {
  const [collectionId, setCollectionId] = React.useState("nm")
  const [room, setRoom] = React.useState("r1")
  const [pins, setPins] = React.useState(INITIAL_PINS)
  const [files, setFiles] = React.useState<UploadFile[]>(INITIAL_FILES)
  const [keyValue, setKeyValue] = React.useState("EMB-NM26-x9K4-QT7")
  const [rotating, setRotating] = React.useState(false)
  const [printBatch, setPrintBatch] = React.useState(0)

  const collection = COLLECTIONS.find((c) => c.id === collectionId) ?? COLLECTIONS[0]
  const works = WORKS[room] ?? []

  const switchCollection = (id: string) => {
    setCollectionId(id)
    const c = COLLECTIONS.find((x) => x.id === id)
    if (c && !c.rooms.some((r) => r.id === room)) setRoom(c.rooms[0].id)
  }

  const rotate = () => {
    if (rotating) return
    setRotating(true)
    window.setTimeout(() => {
      setKeyValue(`EMB-${collectionId.toUpperCase()}26-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`)
      setRotating(false)
    }, 1100)
  }

  const printLabels = () => {
    const n = pins.length
    setPrintBatch((b) => b + n)
    onPrintLabels?.(n)
  }

  return (
    <div className={cn("relative isolate flex min-h-[540px] flex-col overflow-hidden rounded-xl border bg-muted/20 font-sans text-foreground", className)}>
      <Grain opacity={0.03} />

      <header className="flex h-12 shrink-0 items-center gap-3 border-b bg-background px-4">
        <h2 className="text-[13px] font-bold">Curator desk</h2>
        <span className="text-[12px] text-muted-foreground">{exhibition}</span>
        <span className="text-[12px] text-muted-foreground">· {printBatch} labels printed today</span>
        <div className="ml-auto"><SegmentedControl size="sm" value={collectionId} onChange={switchCollection} options={COLLECTIONS.map((c) => ({ value: c.id, label: c.label }))} /></div>
        <button onClick={printLabels} className="flex h-8 items-center gap-1.5 rounded-md border bg-background px-3 text-[11px] font-semibold hover:bg-muted"><Printer className="size-3.5" /> Print labels ({pins.length})</button>
      </header>

      <div className="shrink-0 border-b bg-background px-4 py-2">
        <TabsOverflowStrip tabs={collection.rooms} value={room} onChange={setRoom} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* wall mock with label pins */}
        <section className="min-h-0 overflow-hidden rounded-lg border bg-card">
          <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Wall mock · {collection.label}</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{works.length} works · {pins.length} label pins</span>
          </header>
          <AnnotationPinLayer
            className="h-full min-h-[300px]"
            pins={pins}
            onRemove={(id) => setPins((ps) => ps.filter((p) => p.id !== id))}
            onAddPin={({ x, y }) => setPins((ps) => [...ps, { id: "p" + Date.now(), x, y, author: "label · draft", text: "New label draft — fill artist, title, year, medium, lender" }])}
            canvas={
              <div className="relative h-full min-h-[300px] w-full overflow-hidden bg-[hsl(40_30%_94%)]">
                <div aria-hidden className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,hsl(var(--foreground))_0.5px,transparent_0)] [background-size:9px_9px]" />
                <div aria-hidden className="absolute bottom-0 left-1/2 h-14 w-2/3 -translate-x-1/2 rounded-sm bg-[hsl(40_18%_82%)] shadow-[inset_0_6px_0_hsl(40_18%_74%)]" />
                <div className="absolute inset-x-0 bottom-14 flex items-end justify-center gap-8 px-10">
                  <AnimatePresence initial={false}>
                    {works.map((w, i) => (
                      <motion.figure key={w.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col items-center gap-2" style={{ width: `${w.width}%`, maxWidth: 220 }}>
                        <div className="w-full border-[6px] border-[hsl(35_25%_78%)] bg-background p-1.5 shadow-md" style={{ height: w.height }}>
                          <div className={cn("h-full w-full", w.year % 2 ? "bg-gradient-to-br from-[hsl(215_30%_30%)] to-[hsl(215_25%_55%)]" : "bg-gradient-to-tl from-[hsl(28_45%_50%)] to-[hsl(35_35%_72%)]")} />
                        </div>
                        <figcaption className="rounded-sm border bg-background px-1.5 py-0.5 text-center text-[9px] leading-tight text-muted-foreground shadow-sm">
                          <span className="font-semibold text-foreground">{w.artist}</span> · {w.title} ({w.year})
                        </figcaption>
                      </motion.figure>
                    ))}
                  </AnimatePresence>
                </div>
                <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">room {room.replace("r", "0")} · rail 148 cm</span>
              </div>
            }
          />
        </section>

        {/* right rail — artefacts + embed key */}
        <aside className="flex min-w-0 flex-col gap-4">
          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Artefact uploads</span>
              <PackageOpen className="size-3.5 text-muted-foreground" />
            </header>
            <div className="p-3">
              <UploadQueue files={files} onRetry={(id) => setFiles((fs) => fs.map((f) => (f.id === id ? { ...f, status: "uploading", progress: 0, error: undefined } : f)))} onRemove={(id) => setFiles((fs) => fs.filter((f) => f.id !== id))} />
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center justify-between border-b bg-muted/30 px-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Embed keys</span>
              <KeyRound className="size-3.5 text-muted-foreground" />
            </header>
            <div className="space-y-2.5 p-3">
              <CopySecretField value={keyValue} onRotate={rotate} rotating={rotating} label="public wing embed" mono />
              <p className="text-[11px] text-muted-foreground">Keys resolve to the read-only IIIF manifest. Rotating invalidates old embeds within 60 s.</p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border bg-card">
            <header className="flex h-9 items-center border-b bg-muted/30 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Hang checklist</header>
            <div className="grid gap-1.5 p-3 text-[12px]">
              {[
                ["Labels proofread", `${pins.filter((p) => !p.text.includes("draft") && !p.text.includes("not yet")).length}/${pins.length}`],
                ["Conditions cleared", `${files.filter((f) => f.status === "done").length}/${files.length}`],
                ["Lights patched", "2 / 3"],
              ].map(([k, v], i) => (
                <div key={k} className="flex items-center justify-between rounded-md border bg-background px-2.5 py-1.5">
                  <span className="flex items-center gap-2"><Ordinal n={i + 1} className="text-muted-foreground" /> {k}</span>
                  <span className="font-mono text-[12px] tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
