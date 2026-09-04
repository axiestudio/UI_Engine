/**
 * Vendored verbatim from motion-primitives (https://motion-primitives.com) by ibelick.
 * Upstream: https://github.com/ibelick/motion-primitives/blob/main/components/core/in-view.tsx
 * Fetched 2026-08-29 from main branch. Do not edit unless intentionally adopting upstream changes.
 */
'use client';
// Local patch for workspace tsconfig (verbatimModuleSyntax): type-only imports only, no behavior change.
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useInView, type Variant, type Transition, type UseInViewOptions,  } from 'motion/react';

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  once?: boolean;
  delay?: number;
  className?: string;
};

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function InView({
  children,
  variants = defaultVariants,
  transition,
  delay,
  viewOptions,
  as = 'div',
  once
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);

  const [isViewed, setIsViewed] = useState(false)

  const MotionComponent = useMemo(
    () => motion[as as keyof typeof motion] as typeof as,
    [as]
  );

  return (
    <MotionComponent
      ref={ref}
      initial='hidden'
      onAnimationComplete={() => {
        if (once && !isViewed) setIsViewed(true)
      }}
      animate={(isInView || isViewed) ? "visible" : "hidden"}

      variants={variants}
      transition={delay !== undefined ? { ...transition, delay } : transition}
    >
      {children}
    </MotionComponent>
  );
}
