// Vendored from Bklit UI (MIT) — https://github.com/bklit/bklit-ui · packages/ui/src/charts/reference-area-registration-context.tsx — fetched 2026-09-01
// Adapted: no import rewrites needed — "@/lib/utils" alias resolves via tsconfig paths + vite alias; "use client" directive stripped for library build
import { createContext, useContext } from "react";
import type { ReferenceAreaConfig } from "./reference-area-config";

export interface ReferenceAreaRegistrationContextValue {
  registerReferenceArea: (id: string, config: ReferenceAreaConfig) => void;
  unregisterReferenceArea: (id: string) => void;
}

export const ReferenceAreaRegistrationContext =
  createContext<ReferenceAreaRegistrationContextValue | null>(null);

export function useReferenceAreaRegistration(): ReferenceAreaRegistrationContextValue | null {
  return useContext(ReferenceAreaRegistrationContext);
}
