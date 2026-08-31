import * as React from "react"
import { Menu, X } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ═══ JOB         Offcanvas header — a nav that slides in from the side.
// ═══ EMOTION     Focused, app-like.
// ═══ SIGNATURE   A hamburger that opens a right-side offcanvas panel.

export type HeaderOffcanvasProps = {
  brand?: string
  items?: { id: string; label: string; href?: string }[]
  cta?: string
  className?: string
}

export function HeaderOffcanvas({ brand = "STUDIO", items = [{ id: "a", label: "Work" }, { id: "b", label: "Services" }, { id: "c", label: "Journal" }, { id: "d", label: "Contact" }], cta = "Start", className }: HeaderOffcanvasProps) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className={cn("relative", className)}>
      <header className="flex items-center justify-between border-b bg-background/80 px-5 py-4 backdrop-blur sm:px-8">
        <span className="font-display text-lg font-black tracking-tight">{brand}</span>
        <Button size="sm" className="rounded-full font-mono text-[10px] font-bold uppercase tracking-widest">{cta}</Button>
        <button type="button" onClick={() => setOpen(!open)} aria-label="Toggle menu" className="flex h-10 w-10 items-center justify-center rounded-full border bg-card transition-colors hover:bg-accent">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {/* offcanvas panel */}
      <div className={cn("fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l bg-card p-6 transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Menu</p>
        <nav className="mt-6 flex flex-col gap-2">
          {items.map((i) => (
            <a key={i.id} href={i.href ?? "#"} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 font-display text-lg font-bold transition-colors hover:bg-accent">{i.label}</a>
          ))}
        </nav>
        <div className="mt-auto border-t pt-4">
          <Button onClick={() => setOpen(false)} className="w-full rounded-full font-mono text-[11px] font-bold uppercase tracking-widest">{cta}</Button>
        </div>
      </div>
      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/30" aria-hidden />}
    </div>
  )
}
