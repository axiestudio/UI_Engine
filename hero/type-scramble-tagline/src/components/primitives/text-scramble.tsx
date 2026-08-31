/**
 * Vendored verbatim from motion-primitives by ibelick (MIT): components/core/text-scramble.tsx
 * Adapted for motion v13: renders a plain element (no `motion.create` typing surface).
 */
'use client';
import { useEffect, useState } from 'react';
import * as React from 'react';

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
};

const defaultChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function TextScramble({ children, duration = 0.8, speed = 0.04, characterSet = defaultChars, className, as: Component = 'span', trigger = true, onScrambleComplete }: TextScrambleProps) {
  const [scrambledText, setScrambledText] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const text = children;
  const displayText = scrambledText ?? children;

  const scramble = async () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const steps = duration / speed;
    let step = 0;
    const interval = setInterval(() => {
      let scrambled = '';
      const progress = step / steps;
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') { scrambled += ' '; continue; }
        if (progress * text.length > i) { scrambled += text[i]; }
        else { scrambled += characterSet[Math.floor(Math.random() * characterSet.length)]; }
      }
      setScrambledText(scrambled);
      step++;
      if (step > steps) {
        clearInterval(interval);
        setScrambledText(text);
        setIsAnimating(false);
        onScrambleComplete?.();
      }
    }, speed * 1000);
  };

  useEffect(() => {
    if (trigger) scramble();
    return () => { setScrambledText(null); setIsAnimating(false); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);

  return <Component className={className}>{displayText}</Component>;
}
