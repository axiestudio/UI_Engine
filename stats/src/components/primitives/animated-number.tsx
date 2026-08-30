/**
 * Vendored verbatim from motion-primitives (https://motion-primitives.com) by ibelick (MIT).
 * Upstream: https://github.com/ibelick/motion-primitives/blob/main/components/core/animated-number.tsx
 * Fetched 2026-08-30 from main branch. Do not edit unless intentionally adopting upstream changes.
 */
'use client';
import { cn } from '@/lib/utils';
import { motion, type SpringOptions, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  as?: React.ElementType;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
  as = 'span',
}: AnimatedNumberProps) {
  // Local compat patch (React 19 types): cast via string; no behavior change.
  const MotionComponent = motion.create(as as string) as unknown as React.ElementType;

  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <MotionComponent className={cn('tabular-nums', className)}>
      {display}
    </MotionComponent>
  );
}
