import * as RuiAvatar from '@radix-ui/react-avatar';
import { AvatarSkeleton } from '../Skeleton';

export interface GHAvatarProps {
  name: string;
  size: number;
}

export function GHAvatar ({ name, size = 8 }: GHAvatarProps) {
  const sizeValue = `${(size || 8) * 0.25}rem`;

  return (
    <RuiAvatar.Root>
      <RuiAvatar.Fallback asChild>
        <AvatarSkeleton size={size} />
      </RuiAvatar.Fallback>
      <RuiAvatar.Image
        className={`block rounded-full`}
        style={{
          width: sizeValue,
          height: sizeValue,
          minWidth: sizeValue,
          minHeight: sizeValue,
          maxWidth: sizeValue,
          maxHeight: sizeValue,
        }}
        src={getAvatarUrl(name)}
        alt={`Avatar for ${name}`}
      />
    </RuiAvatar.Root>
  );
}

function getAvatarUrl (name: string) {
  name = name.split('/')[0];
  return `https://github.com/${name}.png`;
}
