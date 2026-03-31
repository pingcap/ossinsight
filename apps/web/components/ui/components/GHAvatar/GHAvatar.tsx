import * as RuiAvatar from '@radix-ui/react-avatar';
import { AvatarSkeleton } from '../Skeleton';
import { twMerge } from 'tailwind-merge';

export interface GHAvatarProps {
  /** GitHub login name OR full avatar URL (avatars.githubusercontent.com/u/{id} or github.com/{login}.png) */
  name: string;
  /** Pixel size – common values: 16, 24, 32, 40, 48, 64 */
  size?: number;
  /** true = fully round (circle), false = rounded-[3px] square. Default true. */
  rounded?: boolean;
  /** Extra classes merged onto the <img> element */
  className?: string;
}

export function GHAvatar ({ name, size = 32, rounded = true, className }: GHAvatarProps) {
  const px = `${size}px`;

  return (
    <RuiAvatar.Root>
      <RuiAvatar.Fallback asChild>
        <AvatarSkeleton size={size / 4} />
      </RuiAvatar.Fallback>
      <RuiAvatar.Image
        className={twMerge(
          'block',
          rounded ? 'rounded-full' : 'rounded-[3px]',
          className,
        )}
        style={{
          width: px,
          height: px,
          minWidth: px,
          minHeight: px,
          maxWidth: px,
          maxHeight: px,
        }}
        src={resolveAvatarUrl(name)}
        alt={`Avatar for ${name}`}
      />
    </RuiAvatar.Root>
  );
}

/**
 * Accept:
 *  - a full URL (starts with http)  → pass through
 *  - a GitHub login or "owner/repo" → https://github.com/{login}.png
 */
function resolveAvatarUrl (name: string): string {
  if (name.startsWith('http://') || name.startsWith('https://')) {
    return name;
  }
  const login = name.split('/')[0];
  return `https://github.com/${login}.png`;
}
