import Image from 'next/image';
import { ConfigIconType } from '../../types/ui-config';

export interface SiteConfigIconProps {
  icon: ConfigIconType;
  width?: number;
  height?: number;
  alt?: string;
}

export function SiteConfigIcon ({ icon: Icon, alt, width, height }: SiteConfigIconProps) {
  if (typeof Icon === 'string') {
    if (!height || !width) {
      throw new Error('widget and height is required for static image.');
    }
    return <Image src={Icon} alt={alt ?? Icon} width={width} height={height} />;
  } else if ('src' in Icon) {
    if (!height) {
      throw new Error('height is required for dynamic image.');
    }
    return <Image src={Icon} alt={alt ?? Icon.src} width={height / Icon.height * Icon.width} height={height} />;
  } else {
    return <Icon width={width} height={height} />;
  }
}
