import { ImageResponse } from 'next/og';
import { PwaIconArt } from '@/components/app-ui/pwa-icon-art';

export const contentType = 'image/png';
export const size = {
  height: 512,
  width: 512,
};

export default function Icon() {
  return new ImageResponse(<PwaIconArt />, size);
}
