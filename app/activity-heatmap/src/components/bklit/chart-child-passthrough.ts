// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/chart-child-passthrough.ts — fetched 2026-09-01
// Adapted: trimmed clip/underlay helpers not used by the heatmap family (kept resolveChartChildElement + markers)

import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

/** Marker on wrapper components whose single child should inherit clip classification. */
export const CHART_CLIP_PASSTHROUGH = "__chartClipPassthrough" as const;

export function isChartClipPassthrough(type: unknown): boolean {
  return (
    typeof type === "function" &&
    (type as { [CHART_CLIP_PASSTHROUGH]?: boolean })[CHART_CLIP_PASSTHROUGH] ===
      true
  );
}

/** Unwrap visibility wrappers so `Grid` / axes stay outside the series clip. */
export function resolveChartChildElement(child: ReactElement): ReactElement {
  if (isChartClipPassthrough(child.type)) {
    const inner = (child.props as { children?: unknown }).children;
    if (isValidElement(inner)) {
      return resolveChartChildElement(inner);
    }
  }
  return child;
}

/** Walk chart children, flattening React fragments (studio often groups layers in `<>...</>`). */
export function forEachChartChild(
  children: ReactNode,
  callback: (child: ReactElement, index: number) => void
) {
  let index = 0;
  const visit = (nodes: ReactNode) => {
    Children.forEach(nodes, (child) => {
      if (!isValidElement(child)) {
        return;
      }
      if (child.type === Fragment) {
        visit((child.props as { children?: ReactNode }).children);
        return;
      }
      callback(child, index);
      index += 1;
    });
  };
  visit(children);
}
