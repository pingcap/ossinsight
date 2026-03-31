import { RemoteSelector, RemoteSelectorProps } from '../RemoteSelector';
import { GHRepoItem } from './GHRepoItem';
import { GHRepoListItem } from './GHRepoListItem';
import {
  getRepoText,
  isRepoEquals,
  searchRepo,
  getRepoListByOrgId,
} from './utils';
import type { RemoteRepoInfo } from './GHRepoSelector';
import * as React from 'react';
import {
  RepoIcon,
  SearchIcon,
  ChevronDownIcon,
} from '@primer/octicons-react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface GHOrgRepoSelectorProps
  extends Pick<RemoteSelectorProps<any>, 'id' | 'renderInput'> {
  repos: RemoteRepoInfo[];
  onRepoSelected: (repo: RemoteRepoInfo | undefined) => void;
  onRepoRemoved?: (repo: RemoteRepoInfo) => void;
  compat?: boolean;
  maxItems?: number;
  orgName: string;
  disableInput?: boolean;
}

export function GHOrgRepoSelector({
  repos,
  onRepoSelected,
  onRepoRemoved,
  compat,
  renderInput,
  maxItems = 2,
  orgName,
  disableInput = false,
  ...props
}: GHOrgRepoSelectorProps) {
  return (
    <RemoteSelector<RemoteRepoInfo>
      {...props}
      renderInput={(params) =>
        renderInput({
          disabled: disableInput || repos.length >= maxItems,
          placeholder:
            repos.length >= maxItems
              ? `Max ${maxItems} repos`
              : `${orgName}/...`,
          ...params,
        })
      }
      getItemText={getRepoText}
      value={repos}
      onSelect={onRepoSelected}
      getRemoteOptions={searchRepo}
      isMultiSelect
      renderSelectedItems={(items) => {
        return (
          <>
            {items.map((item) => (
              <GHRepoItem
                key={item.id}
                id={props.id}
                item={item}
                compat={compat}
                onClear={() => onRepoRemoved && onRepoRemoved(item)}
              />
            ))}
          </>
        );
      }}
      renderListItem={(props) => (
        <GHRepoListItem key={props.item.id} {...props} />
      )}
      equals={isRepoEquals}
      inputPrefix={`${orgName}/`}
      filterResults={(items) => {
        return items.filter((item) => item.fullName.startsWith(`${orgName}/`));
      }}
      executeOnMount
      executeOnMountQuery={`${orgName}/`}
    />
  );
}

function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className='border-b border-white/8 p-2'>
      <label
        htmlFor='repo-search'
        className='hidden text-sm font-medium leading-6 text-gray-900'
      >
        Search
      </label>
      <div className='relative m-2'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <SearchIcon className='h-4 w-4 text-[#87879a]' aria-hidden='true' />
        </div>
        <Input
          type='text'
          name='repo-search'
          id='repo-search'
          className='pl-10'
          placeholder='Search repo...'
          {...props}
        />
      </div>
    </div>
  );
}

const allItem = { id: 0, name: 'All repositories' };

const parseItemsLength = (sum: number, max = 99, maxLabel = '99+') => {
  return sum.toFixed(0);
  // return sum > max ? maxLabel : sum.toFixed(0);
};

type ItemType = {
  id: number;
  name: string;
  fullName: string;
};

