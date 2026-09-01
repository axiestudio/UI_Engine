// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/line-loading-timing.ts — fetched 2026-09-01
// Adapted: no import rewrites needed — "@/lib/utils" alias resolves via tsconfig paths + vite alias; "use client" directive stripped for library build
/** Grow + exit timeline for `LineLoadingPulse` (seconds). */
export const LINE_LOADING_PULSE_CYCLE_S = 2.2;

/** Idle gap before the loading line pulse restarts (milliseconds). */
export const LINE_LOADING_LOOP_PAUSE_MS = 280;

/** Loading label exit on loading → ready (seconds). */
export const LOADING_LABEL_EXIT_S = 0.45;

/** Loading label drops this many pixels while exiting. */
export const LOADING_LABEL_EXIT_Y_PX = 30;

export const LINE_LOADING_PULSE_EASE = [0.85, 0, 0.15, 1] as const;
