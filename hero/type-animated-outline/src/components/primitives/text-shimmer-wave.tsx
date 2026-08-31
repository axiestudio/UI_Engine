'use client';
import * as React from 'react';
import { motion } from 'motion/react';
import type { Transition } from 'motion/react';
import { cn } from '@/lib/utils';

export type TextShimmerWaveProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  zDistance?: number;
  xDistance?: number;
  yDistance?: number;
  spread?: number;
  scaleDistance?: number;
  rotateYDistance?: number;
  transition?: Transition;
};

export function TextShimmerWave({
  children,
  className,
  duration = 1,
  zDistance = 10,
  xDistance = 2,
  yDistance = -2,
  spread = 1,
  scaleDistance = 1.1,
  rotateYDistance = 10,
  transition,
}: TextShimmerWaveProps) {
  return (
    <motion.span
      className={cn(
        'relative inline-block [perspective:500px]',
        'text-transparent',
        className
      )}
      style={{ WebkitTextStroke: `1.5px hsl(var(--foreground) / 0.85)` }}
    >
      {children.split('').map((char, i) => {
        const delay = (i * duration * (1 / spread)) / children.length;
        return (
          <motion.span
            key={i}
            className="inline-block whitespace-pre [transform-style:preserve-3d]"
            initial={{ translateZ: 0, scale: 1, rotateY: 0, opacity: 1 }}
            animate={{ translateZ: zDistance, scale: scaleDistance, rotateY: rotateYDistance, opacity: 0.85 }}
            transition={{ duration, delay, repeat: Infinity, repeatType: 'mirror', ease: transition ? transition.ease : 'easeInOut' } as Transition}
          >
            <motion.span
              className="inline-block"
              animate={{ x: xDistance, y: yDistance }}
              transition={{ duration, delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } as Transition}
            >
              {char}
            </motion.span>
          </motion.span>
        );
      })}
    </motion.span>
  );
}
