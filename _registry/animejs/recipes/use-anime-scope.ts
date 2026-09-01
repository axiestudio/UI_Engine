/**
 * Registry recipe — Anime.js v4: scoped, reduced-motion-aware React wiring.
 * Canonical per upstream "Using with React" (no in-repo consumer yet):
 *   1. createScope({ root }) keeps selector text scoped to the component,
 *   2. revert() on unmount kills animations (StrictMode double-invoke safe),
 *   3. prefers-reduced-motion renders the static end state.
 *
 * Engine library — NOT vendored code. `animejs` stays an npm peer (v4 default
 * exports: animate, createTimeline, createDraggable, onScroll, stagger, …).
 *
 * Usage:
 *   const rootRef = useAnimeScope(() => {
 *     animate(".card", { y: [24, 0], opacity: [0, 1], delay: stagger(80), ease: "outExpo" })
 *   })
 *   return <div ref={rootRef}>…</div>
 */
import * as React from "react"
import { createScope, type ScopeConstructorCallback } from "animejs"

export function usePrefersReducedMotion() {
  return React.useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  )
}

/** Runs `setup` inside a createScope rooted on the returned ref; reverts on unmount. */
export function useAnimeScope(setup: ScopeConstructorCallback, deps: React.DependencyList = []) {
  const reduce = usePrefersReducedMotion()
  const rootRef = React.useRef<HTMLElement>(null)

  React.useLayoutEffect(() => {
    if (reduce || !rootRef.current) return
    const scope = createScope({ root: rootRef.current }).add(setup)
    return () => {
      scope.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, ...deps])

  return rootRef
}
