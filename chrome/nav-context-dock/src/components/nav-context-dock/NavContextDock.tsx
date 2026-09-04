import * as React from "react"
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/primitives/dock"
import { Home, Compass, Bookmark, User } from "lucide-react"
import { cn } from "@/lib/utils"

// ═══ JOB         Context dock — a floating macOS-style dock of site actions.
// ═══ EMOTION     App-like site chrome.
// ═══ SIGNATURE   A bottom-centered dock whose icons scale on approach.

export type NavContextDockProps = {
  brand?: string
  className?: string
}

export function NavContextDock({ brand = "Quiet Times Studio", className }: NavContextDockProps) {
  const items = [
    { icon: Home, label: "Home" },
    { icon: Compass, label: "Explore" },
    { icon: Bookmark, label: "Saved" },
    { icon: User, label: "Account" },
  ]
  return (
    <div className={cn("relative isolate flex min-h-[560px] w-full flex-col overflow-hidden", className)}>
      <header className="flex items-center justify-between border-b px-5 py-4 sm:px-8">
        <span className="font-display text-lg font-black tracking-tight">{brand}</span>
      </header>
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-44 pt-16 sm:px-8">
        <h1 className="font-display text-3xl font-black">A dock for the whole site.</h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">A floating dock pinned to the bottom — icons magnify as your cursor approaches, like a dock should.</p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] z-10 flex justify-center px-4">
        <div className="pointer-events-auto max-w-full">
          <Dock className="items-end gap-3 rounded-2xl border bg-card/90 p-3 shadow-2xl ">
            {items.map((it) => (
              <DockItem key={it.label} className="group flex flex-col items-center">
                <DockIcon className="flex h-11 w-11 items-center justify-center rounded-xl border bg-background transition-colors group-hover:bg-accent">
                  <it.icon className="h-5 w-5" />
                  <span className="sr-only">{it.label}</span>
                </DockIcon>
                <DockLabel className="mt-1 font-mono text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{it.label}</DockLabel>
              </DockItem>
            ))}
          </Dock>
        </div>
      </div>
    </div>
  )
}
