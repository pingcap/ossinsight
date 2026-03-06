import './style.scss';

export interface AvatarSkeletonProps {
  size?: number
}

export function AvatarSkeleton ({ size = 8 }: AvatarSkeletonProps) {
  const sizeValue = `${(size || 8) * 0.25}rem`;

  return (
    <span
      className='block rounded-full skeleton'
      style={{
        width: sizeValue,
        height: sizeValue,
        minWidth: sizeValue,
        minHeight: sizeValue,
        maxWidth: sizeValue,
        maxHeight: sizeValue,
      }}
    />
  )
}
