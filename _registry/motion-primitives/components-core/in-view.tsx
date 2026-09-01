'use client';
import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, useInView } from 'motion/react';
import type { Variant, Transition, UseInViewOptions } from 'motion/react';

export type InViewProps = {
  children: ReactNode;
  variants?: {
    hidden: Variant;
    visible: Variant;
  };
  transition?: Transition;
  viewOptions?: UseInViewOptions;
  as?: React.ElementType;
  once?: boolean
  delay?: number
  className?: string
};

const defaultVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export function InView({
  children,
  variants = defaultVariants,
  transition,
  viewOptions,
  as = 'div',
  once,
  delay = 0,
  className
}: InViewProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewOptions);
  const reduce = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const [isViewed, setIsViewed] = useState(false)

  const MotionComponent = motion[as as keyof typeof motion] as typeof as;

  return (
    <MotionComponent
      ref={ref}
      initial={reduce ? 'visible' : 'hidden'}
      onAnimationComplete={() => {
        if (once) setIsViewed(true)
      }}
      animate={(isInView || isViewed) ? "visible" : "hidden"}

      variants={variants}
      transition={reduce ? { duration: 0 } : { ...transition, delay }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}
