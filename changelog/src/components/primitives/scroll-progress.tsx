'use client';

import { motion, type SpringOptions, useScroll, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';
import { type RefObject } from 'react';

export type ScrollProgressProps = {
  className?: string;
  springOptions?: SpringOptions;
  containerRef?: RefObject<HTMLDivElement>;
};

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  stiffness: 200,
  damping: 50,
  restDelta: 0.001,
};

export function ScrollProgress({
  className,
  springOptions,
  containerRef,
}: ScrollProgressProps) {
  // Local compat patch: motion v13 removed UseScrollOptions.layoutEffect.
  const { scrollYProgress } = useScroll({
    container: containerRef,
  } as Parameters<typeof useScroll>[0]);

  const scaleX = useSpring(scrollYProgress, {
    ...DEFAULT_SPRING_OPTIONS,
    ...(springOptions ?? {}),
  });

  return (
    <motion.div
      className={cn('inset-x-0 top-0 h-1 origin-left', className)}
      style={{
        scaleX,
      }}
    />
  );
}
