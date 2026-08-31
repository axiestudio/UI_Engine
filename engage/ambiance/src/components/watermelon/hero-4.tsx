/**
 * Hero-4 — Professional editorial hero with proper tokenization
 * Refactored from Watermelon UI registry for BOLD PROFESSIONAL brandkit
 * Uses: shadcn (Button), motion-primitives (InView), lucide (icons), tokens
 */

import { useState, type ReactNode } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import {
  TrendingUp,
  Shield,
  Globe,
  Play,
  Star,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import LogoIcon from '@/assets/logo-icon';
import { InView } from '@/components/primitives/in-view';

export interface Hero4NavItem {
  label: string;
  href: string;
  hasDropdown?: boolean;
}

export interface Hero4Stat {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface Hero4SocialLink {
  label: string;
  href: string;
}

export interface Hero4Props {
  logo?: ReactNode;
  logoText?: string;
  navItems?: Hero4NavItem[];
  signInText?: string;
  signInHref?: string;
  getStartedText?: string;
  getStartedHref?: string;
  badgeText?: string;
  titleLine1?: string;
  titleLine2Start?: string;
  titleLine2Accent?: string;
  description?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  backgroundImage?: string;
  stats?: Hero4Stat[];
  socialLinks?: Hero4SocialLink[];
}

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.12,
      staggerChildren: 0.08,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero4({
  logo,
  logoText = 'Luminary',
  navItems = [
    { label: 'Products', href: '#', hasDropdown: false },
    { label: 'Solutions', href: '#', hasDropdown: false },
    { label: 'Pricing', href: '#', hasDropdown: false },
    { label: 'Resources', href: '#', hasDropdown: false },
  ],
  signInText = 'Sign in',
  signInHref = '#',
  getStartedText = 'Get Started',
  getStartedHref = '#',
  badgeText = 'CRAFTED FOR TOMORROW',
  titleLine1 = 'Where Creativity',
  titleLine2Start = 'Meets ',
  titleLine2Accent = 'Brilliance',
  description = 'Luminary helps teams design, prototype, and ship with cutting-edge tools that turn bold ideas into lasting digital experiences.',
  primaryCtaText = 'Get Started',
  primaryCtaHref = '#',
  secondaryCtaText = 'Watch Demo',
  secondaryCtaHref = '#',
  backgroundImage = 'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1920',
  stats = [
    {
      value: '10K+',
      label: 'Active Teams',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      value: '99.9%',
      label: 'Uptime',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      value: '150+',
      label: 'Countries',
      icon: <Globe className="h-4 w-4" />,
    },
  ],
  socialLinks = [
    { label: 'Linkedin', href: '#' },
    { label: 'Instagram', href: '#' },
    { label: 'Behance', href: '#' },
  ],
}: Hero4Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-background text-foreground">
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-[0.08] dark:opacity-[0.12]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
      )}

      <header className="relative z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="#"
            className="flex items-center gap-2.5 text-foreground"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
              {logo || <LogoIcon className="size-5 fill-current" />}
            </span>
            <span className="font-display text-[15px] font-bold tracking-tight">{logoText}</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="group inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <ChevronDown className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-y-px" />
                )}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild className="rounded-full font-medium">
              <a href={signInHref}>{signInText}</a>
            </Button>
            <Button asChild className="rounded-full font-semibold shadow-sm">
              <a href={getStartedHref}>{getStartedText}</a>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur md:hidden"
          >
            <motion.div
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              className="flex h-full flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-background">
                    {logo || <LogoIcon className="size-5 fill-current" />}
                  </span>
                  {logoText}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="mt-10 flex flex-col" aria-label="Mobile primary">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between border-b py-4 text-base font-medium transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 pt-6">
                <Button variant="outline" asChild className="w-full rounded-full">
                  <a href={signInHref} onClick={() => setMobileMenuOpen(false)}>{signInText}</a>
                </Button>
                <Button asChild className="w-full rounded-full">
                  <a href={getStartedHref} onClick={() => setMobileMenuOpen(false)}>{getStartedText}</a>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] max-w-[1280px] flex-col justify-between px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <InView
          variants={container}
          transition={{ staggerChildren: 0.08 }}
          viewOptions={{ once: true, margin: "-60px" }}
          className="flex flex-1 flex-col justify-center"
        >
          <div className="max-w-3xl">
            {badgeText && (
              <motion.div variants={item} className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-semibold tracking-wide text-muted-foreground">
                  <Star className="h-3 w-3 fill-foreground text-foreground" />
                  {badgeText}
                </span>
              </motion.div>
            )}

            <motion.h1 variants={item} className="font-display text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {titleLine1 && <span className="block">{titleLine1}</span>}
              {(titleLine2Start || titleLine2Accent) && (
                <span className="block">
                  {titleLine2Start}
                  {titleLine2Accent && (
                    <span className="text-foreground underline decoration-2 underline-offset-8 decoration-border">
                      {titleLine2Accent}
                    </span>
                  )}
                </span>
              )}
            </motion.h1>

            {description && (
              <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </motion.p>
            )}

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              {primaryCtaText && (
                <Button size="lg" asChild className="rounded-full px-7 font-semibold shadow-sm">
                  <a href={primaryCtaHref}>{primaryCtaText}</a>
                </Button>
              )}
              {secondaryCtaText && (
                <Button variant="outline" size="lg" asChild className="rounded-full px-7 font-medium">
                  <a href={secondaryCtaHref} className="inline-flex items-center gap-2">
                    {secondaryCtaText}
                    <Play className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
            </motion.div>
          </div>
        </InView>

        {(stats.length > 0 || socialLinks.length > 0) && (
          <InView
            variants={container}
            viewOptions={{ once: true, margin: "-40px" }}
            className="mt-16 border-t pt-8"
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              {stats.length > 0 && (
                <div className="flex flex-wrap gap-6 sm:gap-8">
                  {stats.map((stat) => (
                    <motion.div variants={item} key={stat.label} className="flex items-center gap-3">
                      {stat.icon && (
                        <div className="flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground shadow-xs">
                          {stat.icon}
                        </div>
                      )}
                      <div>
                        <div className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                          {stat.value}
                        </div>
                        <div className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {stat.label}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {socialLinks.length > 0 && (
                <div className="flex items-center gap-1">
                  {socialLinks.map((link) => (
                    <Button key={link.label} variant="ghost" size="sm" asChild className="rounded-full font-medium text-muted-foreground hover:text-foreground">
                      <a href={link.href}>{link.label}</a>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </InView>
        )}
      </div>
    </section>
  );
}
