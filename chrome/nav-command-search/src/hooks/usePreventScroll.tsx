/**
 * Vendored from motion-primitives (https://motion-primitives.com) by ibelick (MIT): hooks/usePreventScroll.tsx
 * Snapshot: UI/_registry/motion-primitives/hooks/usePreventScroll.tsx
 */
'use client';

import { useEffect } from 'react';

type UsePreventScrollOptions = {
  /** When true, body scroll is locked. */
  isDisabled?: boolean;
};

/**
 * Locks page scroll while the dialog is open — keeps mobile (iOS) from
 * rubber-banding the page behind a modal surface.
 */
export function usePreventScroll({ isDisabled = false }: UsePreventScrollOptions = {}) {
  useEffect(() => {
    if (isDisabled) return;
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isDisabled]);
}
