import * as React from "react"
import { ArrowRight, Locate, CalendarCheck, Vote, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type DistrictStat = {
  value: string
  label: string
}

export type DistrictMeeting = {
  title: string
  date: string
  kind?: "budget" | "zoning" | "townhall" | "school"
}

export type DistrictBallot = {
  title: string
  meta?: string
  count?: string
}

export type DistrictNavItem = {
  label: string
  href?: string
}

export type DistrictLegendItem = {
  label: string
  color?: "ink" | "red" | "blue" | "dot"
}

export type DistrictMapForwardProps = {
  county?: string
  brand?: string
  nav?: DistrictNavItem[]
  status?: string
  kicker?: string
  title?: React.ReactNode
  description?: React.ReactNode
  addressLabel?: string
  addressValue?: string
  addressHint?: string
  changeLabel?: string
  stats?: DistrictStat[]
  repName?: string
  repRole?: string
  meetingsLabel?: string
  meetings?: DistrictMeeting[]
  meetingsFootLink?: { label: string; href?: string }
  ballotLabel?: string
  ballot?: DistrictBallot[]
  mapLegend?: DistrictLegendItem[]
  mapLabel?: string
  youAreHere?: string
  className?: string
}

// ── Ward map (decorative, cartographic ledger) ───────────────────────────────
// Abstract district polygons arranged around a "you are here" marker.
const WARDS = [
  { label: "WARD 1", d: "M20 20 H270 L250 180 L40 160 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 2", d: "M285 20 H560 L540 200 L262 186 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 3", d: "M40 202 L250 196 L238 380 L20 372 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 4", d: "M262 202 L542 206 L520 402 L250 392 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 5", d: "M20 396 L236 384 L210 560 L30 556 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 6", d: "M252 398 L520 410 L502 585 L214 566 Z", fill: "hsl(var(--muted))", stroke: "hsl(var(--border))" },
  { label: "WARD 7", d: "M30 574 L206 562 L190 736 L26 730 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 8", d: "M218 578 L500 596 L486 748 L196 742 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WARD 9", d: "M508 210 L690 202 L676 410 L530 410 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
  { label: "WD 10", d: "M508 414 L676 416 L662 600 L506 592 Z", fill: "hsl(var(--card))", stroke: "hsl(var(--border))" },
]

function WardMap({
  youAreHere,
  mapLabel,
  legend,
}: {
  youAreHere?: string
  mapLabel?: string
  legend?: DistrictLegendItem[]
}) {
  const blue = "hsl(var(--district-blue))"
  return (
    <div className="relative flex h-full min-h-[360px] flex-col border-b-2 border-ink">
      <div aria-hidden className="relative flex-1 overflow-hidden">
        {/* faint graticule grid */}
        <span
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <svg viewBox="0 0 720 760" className="relative h-full w-full" role="img" aria-label={mapLabel ?? "District ward map"}>
          {WARDS.map((w) => (
            <path key={w.label} d={w.d} fill={w.fill} stroke={w.stroke} strokeWidth={1.5} />
          ))}
          {/* ward labels */}
          {WARDS.map((w) => (
            <text key={w.label} x={0} y={0} className="fill-foreground/70" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.08em">
              {w.label}
            </text>
          ))}
          {/* leadership markers */}
          {[
            [360, 300], [470, 500],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={20} fill="none" stroke={blue} strokeOpacity={0.5} strokeWidth={1} />
              <circle cx={x} cy={y} r={11} fill="none" stroke={blue} strokeWidth={1.5} />
              <circle cx={x} cy={y} r={4} fill={blue} />
            </g>
          ))}
          {/* you-are-here pin */}
          <g transform="translate(380 420)">
            <circle r={22} fill="hsl(var(--accent))" fillOpacity={0.18} />
            <circle r={13} fill="hsl(var(--accent))" />
            <circle r={5} fill="hsl(var(--card))" />
          </g>
          <text x={380} y={482} textAnchor="middle" className="fill-foreground/80" fontSize={11} fontFamily="var(--font-mono)" letterSpacing="0.08em" fontWeight={700}>
            {youAreHere ?? "YOU ARE HERE"}
          </text>
        </svg>
        <span aria-hidden className="absolute left-4 top-4 border border-ink/30 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {mapLabel ?? "CALDER COUNTY · ADMIN MAP"}
        </span>
      </div>
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/20 bg-card px-5 py-3">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              {l.color === "red" && <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--accent))" }} />}
              {l.color === "blue" && <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: blue }} />}
              {l.color === "ink" && <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: "hsl(var(--foreground))" }} />}
              {l.color === "dot" && <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-ink/60" />}
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── DistrictMapForward ───────────────────────────────────────────────────────

export function DistrictMapForward({
  county = "Calder County",
  brand = "District Compass",
  nav = [
    { label: "Districts" },
    { label: "Elections" },
    { label: "Census" },
    { label: "Boundaries" },
    { label: "Data" },
  ],
  status = "● Election in 142 days",
  kicker = "Look up your district",
  title = "What’s happening on your street, in plain sight.",
  description = "Type your address — see your council member, polling place, school zone, capital projects within ¼ mile, and every public meeting on your block.",
  addressLabel = "Your address",
  addressValue = "411 Bauer St, Ward 6",
  addressHint = "Use an address or parcel code",
  changeLabel = "Change",
  stats = [
    { value: "Ward 6", label: "Council district" },
    { value: "P-411", label: "Polling place" },
    { value: "72.4%", label: "2024 turnout" },
    { value: "$8.4M", label: "Capital here" },
  ],
  repName = "Anya Iqbal",
  repRole = "Council, Ward 6 · since 2023",
  meetingsLabel = "Public meetings · Ward 6",
  meetings = [
    { title: "Budget hearing", date: "Jun 03", kind: "budget" },
    { title: "Zoning · 14th & Bauer", date: "Jun 10", kind: "zoning" },
    { title: "Town hall (in person)", date: "Jun 17", kind: "townhall" },
    { title: "School board", date: "Jun 24", kind: "school" },
  ],
  meetingsFootLink = { label: "All meetings ↗", href: "#" },
  ballotLabel = "On the ballot in Nov",
  ballot = [
    { title: "Council, Ward 6", count: "2 cand.", meta: "at-large" },
    { title: "School board", count: "4 cand." },
    { title: "Bond measure A", count: "$ 240M", meta: "capital" },
  ],
  mapLabel,
  mapLegend = [
    { label: "Contested seat", color: "dot" },
    { label: "You are here", color: "red" },
    { label: "Capital project", color: "blue" },
  ],
  youAreHere,
  className,
}: DistrictMapForwardProps) {
  return (
    <div className={cn("group w-full overflow-hidden border-2 bg-background text-foreground", className)}>
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b-2 bg-card px-6 py-4 lg:px-10">
        <div className="inline-flex items-center gap-3">
          <span aria-hidden className="relative inline-flex size-[26px] items-center justify-center rounded-full border-2 border-ink">
            <span className="size-2 rounded-full" style={{ background: "hsl(var(--accent))" }} />
          </span>
          <span className="font-display text-[18px] font-extrabold tracking-[-0.01em]">
            {brand} <span className="text-distmuted">· {county}</span>
          </span>
        </div>
        <nav className="hidden items-center gap-6 md:flex" aria-label="District navigator">
          {nav.map((n) => (
            <a
              key={n.label}
              href={n.href ?? "#"}
              className="font-mono text-[12.5px] font-medium uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <span className="inline-flex items-center font-mono text-[12px] font-medium uppercase tracking-[0.1em]" style={{ color: "hsl(var(--accent))" }}>
          {status}
        </span>
      </div>

      {/* 3-column ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_280px] lg:items-stretch">
        {/* LEFT — intro + address + stats */}
        <div className="flex flex-col gap-6 border-b-2 p-6 lg:border-b-0 lg:border-r-2 lg:p-7">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground" style={{ color: "hsl(var(--accent))" }}>
              {kicker}
            </p>
            <h1 className="mt-3 font-display text-[32px] font-extrabold leading-[0.96] tracking-[-0.03em] sm:text-[40px] lg:text-[44px]">
              {title}
            </h1>
            <p className="mt-4 text-[14px] font-medium leading-[1.7] text-muted-foreground">{description}</p>
          </div>

          {/* address field */}
          <div className="flex items-center justify-between gap-4 border border-ink/70 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-distmuted">{addressLabel}</p>
              <p className="mt-0.5 truncate text-[18px] font-bold text-foreground">{addressValue}</p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 border border-ink/70 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              <Locate className="size-3.5" /> {changeLabel}
            </button>
          </div>
          {addressHint && (
            <p className="-mt-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground/80">{addressHint}</p>
          )}

          {/* stat tiles */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="border border-ink/50 bg-card p-4">
                <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.02em]">{s.value}</p>
                <p className="mt-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.11em] text-distmuted">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="mt-auto pt-2 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-distmuted">
            Data refreshed <span className="text-foreground">daily</span> · 08:00
          </p>
        </div>

        {/* CENTER — map */}
        <div className="order-last lg:order-none lg:col-span-1">
          <WardMap youAreHere={youAreHere} mapLabel={mapLabel} legend={mapLegend} />
        </div>

        {/* RIGHT — rep, meetings, ballot */}
        <div className="flex flex-col gap-6 border-t-2 bg-card p-6 lg:border-l-2 lg:border-t-0 lg:p-7">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground" style={{ color: "hsl(var(--accent))" }}>
              Your representative
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span aria-hidden className="inline-flex size-10 items-center justify-center rounded-full border border-ink/60 bg-secondary font-display text-[13px] font-extrabold">
                {repName.split(/\s+/).map((p) => p[0]).join("").slice(0, 2)}
              </span>
              <div>
                <p className="font-display text-[16px] font-bold leading-tight">{repName}</p>
                <p className="mt-0.5 text-[12px] font-medium text-distmuted">{repRole}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <CalendarCheck className="size-3.5" /> {meetingsLabel}
            </p>
            <ul className="mt-3 border-t border-ink/40">
              {meetings.map((m) => (
                <li key={m.title} className="flex items-center justify-between gap-3 border-b border-ink/40 py-2.5">
                  <span className="text-[13.5px] font-medium">{m.title}</span>
                  <span className="font-mono text-[11.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{m.date}</span>
                </li>
              ))}
            </ul>
            {meetingsFootLink && (
              <a href={meetingsFootLink.href ?? "#"} className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-foreground hover:opacity-70">
                {meetingsFootLink.label}
              </a>
            )}
          </div>

          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <Vote className="size-3.5" /> {ballotLabel}
            </p>
            <ul className="mt-3 space-y-2.5">
              {ballot.map((b) => (
                <li key={b.title} className="flex items-center justify-between gap-3 font-mono text-[11.5px] uppercase tracking-[0.06em]">
                  <span className="text-muted-foreground">
                    {b.title} {b.meta && <span className="opacity-60">· {b.meta}</span>}
                  </span>
                  {b.count && <span className="font-bold text-foreground">{b.count}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto flex items-center gap-3 border border-ink/50 px-4 py-3">
            <Landmark className="size-4 shrink-0 text-foreground" />
            <p className="text-[12.5px] font-medium leading-snug text-muted-foreground">
              Contested seats update nightly. <span className="text-foreground">14 of 35</span> up this cycle.
            </p>
            <ArrowRight className="ml-auto size-4 shrink-0 text-foreground/70" />
          </div>
        </div>
      </div>
    </div>
  )
}