export function HLGHOrgRepoSelectorTemplate(props: {
  repos: ItemType[];
  maxSelected?: number;
  defaultSelectedItems?: ItemType[];
  // onChange?: (items: ItemType[]) => void;
  onComplete?: (items: ItemType[]) => void;
  disabled?: boolean;
}) {
  const {
    repos,
    maxSelected = 100,
    defaultSelectedItems = [],
    // onChange = (r) => {},
    onComplete = (r) => {},
    disabled,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [selectedItems, setSelectedItems] =
    React.useState<ItemType[]>(defaultSelectedItems);
  const selectedItemsRef = React.useRef(selectedItems);
  selectedItemsRef.current = selectedItems;
  const [text, setText] = React.useState('');
  const deferredText = React.useDeferredValue(text);

  const closedBySelectionRef = React.useRef(false);
  const handleOpenChange = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      if (closedBySelectionRef.current) {
        closedBySelectionRef.current = false;
      } else {
        onComplete(selectedItemsRef.current);
      }
    }
  }, [onComplete]);

  const filteredReposMemo = React.useMemo(() => {
    return repos.filter((r) => r.name.includes(deferredText));
  }, [repos, deferredText]);

  const isMax = React.useMemo(() => {
    return selectedItems.length >= maxSelected;
  }, [selectedItems, maxSelected]);

  const closeWithSelection = React.useCallback((items: ItemType[]) => {
    selectedItemsRef.current = items;
    setSelectedItems(items);
    closedBySelectionRef.current = true;
    setOpen(false);
    onComplete(items);
  }, [onComplete]);

  const renderRow = (props: ListChildComponentProps) => {
    const { index, style } = props;

    const itemMemo = React.useMemo(() => {
      return filteredReposMemo[index];
    }, [filteredReposMemo, index]);
    const isDisabledMemo = React.useMemo(() => {
      return isMax && !selectedItems.includes(itemMemo);
    }, [isMax, selectedItems, itemMemo]);
    const isSelectedMemo = React.useMemo(() => {
      return selectedItems.includes(itemMemo);
    }, [selectedItems]);

    const handleClickCallback = React.useCallback(() => {
      if (isDisabledMemo) return;
      if (isSelectedMemo) {
        setSelectedItems(selectedItems.filter((i) => i.id !== itemMemo.id));
      } else {
        setSelectedItems([...selectedItems, itemMemo]);
      }
    }, [isDisabledMemo, isSelectedMemo, selectedItems, itemMemo]);

    return (
      <div
        style={style}
        key={index}
        className={`relative cursor-default select-none py-2.5 pl-10 pr-4 text-left text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-slate-100 ${
          isDisabledMemo ? 'disabled opacity-50' : ''
        }`}
        onClick={handleClickCallback}
      >
        <>
          <span
            className={`block truncate ${
              isSelectedMemo ? 'font-medium' : 'font-normal'
            }`}
          >
            {itemMemo.name}
          </span>
          <input
            type='checkbox'
            checked={isSelectedMemo}
            disabled={isDisabledMemo}
            tabIndex={isDisabledMemo ? -1 : 0}
            readOnly
            className='absolute inset-y-0 left-0 ml-3 mt-3 h-4 w-4 rounded border-white/20 accent-[var(--selector-fill-color)]'
          />
        </>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          disabled={disabled}
          variant='outline'
          size='lg'
          className='w-[260px] max-w-[260px] justify-between rounded-md border-white/10 bg-white/[0.03] px-3 text-slate-200 hover:border-white/25 hover:bg-white/[0.06]'
          style={{ width: 260, maxWidth: 260 }}
        >
          <span className='flex items-center min-w-0 overflow-hidden'>
            <RepoIcon className='mr-2 flex-shrink-0 text-[#e9eaee]' />
            <span className='truncate'>
              {selectedItems.length === 0
                ? allItem.name
                : selectedItems.map((i) => i.name).join(', ')}
            </span>
          </span>
          <span className='flex items-center gap-1 ml-2 flex-shrink-0'>
            <span className='rounded-full bg-[var(--selector-fill-color)] px-1.5 py-0.5 text-[11px] font-medium text-white'>
              {selectedItems.length === 0
                ? 'All'
                : parseItemsLength(selectedItems.length)}
            </span>
            <ChevronDownIcon
              className='h-4 w-4 text-[#9fa1ad]'
              aria-hidden='true'
            />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align='start'
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={() => handleOpenChange(false)}
        onEscapeKeyDown={() => handleOpenChange(false)}
        className='z-50 w-[400px] max-w-[min(24rem,calc(100vw-1rem))] overflow-hidden p-0'
      >
        {/* -- search input -- */}
        <SearchInput
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {/* -- default: all repos -- */}
        {!deferredText && (
          <div
            className='relative cursor-default select-none py-2.5 pl-10 pr-4 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-slate-100'
            onClick={() => {
              closeWithSelection([]);
            }}
          >
                <>
                  <span
                    className={`block truncate ${
                      selectedItems.length === 0
                        ? 'font-medium'
                        : 'font-normal'
                    }`}
                  >
                    {allItem.name}
                  </span>
                  <input
                    type='checkbox'
                    checked={selectedItems.length === 0}
                    disabled={selectedItems.length === 0}
                    readOnly
                    className='absolute inset-y-0 left-0 ml-3 mt-3 h-4 w-4 rounded border-white/20 accent-[var(--selector-fill-color)]'
                  />
                </>
          </div>
        )}
        {/* -- select: all filtered repos -- */}
        {deferredText && (
          <div
            className={`relative cursor-default select-none py-2.5 pl-10 pr-4 text-sm text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-slate-100 ${
                  filteredReposMemo.length === 0
                    ? 'disabled opacity-50'
                    : ''
                }`}
                onClick={() => {
                  if (filteredReposMemo.length === 0) return;
                  if (
                    filteredReposMemo.every((i) =>
                      selectedItems.includes(i)
                    )
                  ) {
                    const result = selectedItems.filter(
                      (i) => !filteredReposMemo.includes(i)
                    );
                    setSelectedItems(result);
                    return;
                  }
                  const result = [
                    ...selectedItems,
                    ...filteredReposMemo.filter(
                      (i) => !selectedItems.includes(i)
                    ),
                  ];
                  setSelectedItems(result);
                }}
              >
                <>
                  <span
                    className={`block truncate ${
                      selectedItems.length === 0
                        ? 'font-medium'
                        : 'font-normal'
                    }`}
                  >
                    {`Select all '${deferredText}'`}
                  </span>
                  <input
                    type='checkbox'
                    checked={
                      filteredReposMemo.length > 0 &&
                      filteredReposMemo.every((i) =>
                        selectedItems.includes(i)
                      )
                    }
                    readOnly
                    className='absolute inset-y-0 left-0 ml-3 mt-3 h-4 w-4 rounded border-white/20 accent-[var(--selector-fill-color)]'
                  />
                </>
          </div>
        )}
        <div className='my-1 border-t border-white/8' />
        {/* -- list all repos -- */}
        <FixedSizeList
          height={400}
          width={384}
          itemSize={40}
          itemCount={filteredReposMemo.length}
          overscanCount={5}
        >
          {renderRow}
        </FixedSizeList>
        <div className='flex items-center justify-end gap-2 border-t border-white/8 px-3 py-3'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='text-[#9fa1ad] hover:bg-white/[0.05] hover:text-slate-100'
            onClick={() => {
              closeWithSelection(defaultSelectedItems);
            }}
          >
            Cancel
          </Button>
          <Button
            type='button'
            size='sm'
            onClick={() => {
              closeWithSelection(selectedItems);
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function HLGHOrgRepoSelector(props: {
  disabled?: boolean;
  ownerId: string | number;
  defaultSelectedIds?: number[];
  onComplete?: (items: ItemType[]) => void;
}) {
  const { ownerId, defaultSelectedIds = [], onComplete, disabled } = props;
  const [repos, setRepos] = React.useState<ItemType[] | null>(
    defaultSelectedIds.length === 0 ? [] : null
  );

  React.useEffect(() => {
    const init = async (ownerId: string | number) => {
      const repos = await getRepoListByOrgId(ownerId);
      setRepos(repos);
    };
    ownerId && init(ownerId);
  }, [ownerId]);

  return (
    <>
      {repos && (
        <HLGHOrgRepoSelectorTemplate
          disabled={!repos || disabled}
          repos={repos || []}
          maxSelected={100}
          defaultSelectedItems={
            repos?.filter((r) => defaultSelectedIds?.includes(r.id)) || []
          }
          onComplete={(items) => {
            onComplete && onComplete(items);
          }}
        />
      )}
    </>
  );
}
