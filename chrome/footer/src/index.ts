import "./index.css"

export { Footer } from "./components/footer/Footer"
export type {
  FooterProps,
  FooterLink,
  FooterColumn,
  FooterSocial,
  FooterInfo,
  FooterNewsletter,
} from "./components/footer/Footer"

// Vendored upstream registry sources (provenance kept for direct use):
// Watermelon UI footer-1 — data-driven footer used as the preset's base pattern.
export { Footer1 } from "./components/watermelon/footer-1"
export type { Footer1Props, FooterLinkGroup } from "./components/watermelon/footer-1"
// Watermelon UI newsletter-2 — compact newsletter band, stackable above <Footer>.
export { default as Newsletter2 } from "./components/watermelon/newsletter-2"
// Motion-Primitives used by the preset.
export { InView } from "./components/primitives/in-view"
export { Magnetic } from "./components/primitives/magnetic"
export { TextShimmer } from "./components/primitives/text-shimmer"

export { Button, buttonVariants } from "./components/ui/button"
export { Input } from "./components/ui/input"
export { cn } from "./lib/utils"
