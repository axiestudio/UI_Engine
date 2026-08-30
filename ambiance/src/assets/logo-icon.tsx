/**
 * Local placeholder for the vendored hero-4 import (`@/assets/logo-icon`).
 * Upstream ships its own brand mark; hosts override via the Hero4 `logo` prop.
 */
const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M4 18 12 4l8 14" />
  </svg>
)
export default LogoIcon
