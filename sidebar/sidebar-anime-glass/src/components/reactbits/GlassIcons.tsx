/**
 * Vendored from React Bits registry: https://reactbits.dev/r/GlassIcons-TS-TW.json
 * Item: GlassIcons-TS-TW. Snapshot: UI/_registry/react-bits/r/GlassIcons-TS-TW.json
 *
 * Local craft change (workspace tokenization contract): upstream's demo
 * gradientMapping hardcoded hsl() hexes — replaced by the preset's own
 * --glass-1..6 token ramps, so tiles follow the per-preset palette in both
 * light and dark hosts. Everything else stays byte-identical upstream.
 */
import React from 'react';

export interface GlassIconsItem {
  icon: React.ReactElement;
  color: string;
  label: string;
  customClass?: string;
}

export interface GlassIconsProps {
  items: GlassIconsItem[];
  className?: string;
}

const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(hsl(var(--glass-1)), hsl(var(--glass-1) / 0.62))',
  purple: 'linear-gradient(hsl(var(--glass-2)), hsl(var(--glass-2) / 0.62))',
  red: 'linear-gradient(hsl(var(--glass-3)), hsl(var(--glass-3) / 0.62))',
  indigo: 'linear-gradient(hsl(var(--glass-4)), hsl(var(--glass-4) / 0.62))',
  orange: 'linear-gradient(hsl(var(--glass-5)), hsl(var(--glass-5) / 0.62))',
  green: 'linear-gradient(hsl(var(--glass-6)), hsl(var(--glass-6) / 0.62))'
};

const GlassIcons: React.FC<GlassIconsProps> = ({ items, className }) => {
  const getBackgroundStyle = (color: string): React.CSSProperties => {
    if (gradientMapping[color]) {
      return { background: gradientMapping[color] };
    }
    return { background: color };
  };

  return (
    <div className={`grid gap-[5em] grid-cols-2 md:grid-cols-3 mx-auto py-[3em] overflow-visible ${className || ''}`}>
      {items.map((item, index) => (
        <button
          key={index}
          type="button"
          aria-label={item.label}
          className={`relative bg-transparent outline-none border-none cursor-pointer w-[4.5em] h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group ${
            item.customClass || ''
          }`}
        >
          <span
            className="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"
            style={{
              ...getBackgroundStyle(item.color),
              boxShadow: '0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15)'
            }}
          ></span>

          <span
            className="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.15)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform group-hover:[transform:translate3d(0,0,2em)]"
            style={{
              boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset'
            }}
          >
            <span className="m-auto flex h-[1.5em] w-[1.5em] items-center justify-center text-white" aria-hidden="true">
              {item.icon}
            </span>
          </span>

          <span className="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-base opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)]">
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default GlassIcons;

