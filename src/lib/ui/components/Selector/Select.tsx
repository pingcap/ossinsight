import * as SelectPrimitive from '@radix-ui/react-select';
import CheckIcon from 'bootstrap-icons/icons/check.svg';
import ChevronDownIcon from 'bootstrap-icons/icons/chevron-down.svg';
import ChevronUpIcon from 'bootstrap-icons/icons/chevron-up.svg';
import clsx from 'clsx';
import * as React from 'react';
import { ReactNode } from 'react';
import './style.scss';
import { Listbox, Transition } from '@headlessui/react';
import {
  ChevronUpIcon as GHChevronUpIcon,
  ChevronDownIcon as GHChevronDownIcon,
  CheckIcon as GHCheckIcon,
} from '@primer/octicons-react';

export const Select = React.forwardRef<
  HTMLButtonElement,
  SelectPrimitive.SelectProps & {
  id?: string
  label?: string | React.ReactNode;
  className?: string;
  placeholder?: string;
  renderValue?: (value: any) => ReactNode;
  startIcon?: ReactNode;
} & Pick<SelectPrimitive.SelectContentProps, 'position'>
>(({ id, children, className, position, placeholder, renderValue, startIcon, ...props }, forwardedRef) => {
  return (
    <div className={clsx('SelectWrapper', className)}>
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          className={clsx('SelectTrigger')}
          id={id}
          ref={forwardedRef}
        >
          {startIcon}
          {renderValue
            ? props.value == null ? <span className="text-content text-sm">{placeholder}</span> : renderValue(props.value)
            : <SelectPrimitive.Value placeholder={<span className="text-content text-sm">{placeholder}</span>} />}
          <SelectPrimitive.Icon className={clsx('SelectIcon')}>
            <ChevronDownIcon width={12} height={12} />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className={clsx('SelectContent z-10')} position={position}>
            <SelectPrimitive.ScrollUpButton
              className={clsx('SelectScrollButton')}
            >
              <ChevronUpIcon />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className={clsx('SelectViewport')}>
              {children}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton
              className={clsx('SelectScrollButton')}
            >
              <ChevronDownIcon width={12} height={12} />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
});

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectItemProps
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Item
      className={clsx('SelectItem', className)}
      {...props}
      ref={forwardedRef}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="SelectItemIndicator">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

export const SelectGroup = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectGroupProps & {
  label?: string | React.ReactNode;
}
>(({ children, label, className, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Group
      className={clsx('SelectGroup', className)}
      {...props}
      ref={forwardedRef}
    >
      {label && (
        <SelectPrimitive.Label className="SelectLabel">
          {label}
        </SelectPrimitive.Label>
      )}
      {children}
    </SelectPrimitive.Group>
  );
});

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  SelectPrimitive.SelectSeparatorProps
>(({ className, ...props }, forwardedRef) => {
  return (
    <SelectPrimitive.Separator
      className={clsx('SelectSeparator', className)}
      {...props}
      ref={forwardedRef}
    />
  );
});

export type SelectParamOption<K extends string | number = string> = {
  key: K;
  title: string | React.ReactNode;
  [key: string]: any;
};

export function HLSelect<T extends string | number = string>(props: {
  value: SelectParamOption<T>;
  onChange: (v: SelectParamOption<T>) => void;
  options: Array<SelectParamOption<T>>;
  startIcon?: ReactNode;
}) {
  const { value, onChange, options, startIcon } = props;

  return (
    <>
      <Listbox value={value} onChange={onChange}>
        <div className='relative mt-1'>
          <Listbox.Button className='relative w-full cursor-default rounded-lg bg-[var(--background-color-popover)] text-[var(--text-color-subtitle)] border border-[var(--selector-border-color)] py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'>
            <span className='inline-flex gap-2 truncate'>
              {startIcon}
              {value.title}
            </span>
            <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
              <GHChevronDownIcon
                className='h-5 w-5 text-gray-400'
                aria-hidden='true'
              />
            </span>
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave='transition ease-in duration-100'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Listbox.Options className='absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[var(--background-color-popover)] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm'>
              {options.map((opt) => (
                <Listbox.Option
                  key={opt.key}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-[var(--list-item-active)] text-[var(--text-color-active)]' : 'text-[var(--text-color-subtitle)]'
                    }`
                  }
                  value={opt}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {opt.title}
                      </span>
                      {selected ? (
                        <span className='absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600'>
                          <CheckIcon className='h-5 w-5' aria-hidden='true' />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </>
  );
}

export function useSimpleSelect<T extends number | string = string> (
  options: Array<SelectParamOption<T>>, // TODO support inheritance options, such as [[SelectParamOption<T>, SelectParamOption<T>], SelectParamOption<T>]
  defaultVal: SelectParamOption<T>,
  id?: string,
  startIcon?: ReactNode
) {
  const [value, setValue] = React.useState<string>(defaultVal.key.toString());

  const onChange = React.useCallback((v: string) => {
    setValue(v);
  }, []);

  const El = React.useMemo(() => {
    return (
      <>
        <Select
          id={id}
          defaultValue={defaultVal.key.toString()}
          onValueChange={onChange}
          startIcon={startIcon}
        >
          {options.map((option) => (
            <SelectItem key={option.key} value={option.key.toString()}>
              {option.title}
            </SelectItem>
          ))}
        </Select>
      </>
    );
  }, [options, value]);

  return {
    select: El,
    value,
  };
}
