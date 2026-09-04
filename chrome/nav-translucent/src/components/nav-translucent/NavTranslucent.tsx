import * as React from "react"
import { useScroll, useMotionValueEvent } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type NavTranslucentProps = {
  brand?: string
  links?: { id: string; label: string; href?: string }[]
  cta?: string
  ctaHref?: string
  className?: string
}

export function NavTranslucent({
  brand = "STUDIO",
  links = [
    { id: "a", label: "Work", href: "#" },
    { id: "b", label: "Services", href: "#" },
    { id: "c", label: "Contact", href: "#" },
  ],
  cta = "Start",
  ctaHref = "#",
  className,
}: NavTranslucentProps) {
  const [scrolled, setScrolled] = React.useState(false)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 12))

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[320px] w-full", className)}>
      <header
        className={cn(
          "absolute inset-x-0 top-0 z-50 border-b transition-colors",
          reduce ? "duration-0" : "duration-300",
          scrolled ? "border-border bg-background/80 " : "border-transparent bg-transparent"
        )}
      >
        <div className="relative isolate overflow-hidden mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <a href="#" className="font-display text-lg font-bold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {brand}
          </a>
          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.href ?? "#"}
                className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Button asChild size="sm" className="rounded-md">
            <a href={ctaHref}>{cta}</a>
          </Button>
        </div>
      </header>
      <div className="pt-16">
        <div className="relative h-[60vh] overflow-hidden rounded-b-3xl bg-muted">
          <img src="/frames/frame_0032.webp" alt="" className="h-full w-full object-cover" />
          <div aria-hidden className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-x-0 bottom-8 px-6 sm:px-8">
            <InView once variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <h1 className="max-w-2xl font-display text-4xl font-bold tracking-tight text-background sm:text-5xl">A nav that settles as you scroll.</h1>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-background/80">The bar gains a border and blur once you move — quiet, not flashy.</p>
            </InView>
          </div>
        </div>
      </div>
    </div>
  )
}
