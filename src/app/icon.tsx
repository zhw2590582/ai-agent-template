import { ImageResponse } from 'next/og';
import { AppIconArt } from '@/components/app-ui/app-icon-art';

export const contentType = 'image/png';
export const size = {
  height: 512,
  width: 512,
};

export default function Icon() {
  return new ImageResponse(<AppIconArt />, size);
}
