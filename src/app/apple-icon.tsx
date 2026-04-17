import { ImageResponse } from 'next/og';
import { AppIconArt } from '@/components/app-ui/app-icon-art';

export const contentType = 'image/png';
export const size = {
  height: 180,
  width: 180,
};

export default function AppleIcon() {
  return new ImageResponse(<AppIconArt />, size);
}
