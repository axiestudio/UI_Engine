import * as React from "react"
import {
  ArrowRight,
  Blocks,
  BookOpen,
  ChartNoAxesColumn,
  ChevronDown,
  Code2,
  Globe,
  Layers,
  Menu,
  Puzzle,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────────────
type NavChild = {
  title: string
  href: string
  description: string
  icon: React.ElementType
  badge?: string
}

type NavItem = {
  label: string
  href?: string
  children?: NavChild[]
  featured?: { title: string; description: string; href: string; cta: string }
}

// ── Demo Data ────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  {
    label: "Products",
    children: [
      { title: "Analytics", href: "#", description: "Realtime insights for every team", icon: ChartNoAxesColumn },
      { title: "Automation", href: "#", description: "Workflows that run themselves", icon: Zap, badge: "New" },
      { title: "Platform", href: "#", description: "The core primitives to ship fast", icon: Layers },
      { title: "Integrations", href: "#", description: "Connect 200+ tools in minutes", icon: Puzzle },
      { title: "Security", href: "#", description: "SOC 2 + enterprise-grade controls", icon: ShieldCheck },
      { title: "API & SDK", href: "#", description: "Build anything with our API", icon: Code2 },
    ],
  },
  {
    label: "Solutions",
    featured: {
      title: "For modern teams",
      description: "From startup to enterprise — scale without rewriting your stack.",
      href: "#",
      cta: "Explore solutions",
    },
    children: [
      { title: "Startups", href: "#", description: "Launch in days, not months", icon: Sparkles },
      { title: "Enterprise", href: "#", description: "Governance, SSO & audit logs", icon: Blocks },
      { title: "Agencies", href: "#", description: "Ship client work faster", icon: Users },
    ],
  },
  {
    label: "Resources",
    children: [
      { title: "Documentation", href: "#", description: "Guides, API ref and examples", icon: BookOpen },
      { title: "Changelog", href: "#", description: "What’s new every week", icon: Globe, badge: "Updated" },
      { title: "Community", href: "#", description: "Join 50k+ builders", icon: Users },
      { title: "Templates", href: "#", description: "Start from production-ready kits", icon: Layers },
    ],
  },
  { label: "Pricing", href: "#" },
]

// ── Sub Components ───────────────────────────────────────────────────────────

