import type { ReactElement } from 'react';
import { PWA_ICON_COLORS } from '@/components/app-ui/pwa-icon-art';

export function SeoShareImageArt(): ReactElement {
  return (
    <div
      style={{
        alignItems: 'stretch',
        background: `linear-gradient(135deg, ${PWA_ICON_COLORS.background} 0%, #18212f 58%, #0b1220 100%)`,
        color: PWA_ICON_COLORS.foreground,
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
        overflow: 'hidden',
        padding: '64px 72px',
        position: 'relative',
        width: '100%',
      }}
    >
      <div
        style={{
          background: 'rgba(34, 197, 94, 0.14)',
          border: `6px solid ${PWA_ICON_COLORS.accent}`,
          borderRadius: 44,
          height: 420,
          position: 'absolute',
          right: -90,
          top: -88,
          transform: 'rotate(-12deg)',
          width: 420,
        }}
      />
      <div
        style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: `4px solid ${PWA_ICON_COLORS.accent}`,
          borderRadius: 36,
          bottom: -120,
          height: 300,
          left: -40,
          position: 'absolute',
          transform: 'rotate(10deg)',
          width: 300,
        }}
      />

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'space-between',
          maxWidth: 760,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            alignItems: 'center',
            color: '#9ca3af',
            display: 'flex',
            fontFamily: 'Arial, sans-serif',
            fontSize: 30,
            fontWeight: 700,
            gap: 18,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              background: PWA_ICON_COLORS.accent,
              borderRadius: 999,
              display: 'flex',
              height: 12,
              width: 12,
            }}
          />
          Open Source Template
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              color: PWA_ICON_COLORS.foreground,
              display: 'flex',
              fontFamily: 'Arial, sans-serif',
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: '-0.06em',
              lineHeight: 0.95,
            }}
          >
            AI Agent Template
          </div>
          <div
            style={{
              color: '#d1d5db',
              display: 'flex',
              fontFamily: 'Arial, sans-serif',
              fontSize: 34,
              lineHeight: 1.3,
              maxWidth: 720,
            }}
          >
            Next.js + AI SDK starter with local-first chat, Memory, Search, Sandbox, RAG, MCP, and
            Subagents.
          </div>
        </div>

        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            gap: 16,
          }}
        >
          {['Memory', 'Search', 'Sandbox', 'RAG', 'MCP', 'Subagents'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 999,
                color: '#e5e7eb',
                display: 'flex',
                fontFamily: 'Arial, sans-serif',
                fontSize: 24,
                fontWeight: 600,
                padding: '12px 18px',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
