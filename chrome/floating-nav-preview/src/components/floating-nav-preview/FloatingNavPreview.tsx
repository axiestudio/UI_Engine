import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import {
  FloatingPortal,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  flip,
  shift,
  offset,
  autoUpdate,
} from "@floating-ui/react"
import { cn } from "@/lib/utils"

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export type NavPageDef = {
  label: string
  path: string
  title: string
  blurb: string
  image: string
}

const DEFAULT_PAGES: NavPageDef[] = [
  {
    label: "Board",
    path: "/board",
    title: "Booking board",
    blurb: "Live chair roster for the week — drag a visit to rebalance the floor.",
    image: "/showcase/gallery-01.webp",
  },
  {
    label: "Chairs",
    path: "/chairs",
    title: "Chairs & stylists",
    blurb: "Four chairs, four stylists, one quiet standard of work.",
    image: "/showcase/gallery-02.webp",
  },
  {
    label: "Journal",
    path: "/journal",
    title: "Studio journal",
    blurb: "Notes on cuts, care and calm — written from the floor.",
    image: "/showcase/gallery-03.webp",
  },
  {
    label: "Contact",
    path: "/contact",
    title: "Find us",
    blurb: "Östergatan 12, Jönköping — Tuesday to Saturday, 09–18.",
    image: "/showcase/gallery-04.webp",
  },
]

function NavLink({ page }: { page: NavPageDef }) {
  const [open, setOpen] = React.useState(false)
  const reduced = React.useMemo(prefersReducedMotion, [])

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { move: false }),
    useFocus(context),
    useDismiss(context),
    useRole(context, { role: "dialog" }),
  ])

  return (
    <>
      <a
        href="#"
        ref={refs.setReference}
        {...getReferenceProps()}
        onClick={(e) => e.preventDefault()}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative isolate overflow-hidden rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {page.label}
      </a>
      {open && (
        <FloatingPortal>
          <motion.div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            initial={reduced ? false : { opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.24, ease: EASE }}
            className="z-50 w-64 overflow-hidden rounded-xl border bg-card text-left shadow-xl"
          >
            <div className="h-28 w-full bg-muted">
              <img src={page.image} alt="" loading="lazy" className="size-full object-cover" />
            </div>
            <div className="p-3.5">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-muted-foreground">
                {page.path}
              </p>
              <p className="mt-1 text-[13px] font-semibold text-foreground">{page.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{page.blurb}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-2.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Quiet Times Studio
                </span>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Open
                  <ArrowUpRight className="size-3" aria-hidden />
                </a>
              </div>
            </div>
          </motion.div>
        </FloatingPortal>
      )}
    </>
  )
}

export type FloatingNavPreviewProps = {
  brand?: string
  pages?: NavPageDef[]
  className?: string
}

export function FloatingNavPreview({ brand = "Quiet Times", pages = DEFAULT_PAGES, className }: FloatingNavPreviewProps) {
  return (
    <div className={cn("flex justify-center py-10", className)}>
      <nav
        aria-label="Studio navigation"
        className="inline-flex items-center gap-1 rounded-full border bg-card px-2 py-2 shadow-sm"
      >
        <span className="flex items-center gap-2 pl-2 pr-2">
          <span aria-hidden className="size-2.5 rounded-full bg-primary" />
          <span className="text-[13px] font-semibold tracking-tight text-foreground">{brand}</span>
        </span>
        <span aria-hidden className="mx-1 h-5 w-px bg-border" />
        {pages.map((page) => (
          <NavLink key={page.label} page={page} />
        ))}
      </nav>
    </div>
  )
}
