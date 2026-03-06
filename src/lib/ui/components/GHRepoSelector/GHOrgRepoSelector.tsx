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
import * as SelectPrimitive from '@radix-ui/react-select';
import CheckIcon from 'bootstrap-icons/icons/check.svg';
import {
  RepoIcon,
  SearchIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@primer/octicons-react';
import { twMerge } from 'tailwind-merge';
import '../Selector/style.scss';
import { Select } from '../Selector';
import { Listbox, Transition, Popover } from '@headlessui/react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

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
    <div>
      <label
        htmlFor='repo-search'
        className='hidden text-sm font-medium leading-6 text-gray-900'
      >
        Search
      </label>
      <div className='relative m-2 rounded-md shadow-sm'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <SearchIcon className='h-5 w-5 text-gray-400' aria-hidden='true' />
        </div>
        <input
          type='text'
          name='repo-search'
          id='repo-search'
          className='block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[var(--selector-border-color)] sm:text-sm sm:leading-6'
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

  const [selectedItems, setSelectedItems] =
    React.useState<ItemType[]>(defaultSelectedItems);
  const [text, setText] = React.useState('');
  const deferredText = React.useDeferredValue(text);

  const [popoverElement, setPopoverElement] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (popoverElement === null) {
      onComplete(selectedItems);
    }
  }, [popoverElement]);

  const filteredReposMemo = React.useMemo(() => {
    return repos.filter((r) => r.name.includes(deferredText));
  }, [repos, deferredText]);

  const isMax = React.useMemo(() => {
    return selectedItems.length >= maxSelected;
  }, [selectedItems, maxSelected]);

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
        className={`relative cursor-default select-none py-2 pl-10 pr-4 text-[var(--text-color-subtitle)] text-left text-sm hover:bg-[var(--list-item-active)] hover:text-[var(--text-color-active)] ${
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
            className='absolute inset-y-0 left-0 flex items-center ml-3 mt-2.5 text-[var(--text-color-subtitle)] h-4 w-4 rounded border-gray-300 focus:ring-indigo-600 accent-[var(--selector-fill-color)]'
          />
        </>
      </div>
    );
  };

  return (
    <>
      <Popover className='relative'>
        {({ open }) => {
          return (
            <>
              <Popover.Button
                disabled={disabled}
                className='relative w-full cursor-pointer rounded-lg bg-[var(--background-color-popover)] py-2 pl-3 pr-20 text-[var(--text-color-subtitle)] text-left shadow-md border border-[var(--selector-border-color)] focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm'
              >
                <span className='block truncate w-auto lg:w-80 overflow-hidden'>
                  <RepoIcon className='mr-2' />
                  {selectedItems.length === 0 ? (
                    <>{allItem.name}</>
                  ) : (
                    selectedItems.map((i) => i.name).join(', ')
                  )}
                </span>
                <span className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2'>
                  <span className='bg-[var(--selector-fill-color)] text-white text-xs font-medium px-2 py-1 mr-2 rounded-full inline-flex items-center gap-2'>
                    {/* TODO - fix repos.length mismatch public repos sum */}
                    {/* {parseItemsLength(
                      selectedItems.length === 0
                        ? repos.length
                        : selectedItems.length
                    )} */}
                    {selectedItems.length === 0
                      ? `All`
                      : parseItemsLength(selectedItems.length)}
                  </span>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition ease-in duration-100 ${
                      open ? 'transform rotate-180' : ''
                    }`}
                    aria-hidden='true'
                  />
                </span>
              </Popover.Button>
              <Popover.Overlay className='fixed inset-0 bg-black opacity-30' />
              <Transition
                as={React.Fragment}
                enter='transition ease-out duration-200'
                enterFrom='opacity-0 translate-y-1'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-1'
              >
                <Popover.Panel
                  ref={(element) => setPopoverElement(element)}
                  className='absolute left-1/2 z-10 mt-3 w-fit max-w-sm -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl'
                >
                  <div className='overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-[var(--background-color-popover)] w-auto lg:w-[400px]'>
                    {/* -- search input -- */}
                    <SearchInput
                      autoFocus
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    {/* -- default: all repos -- */}
                    {!deferredText && (
                      <div
                        className={`relative cursor-default select-none py-2 pl-10 pr-4 text-[var(--text-color-subtitle)] text-sm hover:bg-[var(--list-item-active)] hover:text-[var(--text-color-active)]`}
                        onClick={() => {
                          setSelectedItems([]);
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
                            {/* TODO - fix repos.length mismatch public repos sum */}
                            {/* {allItem.name}({repos.length}) */}
                            {allItem.name}
                          </span>
                          <input
                            type='checkbox'
                            checked={selectedItems.length === 0}
                            disabled={selectedItems.length === 0}
                            readOnly
                            className='absolute inset-y-0 left-0 flex items-center ml-3 mt-2.5 text-[var(--text-color-subtitle)] h-4 w-4 rounded border-gray-300 focus:ring-[var(--selector-border-color)] accent-[var(--selector-fill-color)]'
                          />
                        </>
                      </div>
                    )}
                    {/* -- select: all filtered repos -- */}
                    {deferredText && (
                      <div
                        className={`relative cursor-default select-none py-2 pl-10 pr-4 text-[var(--text-color-subtitle)] text-sm hover:bg-[var(--list-item-active)] hover:text-[var(--text-color-active)] ${
                          filteredReposMemo.length === 0
                            ? 'disabled opacity-50'
                            : ''
                        }`}
                        onClick={() => {
                          // empty result, disable select all
                          if (filteredReposMemo.length === 0) return;
                          // all selected, unselect all
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
                          // partial selected, select all
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
                            className='absolute inset-y-0 left-0 flex items-center ml-3 mt-2.5 text-[var(--text-color-subtitle)] h-4 w-4 rounded border-gray-300 focus:ring-[var(--selector-border-color)] accent-[var(--selector-fill-color)]'
                          />
                        </>
                      </div>
                    )}
                    <div className='w-full my-2 border-t border-gray-300' />
                    {/* -- list all repos -- */}
                    <FixedSizeList
                      height={400}
                      width={400}
                      itemSize={36}
                      itemCount={filteredReposMemo.length}
                      overscanCount={5}
                    >
                      {renderRow}
                    </FixedSizeList>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          );
        }}
      </Popover>
    </>
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
