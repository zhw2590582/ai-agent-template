import { ImageResponse } from 'next/og';
import { PwaIconArt } from '@/components/app-ui/pwa-icon-art';

export const contentType = 'image/png';
export const size = {
  height: 180,
  width: 180,
};

export default function AppleIcon() {
  return new ImageResponse(<PwaIconArt />, size);
}
