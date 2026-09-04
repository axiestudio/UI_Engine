import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Search, CornerDownLeft } from "lucide-react"
import { InView } from "@/components/primitives/in-view"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// ═══ JOB         Command search — accessible palette with dialog semantics
// ═══ EMOTION     fast, keyboard-first
// ═══ SIGNATURE   ⌘K palette, tokenized overlay, focus-managed dialog

export type CommandEntry = { id: string; label: string; group?: string }

export type NavCommandSearchProps = {
  brand?: string
  entries?: CommandEntry[]
  className?: string
}

export function NavCommandSearch({
  brand = "STUDIO",
  entries = [
    { id: "1", label: "Sections", group: "Product" },
    { id: "2", label: "Tokens", group: "Product" },
    { id: "3", label: "Motion kit", group: "Product" },
    { id: "4", label: "Journal", group: "Company" },
    { id: "5", label: "Contact", group: "Company" },
  ],
  className,
}: NavCommandSearchProps) {
  const [open, setOpen] = React.useState(false)
  const [q, setQ] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (!isInput && e.key === "/" && !open) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  React.useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 30)
  }, [open])

  const results = entries.filter((e) => e.label.toLowerCase().includes(q.toLowerCase()))

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[320px] w-full", className)}>
      <header className="relative isolate overflow-hidden flex items-center justify-between border-b bg-background px-5 py-4 sm:px-8">
        <a href="#" className="font-display text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {brand}
        </a>
        <Button
          type="button"
          aria-label="Open search (⌘K)"
          aria-keyshortcuts="Meta+K"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="h-4 w-4" aria-hidden /> Search <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 font-mono text-xs sm:inline-flex">⌘K</kbd>
        </Button>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <InView once variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
          <h1 className="font-display text-3xl font-bold tracking-tight">Press ⌘K to search.</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">A command palette that lives in the header — keyboard-first navigation.</p>
        </InView>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="absolute inset-0 z-50 flex items-start justify-center bg-foreground/10 p-4 pt-24 "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="document"
              className="w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-lg"
              initial={reduce ? { opacity: 0 } : { scale: 0.98, y: -8 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 0.98, y: -8, opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b px-4">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
                <Input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search sections, pages…"
                  aria-label="Search"
                  className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="max-h-72 overflow-y-auto p-2" role="listbox" aria-label="Results">
                {results.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground" role="status">
                    No results for “{q}”.
                  </p>
                ) : (
                  results.map((r) => (
                    <Button
                      key={r.id}
                      type="button"
                      role="option"
                      onClick={() => setOpen(false)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="text-sm font-medium">{r.label}</span>
                      <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                        {r.group} <CornerDownLeft className="h-3 w-3" aria-hidden />
                      </span>
                    </Button>
                  ))
                )}
              </div>
              <div className="border-t bg-muted/40 px-3 py-2 text-right font-mono text-xs text-muted-foreground">Esc to close</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
