import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type MarqueeProps = {
  items: React.ReactNode[]
  /** Seconds per full loop. Default 30. */
  speed?: number
  reverse?: boolean
  /** Pause the scroll while hovered. Default true. */
  pauseOnHover?: boolean
  /** ink = solid dark ticker band; paper = bordered light band. Default ink. */
  tone?: "paper" | "ink"
  /** Optional prefix chip before the scrolling items. */
  label?: string
  className?: string
}

// ── Marquee ──────────────────────────────────────────────────────────────────

export function Marquee({
  items,
  speed = 30,
  reverse = false,
  pauseOnHover = true,
  tone = "ink",
  label,
  className,
}: MarqueeProps) {
  if (!items.length) return null
  const ink = tone === "ink"

  return (
    <section
      className={cn(
        "w-full overflow-hidden border-y",
        ink ? "border-background/10 bg-foreground" : "border-border bg-background",
        className,
      )}
      aria-label="Highlights"
    >
      <div className={cn("flex items-center", ink ? "py-4" : "py-5")}>
        {label && (
          <InView
            variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewOptions={{ once: true }}
          >
            <Badge className={cn("z-10 ml-4 shrink-0 rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest sm:ml-6", ink ? "bg-background text-foreground" : "bg-foreground text-background")}>
              {label}
            </Badge>
          </InView>
        )}
        <div
          className={cn(
            "ui-marquee group relative flex min-w-0 flex-1 items-center overflow-hidden",
            label && "pl-6",
            pauseOnHover && "[&:hover_.ui-marquee-track]:[animation-play-state:paused]",
          )}
        >
          <div
            className="ui-marquee-track motion-reduce:[animation:none] flex w-max shrink-0 items-center"
            style={{
              animation: `ui-marquee-scroll ${speed}s linear infinite`,
              animationDirection: reverse ? "reverse" : "normal",
            }}
          >
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex items-center">
                {items.map((item, i) => (
                  <li
                    key={i}
                    className={cn(
                      "flex items-center gap-8 whitespace-nowrap pr-8 font-display text-base font-extrabold tracking-tight sm:text-lg",
                      ink ? "text-background/90" : "text-foreground",
                    )}
                  >
                    {item}
                    <span aria-hidden className={cn("text-xs", ink ? "text-background/30" : "text-muted-foreground/50")}>
                      ◆
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes ui-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
