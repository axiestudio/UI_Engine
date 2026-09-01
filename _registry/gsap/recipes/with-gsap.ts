/**
 * Registry recipe — GSAP: scoped, reduced-motion-aware context.
 * The exact hygiene every gsap preset in this repo follows:
 *   1. matchMedia prefers-reduced-motion gate (117 call-sites repo-wide),
 *   2. gsap.context scoped to the root element (selectors can't leak),
 *   3. revert() cleanup (StrictMode double-invoke safe).
 *
 * Engine library — NOT vendored code. `gsap` stays an npm peer.
 * Register plugins once at module scope in the component file:
 *   import { ScrollTrigger } from "gsap/ScrollTrigger"
 *   gsap.registerPlugin(ScrollTrigger)
 *
 * Usage:
 *   const rootRef = useGsapScope(() => {
 *     gsap.to(".panel", { y: 0, stagger: 0.08, scrollTrigger: { trigger: rootRef.current, scrub: true } })
 *   })
 *   return <div ref={rootRef}>…</div>
 */
import * as React from "react"
import { gsap } from "gsap"

export function usePrefersReducedMotion() {
  return React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
}

/** Runs `setup` inside a scoped gsap.context on the returned root ref; reverts on unmount. */
export function useGsapScope(setup: (ctx: gsap.Context) => void, deps: React.DependencyList = []) {
  const reduce = usePrefersReducedMotion()
  const scopeRef = React.useRef<HTMLElement>(null)

  React.useLayoutEffect(() => {
    if (reduce || !scopeRef.current) return
    const ctx = gsap.context(setup, scopeRef.current)
    return () => {
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, ...deps])

  return scopeRef
}
