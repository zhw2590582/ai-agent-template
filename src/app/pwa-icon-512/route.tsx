import { ImageResponse } from 'next/og';
import { PwaIconArt } from '@/components/app-ui/pwa-icon-art';

export async function GET() {
  return new ImageResponse(<PwaIconArt />, {
    height: 512,
    width: 512,
  });
}
