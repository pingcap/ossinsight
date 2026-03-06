import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import InfoCircle from 'bootstrap-icons/icons/info-circle.svg';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InfoTooltipProps {
  delayDuration?: number;
  Icon?: React.FC<
    React.SVGAttributes<SVGSVGElement> & React.RefAttributes<SVGSVGElement>
  >;
  iconElement?: React.ReactNode;
  rootProps?: Omit<Tooltip.TooltipProps, 'delayDuration'>;
  triggerProps?: Tooltip.TooltipTriggerProps;
  portalProps?: Tooltip.TooltipPortalProps;
  contentProps?: Tooltip.TooltipContentProps;
  arrowProps?: Tooltip.TooltipArrowProps;
  iconProps?: React.ComponentPropsWithoutRef<'svg'>;
  children?: React.ReactNode;
}

export const InfoTooltip = (props: InfoTooltipProps) => {
  const {
    delayDuration = 0,
    iconProps,
    rootProps,
    triggerProps,
    portalProps,
    contentProps: { className: contentClasses, ...restContentProps } = {},
    arrowProps,
    children,
  } = props;

  return (
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={delayDuration} {...rootProps}>
        <Tooltip.Trigger asChild {...triggerProps}>
          {props?.iconElement ? (
            props.iconElement
          ) : props?.Icon ? (
            <props.Icon {...iconProps} />
          ) : (
            <InfoCircle {...iconProps} />
          )}
        </Tooltip.Trigger>
        <Tooltip.Portal {...portalProps}>
          <Tooltip.Content
            className={twMerge(
              'data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade text-violet11 select-none rounded-[4px] bg-white px-[15px] py-[10px] text-[15px] leading-none shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] will-change-[transform,opacity]',
              contentClasses
            )}
            sideOffset={5}
            {...restContentProps}
          >
            {children}
            <Tooltip.Arrow {...arrowProps} className={twMerge('fill-white', arrowProps?.className)}/>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
