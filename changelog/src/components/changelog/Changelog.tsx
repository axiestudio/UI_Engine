import * as React from "react"
import { Info, Sparkles, TrendingUp, Wrench, Zap, type LucideIcon } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { BorderTrail } from "@/components/primitives/border-trail"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ChangeType = "feature" | "improvement" | "fix" | "breaking" | "note"

export type ChangeEntry = {
  type: ChangeType
  text: string
}

export type Release = {
  version: string
  /** Display date, e.g. "Aug 28, 2026". */
  date: string
  title: string
  changes: ChangeEntry[]
  link?: { label: string; href: string }
  id?: string
}

export type ChangelogProps = {
  eyebrow?: string
  title?: string
  subtitle?: string
  releases: Release[]
  tone?: "paper" | "ink"
  subscribe?: { label: string; href: string }
  className?: string
}

// ── Sub components ───────────────────────────────────────────────────────────

const CHANGE_META: Record<ChangeType, { icon: LucideIcon; label: string }> = {
  feature: { icon: Sparkles, label: "New" },
  improvement: { icon: TrendingUp, label: "Improved" },
  fix: { icon: Wrench, label: "Fixed" },
  breaking: { icon: Zap, label: "Breaking" },
  note: { icon: Info, label: "Note" },
}

function ReleaseEntry({ release, index, tone, latest }: { release: Release; index: number; tone: "paper" | "ink"; latest: boolean }) {
  const ink = tone === "ink"
  return (
    <InView
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.24), ease: [0.16, 1, 0.3, 1] }}
      viewOptions={{ once: true, margin: "-60px" }}
    >
      <article id={release.id} className="grid gap-4 sm:grid-cols-[132px_1fr] sm:gap-8">
        <div className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-1.5 sm:border-r sm:pr-6 sm:text-right"
          style={undefined}
        >
          <p className={cn("font-mono text-sm font-bold tracking-tight", ink ? "text-background" : "text-foreground")}>
            {release.version}
          </p>
          <p className={cn("text-xs font-medium", ink ? "text-background/50" : "text-muted-foreground")}>{release.date}</p>
        </div>

        <div
          className={cn(
            "group relative overflow-hidden rounded-[24px] border p-6 sm:p-8",
            ink ? "border-background/15 bg-transparent" : "border-border bg-card shadow-sm",
          )}
        >
          {latest && <BorderTrail size={40} className={cn(ink ? "bg-background" : "bg-foreground")} />}
          <div className="flex flex-wrap items-center gap-3">
            <h3 className={cn("font-display text-xl font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
              {release.title}
            </h3>
            {latest && (
              <Badge className={cn("rounded-full px-2.5 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
                Latest
              </Badge>
            )}
          </div>

          <ul className="mt-5 flex flex-col gap-3">
            {release.changes.map((change, i) => {
              const meta = CHANGE_META[change.type]
              const Icon = meta.icon
              return (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                      change.type === "breaking"
                        ? "bg-destructive/15 text-destructive"
                        : ink
                          ? "bg-background/10 text-background/80"
                          : "bg-secondary text-foreground",
                    )}
                  >
                    <Icon className="size-3.5" strokeWidth={2.25} />
                  </span>
                  <p className={cn("text-sm font-medium leading-relaxed", ink ? "text-background/80" : "text-foreground")}>
                    {change.text}
                    <span className={cn("ml-2 font-mono text-[10px] font-bold uppercase tracking-widest", ink ? "text-background/40" : "text-muted-foreground/70")}>
                      {meta.label}
                    </span>
                  </p>
                </li>
              )
            })}
          </ul>

          {release.link && (
            <a
              href={release.link.href}
              className={cn(
                "mt-6 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline",
                ink ? "text-background" : "text-foreground",
              )}
            >
              {release.link.label}
              <span aria-hidden>→</span>
            </a>
          )}
        </div>
      </article>
    </InView>
  )
}

// ── Changelog ────────────────────────────────────────────────────────────────

export function Changelog({
  eyebrow,
  title = "Changelog",
  subtitle = "New updates and improvements. Shipped weekly.",
  releases,
  tone = "paper",
  subscribe,
  className,
}: ChangelogProps) {
  if (!releases.length) return null
  const ink = tone === "ink"

  return (
    <section className={cn(ink && "bg-foreground", "w-full", className)} aria-label={title}>
      <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <header className="mb-10 max-w-2xl sm:mb-16">
          {eyebrow && (
            <Badge
              variant="outline"
              className={cn(
                "mb-4 rounded-full border px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest",
                ink ? "border-background/25 bg-transparent text-background/80" : "bg-secondary text-muted-foreground",
              )}
            >
              {eyebrow}
            </Badge>
          )}
          <h2 className={cn("font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl", ink ? "text-background" : "text-foreground")}>
            {title}
          </h2>
          <p className={cn("mt-3 text-base font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
            {subtitle}
          </p>
          {subscribe && (
            <Button asChild variant={ink ? "outline" : "default"} size="sm" className={cn("mt-6", ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}>
              <a href={subscribe.href}>{subscribe.label}</a>
            </Button>
          )}
        </header>

        <div className="relative flex flex-col gap-10 sm:gap-12">
          {releases.map((release, i) => (
            <React.Fragment key={release.id ?? release.version}>
              {i > 0 && <div aria-hidden className={cn("h-px w-full sm:hidden", ink ? "bg-background/10" : "bg-border")} />}
              <ReleaseEntry release={release} index={i} tone={tone} latest={i === 0} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
