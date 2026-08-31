import * as React from "react"
import { ArrowUpRight, Check, Smartphone } from "lucide-react"
import { Grain, MonoLabel } from "@/components/primitives/handcraft"
import { InView } from "@/components/primitives/in-view"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type StoreBadge = {
  label: string
  /** Small print under the label, e.g. "iOS 16+". */
  note?: string
  href?: string
}

export type AppDownloadProps = {
  eyebrow?: string
  title?: string
  titleHighlight?: string
  subtitle?: string
  /** Checklist under the copy. */
  features?: string[]
  stores?: StoreBadge[]
  /** QR caption, e.g. "Scan to install". Renders the QR card when set. */
  qrCaption?: string
  tone?: "paper" | "ink"
  className?: string
}

// ── AppDownload ──────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · JOB: get the app installed · EMOTION: eagerness.
// · SIGNATURE: a CSS-BUILT phone with a live mini-screen of the product (pure
//   tokens, zero assets) tilted at 4° like a pinned print, next to a QR stamp
//   card — the analog bridge: "point your camera here".
// · Store badges are proper buttons with small-print notes; the checklist
//   keeps to check glyphs. QR cells are deterministic so SSR never flickers.
export function AppDownload({
  eyebrow = "Mobile app",
  title = "The studio, in your pocket.",
  titleHighlight,
  subtitle = "Bookings, payments and reminders — synced in real time, wherever the day takes you.",
  features,
  stores,
  qrCaption = "Scan to install",
  tone = "paper",
  className,
}: AppDownloadProps) {
  const ink = tone === "ink"
  const list: StoreBadge[] = stores ?? [
    { label: "App Store", note: "iOS 16+" },
    { label: "Google Play", note: "Android 12+" },
  ]

  return (
    <section
      className={cn(ink && "bg-foreground", "relative isolate w-full overflow-hidden", className)}
      aria-label={title}
    >
      <Grain opacity={ink ? 0.06 : 0.04} />

      <div className="relative mx-auto grid w-full max-w-[1150px] items-center gap-16 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-10 lg:px-8">
        {/* copy */}
        <div>
          {eyebrow && <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>{eyebrow}</MonoLabel>}
          <h1
            className={cn(
              "mt-6 max-w-[15ch] font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[0.98] tracking-[-0.04em]",
              ink ? "text-background" : "text-foreground",
            )}
          >
            {title}
            {titleHighlight && (
              <TextEffect as="span" preset="slide" per="word" delay={0.2} className={cn("block", ink ? "text-background/55" : "text-muted-foreground")}>
                {titleHighlight}
              </TextEffect>
            )}
          </h1>
          {subtitle && (
            <InView
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-60px" }}
            >
              <p className={cn("mt-6 max-w-[46ch] text-[15px] leading-[1.75]", ink ? "text-background/60" : "text-muted-foreground")}>
                {subtitle}
              </p>
            </InView>
          )}

          {(features ?? ["Offline booking history", "Push reminders for clients", "Face ID-secured payments"]).length > 0 && (
            <InView
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              viewOptions={{ once: true, margin: "-60px" }}
            >
              <ul className="mt-7 flex flex-col gap-2.5">
                {(features ?? ["Offline booking history", "Push reminders for clients", "Face ID-secured payments"]).map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                        ink ? "bg-background/10 text-background" : "bg-secondary text-foreground",
                      )}
                    >
                      <Check className="size-3" aria-hidden />
                    </span>
                    <span className={cn("text-sm font-medium", ink ? "text-background/80" : "text-foreground")}>{f}</span>
                  </li>
                ))}
              </ul>
            </InView>
          )}

          {/* store badges */}
          <InView
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true, margin: "-60px" }}
          >
            <div className="mt-9 flex flex-wrap items-center gap-3">
              {list.map((s) => (
                <Button
                  key={s.label}
                  size="lg"
                  asChild={Boolean(s.href)}
                  className={cn(
                    "group h-auto flex-col items-start gap-0 rounded-xl px-5 py-2.5 text-left shadow-sm transition-all hover:border-foreground/10",
                    ink
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90",
                  )}
                >
                  {s.href ? (
                    <a href={s.href} className="inline-flex items-center gap-2.5">
                      <Smartphone className="size-5 shrink-0 opacity-80" aria-hidden />
                      <span>
                        <span className="block text-sm font-bold leading-tight">{s.label}</span>
                        {s.note && <span className="block text-[10px] font-medium leading-tight opacity-60">{s.note}</span>}
                      </span>
                      <ArrowUpRight className="size-3.5 opacity-0 transition-all duration-300 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2.5">
                      <Smartphone className="size-5 shrink-0 opacity-80" aria-hidden />
                      <span>
                        <span className="block text-sm font-bold leading-tight">{s.label}</span>
                        {s.note && <span className="block text-[10px] font-medium leading-tight opacity-60">{s.note}</span>}
                      </span>
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </InView>
        </div>

        {/* the visual: phone + QR stamp */}
        <InView
          variants={{ hidden: { opacity: 0, y: 32, rotate: 3 }, visible: { opacity: 1, y: 0, rotate: 0 } }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          viewOptions={{ once: true, margin: "-80px" }}
        >
          <div className="group relative mx-auto flex max-w-[400px] items-center justify-center gap-7">
            {/* phone — CSS-built, zero assets */}
            <div
              className={cn(
                "relative w-[218px] rotate-[4deg] rounded-[2.2rem] border p-2.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-[1deg] motion-reduce:transition-none",
                ink ? "border-background/25 bg-background/[0.04]" : "border-border bg-card shadow-[0_48px_80px_-40px_hsl(0_0%_0%/0.35)]",
              )}
            >
              <div className={cn("relative aspect-[9/18] overflow-hidden rounded-[1.6rem]", ink ? "bg-background/10" : "bg-secondary/70")}>
                {/* notch */}
                <span aria-hidden className={cn("absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full", ink ? "bg-foreground/40" : "bg-foreground/80")} />
                {/* mini app screen */}
                <div className="flex h-full flex-col px-3 pb-3 pt-9">
                  <div className={cn("h-2.5 w-2/3 rounded-full", ink ? "bg-background/60" : "bg-foreground/80")} />
                  <div className={cn("mt-1.5 h-2 w-1/2 rounded-full", ink ? "bg-background/25" : "bg-foreground/25")} />
                  <div className={cn("mt-4 flex-1 rounded-xl border p-2.5", ink ? "border-background/15 bg-background/[0.06]" : "border-border bg-background")}>
                    <div className="flex items-center justify-between">
                      <span className={cn("h-2 w-10 rounded-full", ink ? "bg-background/40" : "bg-foreground/30")} />
                      <span className={cn("h-2 w-6 rounded-full", ink ? "bg-background/20" : "bg-foreground/15")} />
                    </div>
                    <div className="mt-2.5 flex items-end gap-1" aria-hidden>
                      {[38, 62, 45, 80, 58, 92, 70].map((h, i) => (
                        <span
                          key={i}
                          className={cn("w-full rounded-t-[2px]", ink ? "bg-background/55" : "bg-foreground/75")}
                          style={{ height: `${h * 0.5}px` }}
                        />
                      ))}
                    </div>
                    <div className={cn("mt-3 h-6 rounded-md", ink ? "bg-background" : "bg-foreground")} />
                  </div>
                  <div className={cn("mt-3 flex-1 rounded-xl border p-2.5", ink ? "border-background/15 bg-background/[0.06]" : "border-border bg-background")}>
                    <div className={cn("h-2 w-3/4 rounded-full", ink ? "bg-background/40" : "bg-foreground/25")} />
                    <div className={cn("mt-2 h-2 w-1/2 rounded-full", ink ? "bg-background/20" : "bg-foreground/15")} />
                  </div>
                </div>
              </div>
            </div>

            {/* QR stamp card — always reads as a paper sticker */}
            <div
              className={cn(
                "absolute -bottom-2 right-0 rotate-[-3deg] rounded-2xl border p-3.5 text-foreground backdrop-blur transition-transform duration-500 group-hover:rotate-0 motion-reduce:transition-none sm:static",
                ink ? "border-background/20 bg-background" : "border-border bg-card shadow-[0_24px_48px_-24px_hsl(0_0%_0%/0.3)]",
              )}
            >
              <QrCells />
              {qrCaption && (
                <p className="mt-2.5 text-center font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {qrCaption}
                </p>
              )}
            </div>
          </div>
        </InView>
      </div>
    </section>
  )
}

// deterministic QR-ish cells — stable between server and client, tinted by currentColor
function QrCells() {
  const cells = React.useMemo(() => {
    let h = 2026
    const out: boolean[] = []
    for (let i = 0; i < 81; i++) {
      h = (h * 1103515245 + 12345) >>> 0
      out.push(h % 100 > 48)
    }
    return out
  }, [])

  return (
    <div aria-hidden className="relative grid size-[79px] grid-cols-9 gap-[2px] p-[6px]">
      {cells.map((on, i) => (
        <span key={i} className={cn("size-[7px] rounded-[1px]", on ? "bg-current" : "bg-transparent")} />
      ))}
      {/* finder squares */}
      <span className="absolute left-0 top-0 size-[25px] rounded-[3px] border-4 border-current bg-transparent">
        <span className="absolute inset-[4px] rounded-[1px] bg-current" />
      </span>
      <span className="absolute right-0 top-0 size-[25px] rounded-[3px] border-4 border-current bg-transparent">
        <span className="absolute inset-[4px] rounded-[1px] bg-current" />
      </span>
      <span className="absolute bottom-0 left-0 size-[25px] rounded-[3px] border-4 border-current bg-transparent">
        <span className="absolute inset-[4px] rounded-[1px] bg-current" />
      </span>
    </div>
  )
}
