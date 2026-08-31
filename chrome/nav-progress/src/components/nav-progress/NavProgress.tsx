import * as React from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Navbar with scroll progress — a top progress rail plus a sticky bar.
// ═══ EMOTION     You're always oriented.
// ═══ SIGNATURE   A sticky nav with a motion progress bar showing how far you've read/scrolled.

export type NavProgressItem = { id: string; label: string; href?: string }

export type NavProgressProps = {
  brand?: string
  items?: NavProgressItem[]
  cta?: string
  className?: string
}

export function NavProgress({ brand = "STUDIO", items = [{ id: "a", label: "Work" }, { id: "b", label: "Services" }, { id: "c", label: "Journal" }], cta = "Start", className }: NavProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  const [scrolled, setScrolled] = React.useState(false)
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className={cn("relative z-40", className)}>
      <header className={cn("sticky top-0 z-40 transition-colors", scrolled ? "border-b bg-background/80 backdrop-blur" : "border-b border-transparent")}>
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
          <InView once variants={{ hidden: { opacity: 0, y: -8 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
            <span className="font-display text-lg font-black tracking-tight">{brand}</span>
          </InView>
          <nav className="hidden items-center gap-8 md:flex">
            {items.map((i) => (
              <a key={i.id} href={i.href ?? "#"} className="font-mono text-[11px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">{i.label}</a>
            ))}
          </nav>
          <Button size="sm" className="rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{cta}</Button>
        </div>
        <motion.div className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-foreground" style={{ scaleX }} />
      </header>
      {/* spacer content so the progress bar has somewhere to travel */}
      <div className="space-y-6 px-5 py-16 sm:px-8">
        <MonoLabel>SCROLL TO DRIVE THE BAR</MonoLabel>
        {Array.from({ length: 5 }).map((_, i) => (
          <p key={i} className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-muted-foreground">
            The progress rail at the top tracks how far you've scrolled through the page — a quiet orienting signal as you read.
          </p>
        ))}
      </div>
    </div>
  )
}
