import { ChangeEvent, cloneElement, FocusEvent, MouseEvent, ReactElement, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { InputPopover, InputPopoverProps } from '../InputPopover';
import { RemoteSelectedItem } from './RemoteSelectedItem';
import { useRemoteList, UseRemoteListOptions } from './useRemoteList';

export interface RemoteSelectorProps<Item> extends UseRemoteListOptions<Item>, Pick<InputPopoverProps, 'popoverContentProps' | 'popoverPortalProps'> {
  value: Item[];

  getItemText?: (item: Item) => string;

  executeOnMount?: boolean;

  id?: string;

  onSelect? (item: Item | undefined, event: MouseEvent | null): void;

  renderInput (props: RemoteSelectorInputProps): ReactElement;

  renderSelectedItems? (item: Item[]): ReactElement;

  renderList? (props: RemoteSelectorListProps): ReactElement;

  renderListItem (props: RemoteSelectorListItemProps<Item>): ReactElement;

  renderLoading? (): ReactElement;

  renderEmpty? (): ReactElement;

  renderError? (error: unknown): ReactElement;

  equals?: (item: Item, Item: Item) => boolean;

  isMultiSelect?: boolean;

  inputPrefix?: string;

  filterResults?: (items: Item[]) => Item[];

  executeOnMountQuery?: string;
}

export interface RemoteSelectorInputProps {
  id?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onFocus: (event: FocusEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface RemoteSelectorListProps {
  children: ReactNode;
}

export interface RemoteSelectorListItemProps<Item> {
  item: Item;
  disabled: boolean;
  selected: boolean;
  onClick: (event: MouseEvent) => void;
}

export function RemoteSelector<Item> ({
  value,
  getRemoteOptions,
  executeOnMount = false,
  executeOnMountQuery = '',
  id,
  renderInput,
  renderSelectedItems,
  renderList = defaultRenderList,
  renderListItem,
  renderLoading = defaultRenderLoading,
  renderEmpty = defaultRenderEmpty,
  renderError = defaultRenderError,
  onSelect,
  popoverContentProps,
  popoverPortalProps,
  equals = Object.is,
  getItemText = String,
  isMultiSelect = false,
  inputPrefix = '',
  filterResults = (items: Item[]) => items,
}: RemoteSelectorProps<Item>) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [input, setInput] = useState(() => value[0] && getItemText(value[0]) || '');
  const { items, reload, error, loading } = useRemoteList({ getRemoteOptions });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (executeOnMount) {
      reload(inputPrefix + input || executeOnMountQuery);
    }
  }, []);

  const onInputChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    setInput(value);
    reload(inputPrefix + value);
  }, []);

  const onInputFocus = useCallback((ev: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
  }, []);

  const onInputBlur = useCallback((ev: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const handleClearSelect = useCallback(() => {
    onSelect?.(undefined, null);
    setInput('');
    reload(inputPrefix + '');
    setOpen(true);
  }, [onSelect]);

  useEffect(() => {
    if (!open && !focused) {
      setInput('');
    }
  }, [!open && !focused]);

  const renderChildren = () => {
    if (error) {
      return renderError(error);
    }
    if (loading) {
      return renderLoading();
    }
    if (filterResults(items).length === 0) {
      return renderEmpty();
    }

    const makeHandleSelectItem = (item: Item) => (ev: MouseEvent) => {
      onSelect?.(item, ev);
      setOpen(false);
    };

    return renderList({
      children: filterResults(items).map(item => (
        renderListItem({
          item,
          disabled: false,
          selected: !!value.find(v => equals(v, item)),
          onClick: makeHandleSelectItem(item),
        })
      )),
    });
  };

  if (value.length > 0 && !isMultiSelect) {
    if (!renderSelectedItems) {
      return defaultRenderSelectedItem({ item: value[0], getItemText, onClear: handleClearSelect });
    }
    return renderSelectedItems(value);
  } else if (value.length > 0 && isMultiSelect) {
    return (
      <>
        {renderSelectedItems && renderSelectedItems(value)}
        <InputPopover
          open={open}
          onOpenChange={onOpenChange}
          input={cloneElement(
            renderInput({
              id,
              value: input,
              onChange: onInputChange,
              onFocus: onInputFocus,
              onBlur: onInputBlur,
            }),
            { ref: inputRef }
          )}
          popperContent={renderChildren()}
          popoverPortalProps={popoverPortalProps}
          popoverContentProps={popoverContentProps}
        />
      </>
    );
  }
  else {
    return (
      <InputPopover
        open={open}
        onOpenChange={onOpenChange}
        input={cloneElement(renderInput({ id, value: input, onChange: onInputChange, onFocus: onInputFocus, onBlur: onInputBlur }), { ref: inputRef })}
        popperContent={renderChildren()}
        popoverPortalProps={popoverPortalProps}
        popoverContentProps={popoverContentProps}
      />
    );
  }
}

function defaultRenderSelectedItem<Item> ({ id, item, onClear, getItemText }: { id?: string, item: Item, getItemText: (item: Item) => string, onClear: () => void }) {
  return (
    <RemoteSelectedItem id={id} onClear={onClear}>
      <span className="text-subtitle text-xs">
        {getItemText(item)}
      </span>
    </RemoteSelectedItem>
  );
}

function defaultRenderList ({ children }: RemoteSelectorListProps) {
  return (
    <ul>
      {children}
    </ul>
  );
}

function defaultRenderLoading () {
  return <div className="py-1 px-2 text-disabled text-xs">Loading...</div>;
}

function defaultRenderEmpty () {
  return <div className="py-1 px-2 text-disabled text-xs">Empty result</div>;
}

function defaultRenderError (error: unknown) {
  return <div className="py-1 px-2 text-content text-xs">Failed to load</div>;
}

const prevent = (ev: Event) => ev.preventDefault();
