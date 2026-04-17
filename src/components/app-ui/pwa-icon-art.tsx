import type { ReactElement } from 'react';

export const PWA_ICON_COLORS = {
  background: '#0f1115',
  foreground: '#f8fafc',
  accent: '#22c55e',
} as const;

interface PwaIconArtProps {
  label?: string;
}

export function PwaIconArt({ label = 'AI' }: PwaIconArtProps): ReactElement {
  return (
    <div
      style={{
        alignItems: 'center',
        background: `linear-gradient(135deg, ${PWA_ICON_COLORS.background} 0%, #1b2230 65%, #111827 100%)`,
        color: PWA_ICON_COLORS.foreground,
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          border: `18px solid ${PWA_ICON_COLORS.accent}`,
          borderRadius: '22%',
          height: '74%',
          opacity: 0.9,
          position: 'absolute',
          width: '74%',
        }}
      />
      <div
        style={{
          display: 'flex',
          fontFamily: 'Arial, sans-serif',
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: '-0.08em',
          lineHeight: 1,
          position: 'relative',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );
}
