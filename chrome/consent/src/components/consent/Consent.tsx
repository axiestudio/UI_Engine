import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
export type ConsentCategory = {
  id: string
  /** e.g. "Necessary", "Analytics", "Marketing". */
  label: string
  description: string
  /** Always-on categories cannot be toggled off. */
  required?: boolean
  /** Default state in the preferences dialog. Default true. */
  defaultEnabled?: boolean
}

export type ConsentResult = {
  accepted: boolean
  categories: Record<string, boolean>
}

export type ConsentProps = {
  title?: string
  description?: string
  acceptLabel?: string
  rejectLabel?: string
  preferencesLabel?: string
  saveLabel?: string
  categories?: ConsentCategory[]
  /** localStorage key. Set to null to disable persistence (always show). */
  storageKey?: string | null
  onDecision?: (result: ConsentResult) => void
  /** ink = dark banner; paper = light bordered banner. Default ink. */
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_CATEGORIES: ConsentCategory[] = [
  {
    id: "necessary",
    label: "Strictly necessary",
    description: "Required for core site functionality such as security and network management. These cannot be disabled.",
    required: true,
  },
  {
    id: "analytics",
    label: "Analytics",
    description: "Help us understand how visitors interact with the site so we can measure and improve performance.",
    defaultEnabled: true,
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Used to deliver relevant ads and measure campaign effectiveness across the web.",
    defaultEnabled: false,
  },
]

const STORAGE_KEY = "ui-consent-decision"

function readStored(key: string): ConsentResult | null {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as ConsentResult) : null
  } catch {
    return null
  }
}

// ── Consent ──────────────────────────────────────────────────────────────────

export function Consent({
  title = "We value your privacy",
  description = "We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. By clicking \"Accept all\", you consent to our use of cookies.",
  acceptLabel = "Accept all",
  rejectLabel = "Reject all",
  preferencesLabel = "Preferences",
  saveLabel = "Save preferences",
  categories = DEFAULT_CATEGORIES,
  storageKey = STORAGE_KEY,
  onDecision,
  tone = "ink",
  className,
}: ConsentProps) {
  const ink = tone === "ink"
  const reduce = useReducedMotion()
  const [open, setOpen] = React.useState(false)
  const [visible, setVisible] = React.useState(() => {
    if (storageKey === null) return true
    if (typeof window === "undefined") return true
    return !readStored(storageKey)
  })
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(categories.map((c) => [c.id, c.required || (c.defaultEnabled ?? true)])),
  )

  React.useEffect(() => {
    if (storageKey === null || !readStored(storageKey)) setVisible(true)
  }, [storageKey])

  const decide = React.useCallback(
    (accepted: boolean, result?: Record<string, boolean>) => {
      const decision: ConsentResult = { accepted, categories: result ?? Object.fromEntries(categories.map((c) => [c.id, accepted ? true : Boolean(c.required)])) }
      if (storageKey) {
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(decision))
        } catch {
          /* storage unavailable — proceed without persistence */
        }
      }
      setVisible(false)
      onDecision?.(decision)
    },
    [categories, onDecision, storageKey],
  )

  const acceptAll = () => decide(true)
  const rejectAll = () => decide(false)

  return (
    <div className={cn("relative isolate overflow-hidden min-h-[320px] w-full", className)}>
      <AnimatePresence>
        {visible && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-label={title}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 z-30 p-4 sm:p-6 left-[var(--fixed-inset-left,0px)] right-[var(--fixed-inset-right,0px)]"
          >
            <div
              className={cn(
                "mx-auto flex max-w-[1120px] flex-col gap-5 border p-6 shadow-lg sm:px-8 sm:py-7 lg:flex-row lg:items-center lg:justify-between",
                ink ? "border-background/15 bg-foreground text-background" : "border-border bg-card text-foreground",
              )}
            >
              {/* corner ticks — the consent slip is placed, not dropped */}
              <span
                aria-hidden
                className={cn("pointer-events-none absolute inset-0", ink ? "text-background/30" : "text-foreground/20")}
              >
                <span className="absolute left-2 top-2 size-2.5 border-l border-t border-current" />
                <span className="absolute right-2 top-2 size-2.5 border-r border-t border-current" />
                <span className="absolute bottom-2 left-2 size-2.5 border-b border-l border-current" />
                <span className="absolute bottom-2 right-2 size-2.5 border-b border-r border-current" />
              </span>
              <div className="max-w-2xl">
                <h2 className={cn("font-display text-lg font-extrabold tracking-tight", ink ? "text-background" : "text-foreground")}>
                  {title}
                </h2>
                <p className={cn("mt-1.5 text-sm font-medium leading-relaxed", ink ? "text-background/70" : "text-muted-foreground")}>
                  {description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(true)}
                  className={cn(ink && "text-background/80 hover:bg-background/10 hover:text-background")}
                >
                  {preferencesLabel}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                  className={cn(ink && "border-background/25 bg-transparent text-background hover:bg-background/10 hover:text-background")}
                >
                  {rejectLabel}
                </Button>
                <Button size="sm" onClick={acceptAll}>
                  {acceptLabel}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-extrabold tracking-tight">Cookie preferences</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Manage how we use cookies per category. Necessary cookies are always on.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col py-2">
            {categories.map((cat, i) => (
              <div key={cat.id}>
                {i > 0 && <Separator className="my-4" />}
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{cat.label}</p>
                    <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">{cat.description}</p>
                  </div>
                  <Switch
                    checked={cat.required ? true : enabled[cat.id]}
                    disabled={cat.required}
                    onCheckedChange={(v) => setEnabled((s) => ({ ...s, [cat.id]: v }))}
                    aria-label={cat.label}
                    className="mt-0.5 shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
          <DialogFooter className="mt-2 flex-row items-center justify-end gap-2.5">
            <Button variant="ghost" size="sm" onClick={rejectAll}>
              {rejectLabel}
            </Button>
            <Button size="sm" onClick={() => decide(true, { ...enabled })}>
              {saveLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