function ListItem({
  title,
  href,
  description,
  icon: Icon,
  badge,
}: NavChild & { className?: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className="group flex gap-3 rounded-xl p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-card shadow-xs transition-colors group-hover:bg-background">
            <Icon className="h-[16px] w-[16px] stroke-[2.2]" />
          </span>
          <span className="space-y-1">
            <span className="flex items-center gap-2 font-display text-[14px] font-bold leading-none tracking-tight">
              {title}
              {badge && (
                <Badge className="h-5 bg-foreground px-1.5 text-[10px] font-black tracking-wide text-background">
                  {badge}
                </Badge>
              )}
            </span>
            <p className="line-clamp-2 text-xs font-medium leading-snug text-muted-foreground">{description}</p>
          </span>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

// ── Header ───────────────────────────────────────────────────────────────────

export type HeaderProps = {
  /** "sticky" (default, takes layout space) or "fixed" (floats above the hero). */
  position?: "sticky" | "fixed"
  /** Controlled state — pass from the host to sync overlays (e.g. hero header offset). Omit to self-manage. */
  scrolled?: boolean
  hidden?: boolean
  mobileOpen?: boolean
  setMobileOpen?: React.Dispatch<React.SetStateAction<boolean>>
  searchOpen?: boolean
  setSearchOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export function Header(props: HeaderProps = {}) {
  const [innerScrolled, setInnerScrolled] = React.useState(false)
  const [innerHidden, setInnerHidden] = React.useState(false)
  const [innerMobileOpen, setInnerMobileOpen] = React.useState(false)
  const [innerSearchOpen, setInnerSearchOpen] = React.useState(false)
  const lastY = React.useRef(0)

  const position = props.position ?? "sticky"
  const scrolled = props.scrolled ?? innerScrolled
  const hidden = props.hidden ?? innerHidden
  const mobileOpen = props.mobileOpen ?? innerMobileOpen
  const setMobileOpen = props.setMobileOpen ?? setInnerMobileOpen
  const searchOpen = props.searchOpen ?? innerSearchOpen
  const setSearchOpen = props.setSearchOpen ?? setInnerSearchOpen

  React.useEffect(() => {
    if (props.scrolled !== undefined && props.hidden !== undefined) return
    const onScroll = () => {
      const y = window.scrollY
      const diff = y - lastY.current
      // hide on scroll down past 80px, show on scroll up
      if (y > 80 && diff > 6 && !mobileOpen && !searchOpen) setInnerHidden(true)
      else if (diff < -6 || y < 80) setInnerHidden(false)
      setInnerScrolled(y > 8)
      lastY.current = y
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [mobileOpen, searchOpen, props.scrolled, props.hidden])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
      if (e.key === "/" && !searchOpen && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [searchOpen])

  // flatten for search
  const allSearchItems = React.useMemo(() => {
    const items: Array<{ group: string; title: string; desc: string; href: string; icon: React.ElementType }> = []
    for (const nav of NAV_ITEMS) {
      if (nav.children) {
        for (const c of nav.children) items.push({ group: nav.label, title: c.title, desc: c.description, href: c.href, icon: c.icon })
      } else if (nav.href) {
        items.push({ group: "Pages", title: nav.label, desc: nav.label, href: nav.href, icon: Layers })
      }
    }
    return items
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden ? "-100%" : "0%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
        className={cn(
          "top-0 z-50 border-b backdrop-blur-xl",
          position === "fixed"
            ? "fixed left-[var(--fixed-inset-left,0px)] right-[var(--fixed-inset-right,0px)] w-auto"
            : "sticky w-full",
          scrolled
            ? "border-border bg-background/90 supports-[backdrop-filter]:bg-background/80 shadow-[0_1px_0_0_hsl(var(--border)),0_8px_24px_-16px_hsl(var(--foreground)/0.16)]"
            : "border-transparent bg-background",
          // animate border/bg via motion
        )}
        style={{ willChange: "transform" }}
      >
        <div className="mx-auto flex h-[56px] w-full max-w-[1280px] items-center justify-between gap-3 px-4 sm:h-[64px] sm:gap-4 sm:px-6 lg:px-8">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Logo — BOLD */}
            <a href="#" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-sm">
                <Layers className="h-[19px] w-[19px] stroke-[2.5]" />
              </span>
              <span className="font-display text-[17px] font-extrabold tracking-[-0.03em]">acme</span>
              <Badge className="hidden h-5 rounded-full bg-foreground px-1.5 text-[10px] font-black tracking-widest text-background sm:inline-flex">
                LABS
              </Badge>
            </a>

            {/* Desktop Nav — NavigationMenu (correct semantic for site nav) */}
            <NavigationMenu className="hidden lg:flex">
              <NavigationMenuList>
                {NAV_ITEMS.map((item) =>
                  item.children ? (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuTrigger className="h-8 rounded-full bg-transparent px-3.5 font-display text-[14px] font-bold tracking-tight text-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground">
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {/* PRODUCTS — 2-col icon grid */}
                        {item.label === "Products" && (
                          <div className="grid w-[640px] grid-cols-2 gap-1 p-2">
                            <ul className="col-span-2 grid grid-cols-2 gap-1">
                              {item.children.map((child) => (
                                <ListItem key={child.title} {...child} />
                              ))}
                            </ul>
                            <div className="col-span-2 mt-1 flex items-center justify-between rounded-xl bg-muted/70 px-4 py-3">
                              <p className="text-xs font-medium text-muted-foreground">
                                <span className="font-bold text-foreground">Need help choosing?</span> Book a 15-min demo.
                              </p>
                              <Button size="sm" className="h-7 rounded-full text-xs font-bold">
                                Book demo <ArrowRight className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* SOLUTIONS — left list + right featured card */}
                        {item.label === "Solutions" && (
                          <div className="flex w-[620px] gap-2 p-2">
                            <ul className="flex w-[300px] flex-col gap-1">
                              {item.children.map((child) => (
                                <ListItem key={child.title} {...child} />
                              ))}
                            </ul>
                            {item.featured && (
                              <div className="flex w-[300px] flex-col justify-between rounded-xl bg-foreground p-5 text-background">
                                <div>
                                  <p className="font-mono text-[11px] font-bold tracking-widest text-white/60">FEATURED</p>
                                  <h4 className="mt-2 font-display text-[15px] font-extrabold leading-tight">{item.featured.title}</h4>
                                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-white/70">{item.featured.description}</p>
                                </div>
                                <a
                                  href={item.featured.href}
                                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                                >
                                  {item.featured.cta} <ArrowRight className="h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}

                        {/* RESOURCES — single column */}
                        {item.label === "Resources" && (
                          <ul className="grid w-[360px] gap-1 p-2">
                            {item.children.map((child) => (
                              <ListItem key={child.title} {...child} />
                            ))}
                            <li className="mt-1 rounded-xl border bg-card px-3 py-3">
                              <a href="#" className="flex items-center justify-between gap-3">
                                <span className="text-xs font-medium">
                                  <span className="font-bold">Explore all resources</span>
                                  <span className="block font-medium text-muted-foreground">Docs, guides & community</span>
                                </span>
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </span>
                              </a>
                            </li>
                          </ul>
                        )}
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.label}>
                      <NavigationMenuLink asChild>
                        <a
                          href={item.href}
                          className="inline-flex h-8 items-center justify-center rounded-full px-3.5 font-display text-[14px] font-bold tracking-tight text-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          {item.label}
                        </a>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 rounded-full sm:inline-flex"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-[18px] w-[18px] stroke-[2.2]" />
            </Button>
            {/* also small search trigger for mobile with kbd hint hidden */}
            <Button
              variant="outline"
              className="hidden h-9 rounded-full border-2 px-3.5 font-mono text-xs font-bold tracking-tight text-muted-foreground hover:text-foreground sm:inline-flex lg:hidden"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" /> /
            </Button>

            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" className="h-9 rounded-full px-5 font-display text-[14px] font-bold tracking-tight">
                Log in
              </Button>

              {/* ButtonGroup — shadcn base pattern */}
              <ButtonGroup>
                <Button className="h-9 rounded-full px-6 font-display text-[14px] font-extrabold tracking-tight shadow">Get started</Button>
                <Button size="icon" className="h-9 w-9 rounded-full" aria-label="More">
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </Button>
              </ButtonGroup>
            </div>

            {/* Mobile: SHEET — BOTTOM SHEET (mobile-first) */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border bg-background shadow-sm lg:hidden" aria-label="Open menu">
                  <Menu className="h-[20px] w-[20px] stroke-[2.5]" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="flex max-h-[88vh] flex-col gap-0 rounded-t-[26px] border-0 bg-background p-0 shadow-2xl">
                {/* drag handle */}
                <div className="flex justify-center pt-3">
                  <div className="h-1.5 w-10 rounded-full bg-foreground/15" />
                </div>

                <SheetHeader className="border-b px-5 py-4 text-left sm:px-6">
                  <SheetTitle className="flex items-center gap-2.5 text-left font-display text-[16px] font-extrabold tracking-tight">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-foreground text-background">
                      <Layers className="h-[18px] w-[18px] stroke-[2.5]" />
                    </span>
                    acme
                    <Badge className="h-5 rounded-full bg-foreground px-1.5 text-[10px] font-black tracking-widest text-background">
                      LABS
                    </Badge>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 sm:px-4">
                  {/* Mobile search */}
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      setTimeout(() => setSearchOpen(true), 200)
                    }}
                    className="mb-3 flex w-full items-center gap-2.5 rounded-xl border-2 bg-muted/50 px-3 py-3 text-left font-medium text-muted-foreground"
                  >
                    <Search className="h-4 w-4" />
                    <span className="flex-1 text-sm">Search…</span>
                    <span className="rounded-md border bg-background px-1.5 py-0.5 font-mono text-xs font-bold">⌘K</span>
                  </button>

                  <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) =>
                      item.children ? (
                        <Collapsible key={item.label} className="group/coll">
                          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl px-4 py-3.5 font-display text-[15px] font-bold tracking-tight transition-colors hover:bg-accent active:bg-accent [&[data-state=open]>svg]:rotate-180">
                            {item.label}
                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                            <ul className="mx-1 my-2 flex flex-col gap-1 rounded-2xl bg-muted p-2">
                              {item.children.map((child) => {
                                const Icon = child.icon
                                return (
                                  <li key={child.title}>
                                    <a
                                      href={child.href}
                                      onClick={() => setMobileOpen(false)}
                                      className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-background active:bg-background"
                                    >
                                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-card shadow-xs">
                                        <Icon className="h-[18px] w-[18px] stroke-[2]" />
                                      </span>
                                      <span>
                                        <span className="flex items-center gap-1.5 font-display text-[14px] font-bold leading-none tracking-tight">
                                          {child.title}
                                          {child.badge && (
                                            <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-black leading-none text-background">
                                              {child.badge}
                                            </span>
                                          )}
                                        </span>
                                        <span className="mt-1.5 block text-xs font-medium leading-snug text-muted-foreground">
                                          {child.description}
                                        </span>
                                      </span>
                                    </a>
                                  </li>
                                )
                              })}
                            </ul>
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className="rounded-xl px-4 py-3.5 font-display text-[15px] font-bold tracking-tight transition-colors hover:bg-accent active:bg-accent"
                        >
                          {item.label}
                        </a>
                      )
                    )}
                  </nav>

                  <div className="mt-6 rounded-[20px] bg-foreground p-6 text-background">
                    <p className="font-mono text-[11px] font-bold tracking-widest text-white/60">START BUILDING</p>
                    <h4 className="mt-2 font-display text-[18px] font-extrabold leading-tight tracking-tight">Ship your next idea faster</h4>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-white/70">Free plan, no credit card required. Upgrade anytime.</p>
                    <Button variant="secondary" className="mt-5 h-11 w-full rounded-full font-display text-[14px] font-extrabold tracking-tight">
                      Create account <ArrowRight className="ml-1 h-4 w-4 stroke-[2.5]" />
                    </Button>
                  </div>
                </div>

                <div className="border-t bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-5">
                  <div className="flex gap-3">
                    <Button variant="outline" className="h-11 flex-1 rounded-full border-2 font-display text-[14px] font-bold">
                      Log in
                    </Button>
                    <Button className="h-11 flex-1 rounded-full font-display text-[14px] font-extrabold tracking-tight">Get started</Button>
                  </div>
                  <p className="mt-3 text-center font-mono text-[11px] font-medium leading-relaxed text-muted-foreground">
                    By continuing you agree to Terms & Privacy
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      {/* SEARCH — shadcn Command + Dialog with animate */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search docs, products, pages…" />
        <CommandList>
          <CommandEmpty>No results. Try another keyword.</CommandEmpty>

          <CommandGroup heading="SUGGESTED">
            {allSearchItems.slice(0, 6).map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.title}
                  value={`${item.title} ${item.desc} ${item.group}`}
                  onSelect={() => {
                    setSearchOpen(false)
                    window.location.hash = item.href
                  }}
                  className="flex items-center gap-3 rounded-xl px-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-card">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-display text-sm font-bold leading-none tracking-tight">{item.title}</span>
                    <span className="text-xs font-medium text-muted-foreground">{item.desc}</span>
                  </span>
                  <span className="ml-auto hidden rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest sm:inline">
                    {item.group}
                  </span>
                </CommandItem>
              )
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="PAGES">
            {allSearchItems.slice(6).map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.title + item.group}
                  value={`${item.title} ${item.group}`}
                  onSelect={() => setSearchOpen(false)}
                  className="flex items-center gap-3"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{item.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{item.group}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>

        <div className="flex items-center justify-between border-t px-3 py-2.5 text-xs">
          <span className="font-mono text-[11px] font-medium text-muted-foreground">
            Press <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-xs font-bold">↵</kbd> to select
          </span>
          <span className="hidden items-center gap-1 font-mono text-[11px] font-medium text-muted-foreground sm:flex">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-xs font-bold">↑</kbd>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-xs font-bold">↓</kbd> navigate
            <kbd className="ml-2 rounded border bg-muted px-1 py-0.5 font-mono text-xs font-bold">ESC</kbd> close
          </span>
        </div>
      </CommandDialog>
    </>
  )
}
