import * as React from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

// ═══ JOB         A nav that shows where you are by physically moving the mark.
// ═══ EMOTION     A ruler sliding along the pill's bottom edge.
// ═══ SIGNATURE   One underline element morphs between items — left/width are
//                 gsap-tweened from the target button's offsetLeft/offsetWidth
//                 and recalculated by a ResizeObserver on font-load and resize.

const DEFAULT_ITEMS = ["Board", "Chairs", "Journal", "Contact"]

export type GsapUnderlineNavProps = {
  brand?: string
  items?: string[]
  defaultActive?: number
  onChange?: (index: number) => void
  className?: string
}

export function GsapUnderlineNav({
  brand = "Quiet Times Studio",
  items = DEFAULT_ITEMS,
  defaultActive = 0,
  onChange,
  className,
}: GsapUnderlineNavProps) {
  const pillRef = React.useRef<HTMLElement>(null)
  const underlineRef = React.useRef<HTMLSpanElement>(null)
  const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const activeRef = React.useRef(defaultActive)
  const [active, setActive] = React.useState(defaultActive)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  const moveTo = React.useCallback(
    (index: number, animate: boolean) => {
      const pill = pillRef.current
      const underline = underlineRef.current
      const btn = btnRefs.current[index]
      if (!pill || !underline || !btn) return
      gsap.to(underline, {
        left: btn.offsetLeft,
        width: btn.offsetWidth,
        duration: animate && !reduce ? 0.45 : 0,
        ease: "power3.out",
        overwrite: "auto",
      })
    },
    [reduce],
  )

  // park the mark, then keep it honest while the pill re-measures
  React.useLayoutEffect(() => {
    moveTo(activeRef.current, false)
    const pill = pillRef.current
    if (!pill) return
    const ro = new ResizeObserver(() => moveTo(activeRef.current, false))
    ro.observe(pill)
    return () => ro.disconnect()
  }, [moveTo])

  const handle = (index: number) => {
    activeRef.current = index
    setActive(index)
    moveTo(index, true)
    onChange?.(index)
  }

  return (
    <div className={cn("flex w-full justify-center bg-background py-10", className)}>
      <nav
        ref={pillRef}
        aria-label={brand}
        className="relative inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-2 shadow-[0_16px_40px_-28px_hsl(var(--foreground)/0.4)]"
      >
        <span className="flex items-center gap-2 pl-2 pr-3">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-foreground" />
          <span className="hidden whitespace-nowrap text-sm font-bold tracking-tight text-foreground sm:block">{brand}</span>
        </span>
        <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
        {items.map((item, i) => (
          <button
            key={item}
            type="button"
            ref={(el) => {
              btnRefs.current[i] = el
            }}
            onClick={() => handle(i)}
            aria-current={active === i ? "page" : undefined}
            className={cn(
              "relative shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              active === i ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item}
          </button>
        ))}
        <span
          ref={underlineRef}
          aria-hidden
          className="pointer-events-none absolute -bottom-0.5 left-0 h-0.5 rounded-full bg-foreground"
          style={{ width: 0 }}
        />
      </nav>
    </div>
  )
}
