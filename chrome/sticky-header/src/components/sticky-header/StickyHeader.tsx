import * as React from "react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Sticky header — a bar that condenses on scroll.
// ═══ EMOTION     Quiet utility, always within reach.
// ═══ SIGNATURE   Header that shrinks + gains a blur background once you scroll.

export type StickyHeaderProps = {
  brand?: string
  items?: { id: string; label: string; href?: string }[]
  cta?: string
  className?: string
}

export function StickyHeader({ brand = "STUDIO", items = [{ id: "a", label: "Work" }, { id: "b", label: "Services" }, { id: "c", label: "About" }], cta = "Start", className }: StickyHeaderProps) {
  const [condensed, setCondensed] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <div className={cn("relative", className)}>
      <header className={cn("sticky top-0 z-40 border-b transition-all duration-300", condensed ? "bg-background/80 py-2 backdrop-blur" : "bg-background py-4")}>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 sm:px-8">
          <InView once variants={{ hidden: { opacity: 0, y: -8 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <span className={cn("font-display font-black tracking-tight transition-all", condensed ? "text-base" : "text-xl")}>{brand}</span>
          </InView>
          <nav className="hidden items-center gap-8 md:flex">
            {items.map((i) => (
              <a key={i.id} href={i.href ?? "#"} className={cn("font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-foreground", condensed ? "text-[10px]" : "text-[11px]")}>{i.label}</a>
            ))}
          </nav>
          <Button size={condensed ? "sm" : "sm"} className="rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{cta}</Button>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">SCROLL — THE BAR CONDENSES</p>
          <h1 className="mt-3 font-display text-4xl font-black tracking-[-0.03em]">A sticky header that gets out of the way.</h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-muted-foreground">Scroll down to watch the header slim down and gain a blur backdrop — it stays reachable without dominating.</p>
        </InView>
      </div>
    </div>
  )
}
