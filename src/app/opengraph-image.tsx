import { ImageResponse } from 'next/og';
import { SeoShareImageArt } from '@/components/app-ui/seo-share-image-art';

export const alt = 'AI Agent Template preview image';
export const contentType = 'image/png';
export const size = {
  height: 630,
  width: 1200,
};

export default function OpenGraphImage() {
  return new ImageResponse(<SeoShareImageArt />, size);
}
