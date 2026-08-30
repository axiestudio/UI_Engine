import * as React from "react"
import { Search } from "lucide-react"
import { Spotlight } from "@/components/primitives/spotlight"
import { TextEffect } from "@/components/primitives/text-effect"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  /** ink = dark full-bleed panel; paper = light with bordered panel. Default ink. */
  tone?: "paper" | "ink"
  /** Fill the viewport (min-h-svh) instead of a section band. Default true. */
  fullPage?: boolean
  className?: string
}

// ── ErrorState ───────────────────────────────────────────────────────────────

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
  const [searched, setSearched] = React.useState(false)

  return (
    <section
      className={cn(ink && "bg-foreground", fullPage ? "min-h-svh" : "w-full", "flex w-full items-center justify-center", className)}
      aria-label={`Error ${code}`}
    >
      <div className={cn("relative mx-auto w-full max-w-[1280px] overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8", fullPage && "flex flex-col items-center justify-center text-center")}>
        {!ink && <Spotlight size={520} className="bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.06),transparent_75%)] blur-2xl" />}

        <p
          aria-hidden
          className={cn(
            "relative select-none font-display text-[120px] font-black leading-[0.85] tracking-[-0.06em] [-webkit-text-stroke:2px_currentColor] [color:transparent] sm:text-[200px] lg:text-[260px]",
            ink ? "text-background" : "text-foreground",
          )}
        >
          {code}
        </p>
        <span className="sr-only">{`Error ${code}`}</span>

        <div className={cn("relative mt-2 max-w-xl", fullPage && "mt-0 sm:-mt-6")}>
          <TextEffect
            as="h1"
            preset="blur"
            per="word"
            delay={0.1}
            className={cn("font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl", ink ? "text-background" : "text-foreground")}
          >
            {title}
          </TextEffect>
          <p className={cn("mt-3 text-sm font-medium leading-relaxed sm:text-base", ink ? "text-background/70" : "text-muted-foreground")}>
            {description}
          </p>

          <div className={cn("mt-8 flex flex-wrap items-center justify-center gap-2.5")}>
            {primaryAction &&
              (primaryAction.href ? (
                <a
                  href={primaryAction.href}
                  onClick={primaryAction.onClick}
                  className={cn(buttonVariants({ size: "lg" }), ink && "bg-background text-foreground hover:bg-background/90")}
                >
                  {primaryAction.label}
                </a>
              ) : (
                <Button size="lg" onClick={primaryAction.onClick} className={cn(ink && "bg-background text-foreground hover:bg-background/90")}>
                  {primaryAction.label}
                </Button>
              ))}
            {secondaryAction &&
              (secondaryAction.href ? (
                <a
                  href={secondaryAction.href}
                  onClick={secondaryAction.onClick}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background",
                  )}
                >
                  {secondaryAction.label}
                </a>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={secondaryAction.onClick}
                  className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
                >
                  {secondaryAction.label}
                </Button>
              ))}
          </div>

          {onSearch && (
            <form
              className="mx-auto mt-8 flex w-full max-w-sm items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                setSearched(true)
                onSearch(query)
              }}
            >
              <div className="relative flex-1">
                <Search className={cn("pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2", ink ? "text-background/40" : "text-muted-foreground")} />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label="Search"
                  className={cn("pl-9", ink && "border-background/25 bg-background/5 text-background placeholder:text-background/40 focus-visible:border-background/40 focus-visible:ring-background/30")}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
              >
                Search
              </Button>
            </form>
          )}
          {searched && onSearch && (
            <p className={cn("mt-2 text-xs font-medium", ink ? "text-background/50" : "text-muted-foreground")}>
              Press enter again to re-run your search.
            </p>
          )}

          {links && links.length > 0 && (
            <nav aria-label="Helpful links" className="mt-10">
              <p className={cn("font-mono text-[11px] font-bold uppercase tracking-widest", ink ? "text-background/40" : "text-muted-foreground")}>
                Popular pages
              </p>
              <ul className={cn("mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-bold", fullPage && "justify-center")}>
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href ?? "#"}
                      className={cn(
                        "underline-offset-4 hover:underline",
                        ink ? "text-background/80 hover:text-background" : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
    </section>
  )
}
