import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

// ═══ JOB         Animated underline — accessible tab-style nav with shared indicator
// ═══ EMOTION     precise, typographic

export type NavUnderlineLink = { id: string; label: string; href?: string }

export type NavAnimatedUnderlineProps = {
  brand?: string
  links: NavUnderlineLink[]
  className?: string
}

const DEFAULT_LINKS = [
  { id: "n1", label: "Work", href: "#work" },
  { id: "n2", label: "Studio", href: "#studio" },
  { id: "n3", label: "Journal", href: "#journal" },
  { id: "n4", label: "Contact", href: "#contact" },
]
export function NavAnimatedUnderline({ brand = "STUDIO", links = DEFAULT_LINKS, className }: NavAnimatedUnderlineProps) {
  const [active, setActive] = React.useState(links[0]?.id ?? "")
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  return (
    <div className={cn("relative", className)}>
      <header className="flex items-center justify-between border-b bg-background px-5 py-4 sm:px-8">
        <a href="#" className="font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {brand}
        </a>
        <nav aria-label="Primary" className="flex items-center gap-1">
          {links.map((l) => {
            const isActive = active === l.id
            return (
              <a
                key={l.id}
                href={l.href ?? "#"}
                aria-current={isActive ? "page" : undefined}
                onMouseEnter={() => setActive(l.id)}
                onFocus={() => setActive(l.id)}
                onClick={(e) => {
                  if (!l.href || l.href === "#") e.preventDefault()
                  setActive(l.id)
                }}
                className={cn(
                  "relative rounded-md px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    aria-hidden
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-foreground"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
              </a>
            )
          })}
        </nav>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Navigation with a moving indicator.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Active state is shared via a layout animation — underline slides rather than jumps.</p>
      </div>
    </div>
  )
}
