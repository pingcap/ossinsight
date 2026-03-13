import clsx from 'clsx';
import { BuiltinProps, useTheme } from './common';
import { getGHSvg, getFilledSvg } from './GHSvg';

export function AvatarLabel ({
  className,
  style,
  label = '',
  imgSrc = '',
  imgSize = 20,
  imgProps = {},
  colorScheme,
  href = '',
}: BuiltinProps<'builtin:avatar-label'>) {
  const { Label } = useTheme(colorScheme);

  return (
    <Wrapper
      className={clsx(className, 'flex flex-row items-center', {
        ['gap-1']: !!label,
      })}
      style={style}
      href={href}
    >
      <div
        className={clsx(
          `bg-blackA3 inline-flex select-none items-center justify-center overflow-hidden rounded-full align-middle`,
        )}
        style={{
          height: `${imgSize}px`,
          width: `${imgSize}px`,
        }}
      >
        {imgSrc && <CustomIcon src={imgSrc} alt={label} svgProps={imgProps} />}
      </div>
      <span
        style={{
          fontSize: 12,
          lineHeight: 1,
          fontWeight: 'bold',
          color: Label.color,
        }}
      >
        {label}
      </span>
    </Wrapper>
  );
}

const CustomIcon = (props: { src: string; alt: string; svgProps?: any }) => {
  const { src, alt, svgProps = {} } = props;

  if (src.startsWith('gh-')) {
    const El = getGHSvg(src as any) as any;
    return <El {...svgProps} />;
  }

  if (src.startsWith('filled-')) {
    const El = getFilledSvg(src) as any;
    return <El {...svgProps} />;
  }

  return (
    <img
      className='h-full w-full rounded-[inherit] object-cover'
      src={src}
      alt={alt}
    />
  );
};

export const Wrapper = (
  props: {
    children: React.ReactNode;
    href?: string;
  } & React.HTMLAttributes<HTMLDivElement | HTMLAnchorElement>,
) => {
  const { children, href, ...rest } = props;

  if (href) {
    return (
      <a href={href} target="_blank" {...rest}>
        {children}
      </a>
    );
  }

  if (rest) {
    return <div {...rest}>{children}</div>;
  }

  return <>{children}</>;
};
