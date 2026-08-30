import * as React from "react"
import { Search } from "lucide-react"
import { Dots, Grain, MonoLabel } from "@/components/primitives/handcraft"
import { Spotlight } from "@/components/primitives/spotlight"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ErrorAction = {
  label: string
  href?: string
  onClick?: () => void
}

export type ErrorStateProps = {
  /** The oversized display code, e.g. "404". */
  code?: string
  title?: string
  description?: string
  primaryAction?: ErrorAction
  secondaryAction?: ErrorAction
  /** Quick links rendered under the actions. */
  links?: ErrorAction[]
  /** Show a site search field. */
  onSearch?: (query: string) => void
  searchPlaceholder?: string
  /** ink = dark full-bleed panel; paper = light. Default ink. */
  tone?: "paper" | "ink"
  /** Fill the viewport (min-h-svh) instead of a section band. Default true. */
  fullPage?: boolean
  className?: string
}

// ── ErrorState ───────────────────────────────────────────────────────────────
// Design decisions (hand-tuned):
// · Emotion: calm, a little wry. The page admits the mistake with a grainy,
//   almost-printed "code" plate and a mono coordinates strip that reads like
//   an incident report (status · page · time). Humor without jokes.
// · The code is outlined, slightly negative-tracked and clipped by the top
//   edge (translate-y) — it feels pinned to the top of the viewport.
// · Actions: one solid, one dotted-underline ghost — hierarchy without a
//   second heavy button.
export function ErrorState({
  code = "404",
  title = "This page went off-script.",
  description = "The page you are looking for was moved, removed, renamed, or never existed. Let's get you back on track.",
  primaryAction,
  secondaryAction,
  links,
  onSearch,
  searchPlaceholder = "Search the site…",
  tone = "ink",
  fullPage = true,
  className,
}: ErrorStateProps) {
  const ink = tone === "ink"
  const [query, setQuery] = React.useState("")

  return (
    <section
      className={cn(ink && "bg-foreground", fullPage ? "min-h-svh" : "w-full", "relative isolate flex w-full items-center justify-center overflow-hidden", className)}
      aria-label={`Error ${code}`}
    >
      <Grain opacity={ink ? 0.08 : 0.045} />
      <Dots size={22} className={cn("[mask-image:radial-gradient(ellipse_55%_45%_at_50%_60%,black_10%,transparent_75%)]", ink ? "text-background" : "text-foreground")} />
      {!ink && <Spotlight size={520} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.055),transparent_74%)] blur-2xl" />}

      <div className={cn("relative mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6", fullPage && "justify-center")}>
        {/* clipped code plate */}
        <div className="relative -mt-4 select-none sm:-mt-8" aria-hidden>
          <p
            className={cn(
              "font-display text-[130px] font-black leading-[0.8] tracking-[-0.07em] [-webkit-text-stroke:2px_currentColor] [color:transparent] sm:text-[210px] lg:text-[250px]",
              ink ? "text-background" : "text-foreground",
            )}
          >
            {code}
          </p>
          {/* punch-through highlight */}
          <span className={cn("absolute left-[18%] top-[24%] h-[7%] w-[30%] mix-blend-overlay", ink ? "bg-background" : "bg-foreground")} style={{ opacity: 0.25 }} />
        </div>
        <span className="sr-only">{`Error ${code}`}</span>

        {/* incident-report strip */}
        <div className={cn("mt-2 flex w-full max-w-md items-center justify-center gap-3 border-y py-2 font-mono text-[9px] font-bold uppercase tracking-[0.22em]", ink ? "border-background/15 text-background/40" : "border-border text-muted-foreground/70")}>
          <span>status {code}</span>
          <span aria-hidden className="opacity-50">·</span>
          <span>path lost</span>
          <span aria-hidden className="opacity-50">·</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        <div className="mt-8">
          <TextEffect
            as="h1"
            preset="blur"
            per="word"
            delay={0.1}
            className={cn("font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl", ink ? "text-background" : "text-foreground")}
          >
            {title}
          </TextEffect>
          <p className={cn("mx-auto mt-3 max-w-md text-sm font-medium leading-[1.75] sm:text-base", ink ? "text-background/60" : "text-muted-foreground")}>
            {description}
          </p>
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {primaryAction &&
              (primaryAction.href ? (
                <a
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                  className={cn(buttonVariants({ size: "lg" }), "group relative overflow-hidden rounded-none px-7 font-mono text-xs font-bold uppercase tracking-[0.18em]", ink && "bg-background text-foreground hover:bg-background/90")}
                >
                  <span className="relative z-10">{primaryAction.label}</span>
                  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-[110%] bg-[linear-gradient(105deg,transparent_40%,rgba(255,255,255,0.3)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-[110%]" />
                </a>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick} className={cn("rounded-none px-7 font-mono text-xs font-bold uppercase tracking-[0.18em]", ink && "bg-background text-foreground hover:bg-background/90")}>
                  {primaryAction.label}
                </Button>
              ))}
            {secondaryAction && (
              <a
                href={secondaryAction.href ?? "#"}
                onClick={secondaryAction.onClick}
                className={cn(
                  "rounded-full font-semibold underline decoration-dotted decoration-2 underline-offset-8 transition-colors hover:no-underline",
                  buttonVariants({ variant: "ghost", size: "lg" }),
                  ink ? "text-background/75 hover:bg-background/5 hover:text-background" : "text-muted-foreground hover:bg-transparent hover:text-foreground",
                )}
              >
                {secondaryAction.label}
              </a>
            )}
          </div>
        )}

        {onSearch && (
          <form
            className="mt-8 flex w-full max-w-sm items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (query.trim()) onSearch(query.trim())
            }}
          >
            <div className="relative flex-1">
              <Search className={cn("pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2", ink ? "text-background/40" : "text-muted-foreground")} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search"
                className={cn(
                  "w-full border-b bg-transparent py-2.5 pl-11 pr-3 font-mono text-sm font-semibold outline-none transition-colors placeholder:font-medium placeholder:opacity-40",
                  ink
                    ? "border-background/25 text-background focus:border-background/70"
                    : "border-border text-foreground focus:border-foreground/70",
                )}
              />
            </div>
            <Button
              type="submit"
              variant="ghost"
              className={cn("font-mono text-[11px] font-bold uppercase tracking-[0.18em]", ink ? "text-background/70 hover:bg-background/10 hover:text-background" : "text-muted-foreground hover:bg-transparent hover:text-foreground")}
            >
              Search
            </Button>
          </form>
        )}

        {links && links.length > 0 && (
          <nav aria-label="Helpful links" className="mt-12 w-full">
            <MonoLabel className={cn("justify-center", ink ? "text-background/40" : "text-muted-foreground/70")}>Popular pages</MonoLabel>
            <ul className={cn("mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-bold", ink ? "text-background/75" : "text-foreground/80")}>
              {links.map((link, i) => (
                <li key={link.label} className="flex items-center gap-6">
                  <a
                    href={link.href ?? "#"}
                    className="font-mono text-xs tracking-tight underline-offset-4 hover:underline"
                  >
                    <span className={cn("mr-2 opacity-40", ink ? "text-background/50" : "")}>{String(i + 1).padStart(2, "0")}</span>
                    {link.label}
                  </a>
                  {i < links.length - 1 && <span aria-hidden className={cn("text-[10px]", ink ? "text-background/25" : "text-muted-foreground/30")}>/</span>}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </section>
  )
}
