// ESM replacement for the CJS-only `use-sync-external-store` shim that
// react-redux pulls in via recharts. The CJS build calls `require("react")`,
// which breaks ESM browser bundles (rolldown runtime). React >= 18 ships a
// native useSyncExternalStore, so this is a straight native-backed port of the
// with-selector implementation (memoized selection + equality short-circuit;
// render-phase update pattern, loop-safe by design).
import { useRef, useReducer } from "react"
import { useSyncExternalStore } from "react"

export { useSyncExternalStore }

type Subscribe = (onStoreChange: () => void) => () => void
type Snapshot<T> = () => T
type Selector<T, U> = (state: T) => U

type Inst<T, U> = {
  value: T
  selected: U
  selector: Selector<T, U>
  isEqual: ((a: U, b: U) => boolean) | null
}

export function useSyncExternalStoreWithSelector<T, U>(
  subscribe: Subscribe,
  getSnapshot: Snapshot<T>,
  getServerSnapshot: Snapshot<T> | undefined,
  selector: Selector<T, U>,
  isEqual?: (a: U, b: U) => boolean,
): U {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot ?? getSnapshot)
  const ref = useRef<Inst<T, U> | null>(null)
  const [, forceUpdate] = useReducer((c: number) => c + 1, 0)

  let inst = ref.current
  if (inst === null) {
    inst = { value, selected: selector(value), selector, isEqual: isEqual ?? null }
    ref.current = inst
    return inst.selected
  }
  if (inst.selector !== selector || !Object.is(inst.value, value)) {
    const next = selector(value)
    const eq = inst.isEqual ?? Object.is
    if (!eq(inst.selected, next)) {
      inst = { value, selected: next, selector, isEqual: isEqual ?? null }
      ref.current = inst
      forceUpdate()
    } else {
      inst = { ...inst, value, selector, isEqual: isEqual ?? null }
      ref.current = inst
    }
  }
  return ref.current!.selected
}
