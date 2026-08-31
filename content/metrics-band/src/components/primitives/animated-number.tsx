/**
 * Vendored verbatim from motion-primitives by ibelick (MIT): components/core/animated-number.tsx
 * Snapshot: UI/_registry/motion-primitives/components-core/animated-number.tsx
 * Adapted for motion v13: the value text is driven via a MotionValue subscription
 * rendered into a plain element (no `motion.create` typing surface). Adds `decimals`.
 */
'use client';
import { useSpring, useTransform } from 'motion/react';
import type { SpringOptions } from 'motion/react';
import { useEffect, useState } from 'react';

export type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  className?: string;
  springOptions?: SpringOptions;
};

export function AnimatedNumber({ value, decimals = 0, className, springOptions }: AnimatedNumberProps) {
  const spring = useSpring(value, springOptions);
  const display = useTransform(spring, (current) =>
    Number(current).toFixed(decimals)
  );
  const [text, setText] = useState(display.get());

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => display.on('change', setText), [display]);

  return <span className={className}>{text}</span>;
}
