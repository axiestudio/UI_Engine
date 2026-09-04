import * as React from "react"
import { AnimatePresence, motion, useDragControls } from "motion/react"
import { Heart, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { InView } from "@/components/primitives/in-view"
import { MonoLabel, SectionHead, SectionShell } from "@/components/primitives/handcraft"
import { Button } from "@/components/ui/button"

// ═══ JOB         A wishlist that never leaves the page — hearts first, tray second.
// ═══ EMOTION     Pocketing something you will come back for.
// ═══ SIGNATURE   The tray SPRINGS up the moment the first heart lands and
//                 drag-dismisses like a native sheet — the items persist,
//                 the spring only replays on the 0 → 1 jump.

export type WishlistProduct = { id: string; name: string; price: number; src: string; alt: string }

export type WishlistDrawerProps = {
  eyebrow?: string
  title?: React.ReactNode
  subtitle?: React.ReactNode
  products?: WishlistProduct[]
  /** Product ids saved to the wishlist on mount. */
  initialSaved?: string[]
  caption?: string
  tone?: "paper" | "ink"
  className?: string
}

const DEFAULT_PRODUCTS: WishlistProduct[] = [
  { id: "shears", name: "Shear set · matte", price: 1290, src: "/showcase/gallery-01.webp", alt: "Matte shears laid out on linen" },
  { id: "oil", name: "Beard oil No. 4", price: 240, src: "/showcase/gallery-02.webp", alt: "Beard oil bottle in low light" },
  { id: "brush", name: "Neck brush · oak", price: 320, src: "/showcase/gallery-03.webp", alt: "Oak neck brush by the window" },
  { id: "cape", name: "Cape — ink black", price: 480, src: "/showcase/gallery-04.webp", alt: "Ink black cape on a hook" },
  { id: "tonic", name: "Tonic 200 ml", price: 190, src: "/showcase/gallery-05.webp", alt: "Tonic bottle on the retail shelf" },
  { id: "poster", name: "Chair 03 poster", price: 150, src: "/showcase/gallery-06.webp", alt: "Poster print of chair 03" },
]

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`

export function WishlistDrawer({
  eyebrow = "COMMERCE · WISHLIST",
  title = "Hearts first, checkout later.",
  subtitle = "Tap a heart and the tray springs up from the bottom edge — drag it down to send it away. The hearts stay; the tray returns on the next first love.",
  products = DEFAULT_PRODUCTS,
  initialSaved = ["oil"],
  caption = "TAP THE HEARTS · DRAG THE TRAY DOWN",
  tone = "paper",
  className,
}: WishlistDrawerProps) {
  const ink = tone === "ink"
  const reduce = React.useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
  const [saved, setSaved] = React.useState<Set<string>>(() => new Set(initialSaved))
  const [dismissed, setDismissed] = React.useState(false)
  const dragControls = useDragControls()
  const items = products.filter((p) => saved.has(p.id))
  const trayOpen = items.length > 0 && !dismissed

  // A dismiss is not an unfollow — the tray only re-arms once the wishlist empties.
  React.useEffect(() => {
    if (saved.size === 0) setDismissed(false)
  }, [saved.size])

  const toggle = (id: string) =>
    setSaved((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const hair = ink ? "border-background/15" : "border-border"

  return (
    <SectionShell tone={tone} width={1120} rule="bottom" className={cn("relative isolate min-h-[400px] overflow-hidden", className)}>
      <InView
        once
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <SectionHead eyebrow={eyebrow} title={title} subtitle={subtitle} tone={tone} />
      </InView>

      <InView
        once
        variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <figure className="mt-10">
          {/* ── demo stage — the drawer lives inside, like a viewport screenshot ── */}
          <div
            className={cn(
              "relative flex h-[560px] w-full flex-col overflow-hidden rounded-xl border border-dashed",
              ink ? "border-background/25 bg-background/5" : "border-border bg-muted/30",
            )}
          >
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="p-4 pb-44 sm:p-6 sm:pb-44">
                <div className="flex items-center justify-between gap-3">
                  <MonoLabel className={ink ? "text-background/55" : "text-muted-foreground"}>Quiet Times Studio — shop shelf</MonoLabel>
                  <span aria-live="polite" className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {items.length} / {products.length} saved
                  </span>
                </div>

                <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {products.map((p) => {
                    const on = saved.has(p.id)
                    return (
                      <li key={p.id} className="overflow-hidden rounded-lg border bg-card">
                        <img src={p.src} alt={p.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                        <div className="flex items-center justify-between gap-2 p-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{p.name}</p>
                            <p className="font-mono text-[11px] font-medium text-muted-foreground">{kr(p.price)}</p>
                          </div>
                          <motion.button
                            type="button"
                            aria-pressed={on}
                            aria-label={on ? `Remove ${p.name} from the wishlist` : `Save ${p.name} to the wishlist`}
                            whileTap={reduce ? undefined : { scale: 0.78 }}
                            transition={{ type: "spring", stiffness: 520, damping: 16 }}
                            onClick={() => toggle(p.id)}
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              on
                                ? "border-primary/30 bg-primary/15 text-primary"
                                : "border-border text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground",
                            )}
                          >
                            <Heart className={cn("size-4", on && "fill-current")} aria-hidden />
                          </motion.button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* ── the tray — springs up on 0 → 1, drag-dismisses, items persist ── */}
            <AnimatePresence>
              {trayOpen && (
                <motion.div
                  role="region"
                  aria-label="Wishlist tray"
                  drag={reduce ? false : "y"}
                  dragListener={false}
                  dragControls={dragControls}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.6 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.y > 90) setDismissed(true)
                  }}
                  initial={reduce ? { opacity: 0 } : { y: "112%" }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: "112%" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-x-3 bottom-[max(1.5rem,env(safe-area-inset-bottom,1.5rem))] z-10 rounded-[20px] border bg-card p-4 shadow-2xl sm:inset-x-4"
                >
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Dismiss the wishlist tray"
                    onPointerDown={(e) => dragControls.start(e)}
                    onClick={() => setDismissed(true)}
                    className="mx-auto h-5 w-16 cursor-grab touch-none rounded-full active:cursor-grabbing"
                  >
                    <span aria-hidden className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
                  </Button>

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex min-w-0 flex-1 items-center">
                      <ul aria-hidden className="flex items-center -space-x-2">
                        {items.slice(0, 4).map((p) => (
                          <li key={p.id}>
                            <img src={p.src} alt="" className="size-10 rounded-full border-2 border-card object-cover" />
                          </li>
                        ))}
                      </ul>
                      {items.length > 4 && (
                        <span className="-ml-2 grid size-10 place-items-center rounded-full border-2 border-card bg-muted font-mono text-[10px] font-bold text-muted-foreground">
                          +{items.length - 4}
                        </span>
                      )}
                      <span aria-live="polite" className="ml-3 truncate font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                        {items.length} saved · {kr(items.reduce((sum, p) => sum + p.price, 0))}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      aria-label={`Move ${items.length} saved items to the cart`}
                      className="h-9 shrink-0 rounded-full font-mono text-[10px] font-bold uppercase tracking-[0.14em]"
                    >
                      Move to cart
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Close the wishlist tray"
                      onClick={() => setDismissed(true)}
                      className="text-muted-foreground hover:bg-muted"
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <figcaption
            className={cn(
              "mt-8 flex items-center justify-between border-t pt-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em]",
              hair,
              ink ? "text-background/55" : "text-muted-foreground",
            )}
          >
            <span>{caption}</span>
            <span aria-hidden>●</span>
          </figcaption>
        </figure>
      </InView>
    </SectionShell>
  )
}
