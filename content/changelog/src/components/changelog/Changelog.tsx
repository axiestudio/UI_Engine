import * as React from "react"
import { Info, Sparkles, TrendingUp, Wrench, Zap, type LucideIcon } from "lucide-react"
import { Grain, Ordinal, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { TextShimmer } from "@/components/primitives/text-shimmer"
import { InView } from "@/components/primitives/in-view"
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
// Design decisions (hand-tuned):
// · A real timeline rail: nodes are square ticks (rotate-45) that fill for the
//   latest release and stay hollow for history — hierarchy you can scan.
// · Changes render as a LEDGER: hairline rows, mono type-tags right-aligned.
//   Scannability beats decoration in a changelog.
// · "Latest" is TextShimmer — the only animated text on the page, so it earns
//   the attention it gets.

const CHANGE_META: Record<ChangeType, { icon: LucideIcon; label: string }> = {
  feature: { icon: Sparkles, label: "New" },
  improvement: { icon: TrendingUp, label: "Improved" },
  fix: { icon: Wrench, label: "Fixed" },
  breaking: { icon: Zap, label: "Breaking" },
  note: { icon: Info, label: "Note" },
}

function ReleaseEntry({ release, index, total, tone, latest }: { release: Release; index: number; total: number; tone: "paper" | "ink"; latest: boolean }) {
  const ink = tone === "ink"
  return (
    <InView
      variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }}
      viewOptions={{ once: true, margin: "-60px" }}
    >
      <article id={release.id} className="relative grid gap-5 sm:grid-cols-[150px_1fr] sm:gap-10">
        {/* meta column */}
        <div className="flex items-baseline gap-3 sm:flex-col sm:items-end sm:gap-1.5 sm:pt-1 sm:text-right">
          <p className={cn("font-mono text-sm font-bold tracking-tight", ink ? "text-background" : "text-foreground")}>
            {release.version}
          </p>
          <p className={cn("font-mono text-[11px] font-medium uppercase tracking-[0.14em]", ink ? "text-background/45" : "text-muted-foreground")}>
            {release.date}
          </p>
        </div>

        {/* node on the rail */}
        <span
          aria-hidden
          className={cn(
            "absolute left-[-3.5px] top-2 hidden size-[7px] rotate-45 sm:block",
            latest
              ? ink
                ? "bg-background"
                : "bg-foreground"
              : ink
                ? "border border-background/40 bg-transparent"
                : "border border-foreground/40 bg-background",
          )}
        />

        <div
          className={cn(
            "group relative overflow-hidden border p-6 sm:p-8",
            ink ? "border-background/10 bg-transparent hover:bg-background/[0.04]" : "border-border bg-card hover:shadow-[0_1px_0_rgba(0,0,0,0.06)]",
            "transition-all duration-500",
          )}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h3 className={cn("font-display text-xl font-bold tracking-[-0.02em]", ink ? "text-background" : "text-foreground")}>
              {release.title}
            </h3>
            {latest && (
              <TextShimmer duration={2.6} className={cn("font-mono text-[10px] font-bold uppercase tracking-[0.22em]", ink ? "text-background/80" : "text-foreground/80")}>
                ● Latest
              </TextShimmer>
            )}
            <Ordinal n={total - index} className={cn("ml-auto", ink ? "text-background/35" : "text-muted-foreground/60")} />
          </div>

          <ul className={cn("mt-5 flex flex-col border-t", ink ? "border-background/10" : "border-border")}>
            {release.changes.map((change, i) => {
              const meta = CHANGE_META[change.type]
              const Icon = meta.icon
              return (
                <li
                  key={i}
                  className={cn("flex items-start gap-3 border-b py-3", ink ? "border-background/10" : "border-border/70")}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-[4px]",
                      change.type === "breaking"
                        ? "bg-destructive/15 text-destructive"
                        : ink
                          ? "bg-background/10 text-background/75"
                          : "bg-secondary text-foreground",
                    )}
                  >
                    <Icon className="size-3" strokeWidth={2.5} />
                  </span>
                  <p className={cn("flex-1 text-sm font-medium leading-[1.65]", ink ? "text-background/80" : "text-foreground")}>
                    {change.text}
                  </p>
                  <span className={cn("hidden pt-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] sm:block", ink ? "text-background/30" : "text-muted-foreground/50")}>
                    {meta.label}
                  </span>
                </li>
              )
            })}
          </ul>

          {release.link && (
            <a
              href={release.link.href}
              className={cn(
                "group/link mt-5 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em]",
                ink ? "text-background" : "text-foreground",
              )}
            >
              {release.link.label}
              <span aria-hidden className="transition-transform duration-300 group-hover/link:translate-x-1">→</span>
            </a>
          )}
        </div>
      </article>
    </InView>
  )
}

// ── Changelog ────────────────────────────────────────────────────────────────

export function Changelog({
  eyebrow = "Changelog",
  title = "Shipped, weekly",
  subtitle = "Every improvement lands here first — what changed, why it matters, and what broke on the way.",
  releases,
  tone = "paper",
  subscribe,
  className,
}: ChangelogProps) {
  if (!releases.length) return null
  const ink = tone === "ink"

  return (
    <SectionShell tone={tone} width={920} rails padding="roomy" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} index="03" tone={tone} />
        {subscribe && (
          <Button
            asChild
            variant="outline"
            className={cn(
              "mb-1 rounded-none border font-mono text-[11px] font-bold uppercase tracking-[0.18em]",
              ink ? "border-background/30 bg-transparent text-background hover:bg-background/10 hover:text-background" : "border-foreground/30 bg-transparent text-foreground hover:bg-secondary",
            )}
          >
            <a href={subscribe.href}>{subscribe.label}</a>
          </Button>
        )}
      </div>

      {/* the rail */}
      <div className="relative mt-14">
        <span
          aria-hidden
          className={cn("absolute inset-y-0 left-[-1px] hidden w-px sm:block", ink ? "bg-background/15" : "bg-border")}
        />
        <div className="flex flex-col gap-10 sm:gap-12">
          {releases.map((release, i) => (
            <ReleaseEntry key={release.id ?? release.version} release={release} index={i} total={releases.length} tone={tone} latest={i === 0} />
          ))}
        </div>
      </div>

      {/* ledger sign-off */}
      <div className={cn("mt-16 flex items-center gap-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em]", ink ? "text-background/40" : "text-muted-foreground/60")}>
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
        end of log
        <span className="h-px flex-1 border-t border-dashed border-current opacity-50" />
      </div>
    </SectionShell>
  )
}
