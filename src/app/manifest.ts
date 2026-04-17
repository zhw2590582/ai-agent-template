import type { MetadataRoute } from 'next';

const APP_NAME = 'AI Agent Template';
const APP_DESCRIPTION = 'A general AI agent chat interface built with Next.js and AI SDK.';

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: '#0f1115',
    description: APP_DESCRIPTION,
    display: 'standalone',
    icons: [
      {
        purpose: 'maskable',
        sizes: '192x192',
        src: '/pwa-icon-192',
        type: 'image/png',
      },
      {
        sizes: '512x512',
        src: '/pwa-icon-512',
        type: 'image/png',
      },
    ],
    name: APP_NAME,
    orientation: 'portrait',
    short_name: 'AI Agent',
    start_url: '/',
    theme_color: '#0f1115',
  };
}
