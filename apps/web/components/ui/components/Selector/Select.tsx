import * as React from 'react';
import { ReactNode } from 'react';
import {
  Select as UISelect,
  SelectContent as UISelectContent,
  SelectGroup as UISelectGroup,
  SelectItem as UISelectItem,
  SelectLabel as UISelectLabel,
  SelectSeparator as UISelectSeparator,
  SelectTrigger as UISelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const Select = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof UISelect> & {
  id?: string
  label?: string | React.ReactNode;
  className?: string;
  placeholder?: string;
  renderValue?: (value: any) => ReactNode;
  startIcon?: ReactNode;
} & Pick<React.ComponentProps<typeof UISelectContent>, 'position'>
>(({ id, children, className, position, placeholder, renderValue, startIcon, ...props }, forwardedRef) => {
  const isBorderless = className?.split(/\s+/).includes('Select-borderless');

  return (
    <div className={cn('SelectWrapper', className)}>
      <UISelect {...props}>
        <UISelectTrigger
          className={cn(
            'w-full min-w-[7rem] text-active',
            !isBorderless && 'bg-input shadow-sm hover:bg-accent/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20',
            isBorderless && 'h-auto min-h-0 w-auto border-0 bg-transparent px-1.5 py-0 text-active shadow-none hover:bg-transparent focus-visible:border-transparent focus-visible:ring-0'
          )}
          id={id}
          ref={forwardedRef}
        >
          {startIcon ? <span className="text-content">{startIcon}</span> : null}
          {renderValue
            ? props.value == null
              ? <span className="text-content text-sm">{placeholder}</span>
              : renderValue(props.value)
            : <SelectValue placeholder={placeholder ? <span className="text-content text-sm">{placeholder}</span> : undefined} />}
        </UISelectTrigger>
        <UISelectContent
          className="z-10 min-w-[10rem] rounded-md border border-border bg-popover p-1 text-subtitle shadow-[0_18px_40px_-24px_rgba(0,0,0,0.85)]"
          position={position}
        >
          {children}
        </UISelectContent>
      </UISelect>
    </div>
  );
});

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof UISelectItem>
>(({ children, className, ...props }, forwardedRef) => {
  return (
    <UISelectItem
      className={cn(
        'rounded px-3 py-2 text-sm text-subtitle outline-none transition-colors focus:bg-accent focus:text-active data-[state=checked]:text-active',
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </UISelectItem>
  );
});

export const SelectGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof UISelectGroup> & {
  label?: string | React.ReactNode;
}
>(({ children, label, className, ...props }, forwardedRef) => {
  return (
    <UISelectGroup
      className={cn('p-1', className)}
      {...props}
      ref={forwardedRef}
    >
      {label && (
        <UISelectLabel className="px-3 py-1 text-xs text-content">
          {label}
        </UISelectLabel>
      )}
      {children}
    </UISelectGroup>
  );
});

export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof UISelectSeparator>
>(({ className, ...props }, forwardedRef) => {
  return (
    <UISelectSeparator
      className={cn('my-1 bg-border/80', className)}
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
    <Select
      value={value.key.toString()}
      onValueChange={(v) => {
        const opt = options.find(o => o.key.toString() === v);
        if (opt) onChange(opt);
      }}
      startIcon={startIcon}
    >
      {options.map((opt) => (
        <SelectItem key={opt.key} value={opt.key.toString()}>
          {opt.title}
        </SelectItem>
      ))}
    </Select>
  );
}

export function useSimpleSelect<T extends number | string = string> (
  options: Array<SelectParamOption<T>>,
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
    );
  }, [defaultVal, id, onChange, options, startIcon, value]);

  return {
    select: El,
    value,
  };
}
