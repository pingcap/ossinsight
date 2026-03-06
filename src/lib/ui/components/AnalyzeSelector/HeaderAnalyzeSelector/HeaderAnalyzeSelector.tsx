import * as React from 'react';
import { RemoteRepoInfo } from '../../GHRepoSelector';
import { RemoteUserInfo } from '../../GHUserSelector';
import { RemoteOrgInfo } from '../../GHOrgSelector';
import SearchIcon from 'bootstrap-icons/icons/search.svg';
import {
  EyeIcon,
  OrganizationIcon,
  RepoIcon,
  PeopleIcon,
} from '@primer/octicons-react';
import { twMerge } from 'tailwind-merge';
import { useRemoteList } from '../../RemoteSelector/useRemoteList';
import {
  getUserText,
  isUserEquals,
  searchUser,
} from '../../GHUserSelector/utils';
import {
  getRepoText,
  isRepoEquals,
  searchRepo,
} from '../../GHRepoSelector/utils';
import { getOrgText, isOrgEquals, searchOrg } from '../../GHOrgSelector/utils';
import * as HUI from '@headlessui/react';

import { GHAvatar } from '../../GHAvatar';

import './style.scss';

const types: {
  name: string;
  id: 'user' | 'repo' | 'org' | 'all';
  placeholder: string;
  Icon: React.ComponentType<any>;
  endEle?: React.ReactNode;
}[] = [
  {
    name: 'All OSSInsight',
    id: 'all',
    placeholder:
      'Search for a developer / repository / organization analysis...',
    Icon: EyeIcon,
  },
  {
    name: 'User',
    id: 'user',
    placeholder: 'Enter a GitHub ID',
    Icon: PeopleIcon,
  },
  {
    name: 'Repository',
    id: 'repo',
    placeholder: 'Enter a GitHub Repo Name',
    Icon: RepoIcon,
  },
  {
    name: 'Organization',
    id: 'org',
    placeholder: 'Enter a GitHub Organization Name',
    Icon: OrganizationIcon,
    endEle: (
      <span className='bg-[#3C3C47] text-[#62E487] text-xs font-medium border border-solid border-[#376845] px-2.5 py-0.5 rounded-full'>
        New
      </span>
    ),
  },
];

const { Transition, Dialog } = HUI;

export interface HeaderAnalyzeSelectorProps {
  navigateTo?: (url: string) => void;
}

export function HeaderAnalyzeSelector(props: HeaderAnalyzeSelectorProps) {
  const { navigateTo } = props;

  const [selectedType, setSelectedType] = React.useState<
    'user' | 'org' | 'repo' | 'all'
  >('all');
  const [isOpen, setIsOpen] = React.useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleTypeChange = React.useCallback(
    (type: 'user' | 'repo' | 'org' | 'all') => {
      setSelectedType(type);
    },
    []
  );

  const handleSelectItem = React.useCallback(
    (type: 'user' | 'repo' | 'org') =>
      (item: RemoteRepoInfo | RemoteUserInfo | RemoteOrgInfo) => {
        closeModal();
        // navigateTo?.(
        //   `/analyze/${
        //     (item as RemoteRepoInfo)!.fullName ||
        //     (item as RemoteUserInfo | RemoteOrgInfo)!.login
        //   }`
        // );
        switch (type) {
          case 'user':
          case 'repo':
            navigateTo?.(
              `https://ossinsight.io/analyze/${
                (item as RemoteRepoInfo)!.fullName ||
                (item as RemoteUserInfo | RemoteOrgInfo)!.login
              }`
            );
            break;
          case 'org':
            navigateTo?.(`/analyze/${(item as RemoteOrgInfo)!.login}`);
            break;
        }
      },
    [selectedType, navigateTo]
  );

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === '/') {
        openModal();
        // event.preventDefault();
      } else if (event.key === 'Escape') {
        closeModal();
        event.preventDefault();
      }
    };
    document.addEventListener('keypress', handleKeyPress);
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, []);

  return (
    <>
      <button
        type='button'
        onClick={openModal}
        className='inline-flex items-center gap-2 w-full max-w-[12rem] rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-[var(--border-color-default)] whitespace-nowrap'
      >
        <SearchIcon />
        Search ...
        <span className='kbd kbd-sm ml-auto'>/</span>
        {/* Type <span className='kbd kbd-sm'>/</span> to search */}
      </button>

      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto bg-slate-900/25 backdrop-blur'>
            <div className='flex min-h-full justify-center p-4 text-center'>
              <Transition.Child
                as={React.Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-3xl transform overflow-hidden rounded-2xl bg-[var(--background-color-popover)] text-left align-middle shadow-xl transition-all flex flex-col'>
                  <div className='p-6'>
                    <div className='block'>
                      <SelectTabs
                        selectedType={selectedType}
                        onChange={handleTypeChange}
                      />
                    </div>
                  </div>
                  <div className='px-6'>
                    {selectedType === 'all' && (
                      <CombinedSearch
                        handleSelectUser={handleSelectItem('user')}
                        handleSelectOrg={handleSelectItem('org')}
                        handleSelectRepo={handleSelectItem('repo')}
                      />
                    )}
                    {selectedType === 'user' && (
                      <UserSearch handleSelectItem={handleSelectItem('user')} />
                    )}
                    {selectedType === 'repo' && (
                      <RepoSearch handleSelectItem={handleSelectItem('repo')} />
                    )}
                    {selectedType === 'org' && (
                      <OrgSearch handleSelectItem={handleSelectItem('org')} />
                    )}
                  </div>
                  <BottomTips />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

const SelectTabs = (props: {
  selectedType: 'user' | 'repo' | 'org' | 'all';
  onChange: (type: 'user' | 'repo' | 'org' | 'all') => void;
}) => {
  const { selectedType, onChange: handleTypeChange } = props;

  return (
    <>
      <nav className='flex space-x-4' aria-label='Tabs'>
        {types.map((tab) => (
          <div
            key={tab.id}
            className={twMerge(
              tab.id === selectedType
                ? 'bg-[var(--list-item-active)] text-[var(--color-primary)]'
                : 'hover:text-[var(--text-color-active)]',
              'rounded-md px-3 py-2 text-sm font-medium cursor-pointer inline-flex gap-2 items-center'
            )}
            tabIndex={tab.id === selectedType ? -1 : 0}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleTypeChange(tab.id as any);
              }
            }}
            onClick={() => handleTypeChange(tab.id as any)}
          >
            <tab.Icon className='w-5 h-5' />
            {tab.name}
            {tab?.endEle}
          </div>
        ))}
      </nav>
    </>
  );
};

const BottomTips = () => {
  return (
    <div className='mt-auto flex items-center gap-2 px-6 py-2 bg-[#212127] cursor-default select-none'>
      <div className='inline-flex items-center gap-2'>
        <span className='kbd kbd-sm'>TAB</span>
        <span className='kbd kbd-sm'>▲</span>
        <span className='kbd kbd-sm'>▼</span>
        To Navigation
      </div>
      <div className='inline-flex items-center gap-2'>
        <span className='kbd kbd-sm'>ESC</span>
        To Close
      </div>
      <div className='inline-flex items-center gap-2'>
        <span className='kbd kbd-sm'>↵</span>
        To Enter
      </div>
    </div>
  );
};

const CommonInput = (props: {
  placeholder: string;
  handleInputValueChange: (value: string) => void;
}) => {
  const { placeholder, handleInputValueChange } = props;

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const inputCurrent = inputRef.current;
    inputCurrent?.focus();
  }, []);

  React.useEffect(() => {
    const handleSlash = (event: KeyboardEvent) => {
      if (event.key === '/') {
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleSlash);
    return () => {
      document.removeEventListener('keydown', handleSlash);
    };
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        type='text'
        name='header-search'
        id='header-search'
        className='block w-full rounded-md border-0 p-1.5 text-[var(--text-color-active)] shadow-sm ring-1 ring-inset ring-gray-300 bg-[var(--background-color-control)] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
        placeholder={placeholder}
        autoFocus
        onChange={(event) => {
          handleInputValueChange(event.target.value || '');
        }}
      />
    </>
  );
};

function CommonResultList<T extends { id: string | number }>(props: {
  loading: boolean;
  error: any;
  items: T[];
  getAvatarName: (item: T) => string;
  renderLabel: (item: T) => string | React.ReactNode;
  handleSelectItem?: (item: T) => void;
  className?: string;
  id?: string;
}) {
  const {
    loading,
    error,
    items,
    getAvatarName,
    renderLabel,
    handleSelectItem,
    className,
    id,
  } = props;

  return (
    <>
      <ul role='list' className={twMerge('mt-4 space-y-1', className)} id={id}>
        {loading && (
          <li className='py-4 px-2 text-disabled text-xs'>Loading...</li>
        )}
        {!loading && error && (
          <li className='py-4 px-2 text-disabled text-xs'>Failed to load</li>
        )}
        {!loading && !error && !items.length && (
          <li className='py-4 px-2 text-disabled text-xs'>Empty result</li>
        )}
        {items.map((item) => (
          <li
            tabIndex={0}
            key={item.id}
            className='group overflow-hidden rounded-md px-4 py-2 text-sm focus:bg-[var(--list-item-active)] focus:text-[var(--text-color-active)] hover:bg-[var(--list-item-active)] hover:text-[var(--text-color-active)] cursor-pointer'
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSelectItem?.(item);
              }
            }}
            onClick={() => {
              handleSelectItem?.(item);
            }}
          >
            <div className='inline-flex gap-2 items-center w-full'>
              <GHAvatar name={getAvatarName(item)} size={6} />
              {renderLabel(item)}
              <span className='hidden ml-auto group-focus:block'>
                <span className='kbd kbd-sm'>↵</span> Go
              </span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function CommonSearch<T extends { id: string | number }>(props: {
  placeholder: string;
  handleInputValueChange: (value: string) => void;
  loading: boolean;
  error: any;
  items: T[];
  getAvatarName: (item: T) => string;
  renderLabel: (item: T) => string | React.ReactNode;
  handleSelectItem?: (item: T) => void;
  className?: string;
}) {
  const { placeholder, handleInputValueChange, ...rest } = props;

  React.useEffect(() => {
    const handleKeyUpDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const focusElem = document.querySelector(':focus');
      const tabElements = [
        ...(document.querySelectorAll('#analyze-selector-results > li') as any),
      ];
      const tabElementsCount = tabElements.length - 1;
      if (!tabElements.includes(focusElem)) return;
      e.preventDefault();
      const focusIndex = tabElements.indexOf(focusElem);
      let elemToFocus;
      if (e.key === 'ArrowUp')
        elemToFocus =
          tabElements[focusIndex > 0 ? focusIndex - 1 : tabElementsCount];
      if (e.key === 'ArrowDown')
        elemToFocus =
          tabElements[focusIndex < tabElementsCount ? focusIndex + 1 : 0];
      elemToFocus.focus();
    };
    document.addEventListener('keydown', handleKeyUpDown);
    return () => {
      document.removeEventListener('keydown', handleKeyUpDown);
    };
  }, [rest.items]);

  return (
    <>
      <CommonInput
        placeholder={placeholder}
        handleInputValueChange={handleInputValueChange}
      />
      <CommonResultList id='analyze-selector-results' {...rest} />
    </>
  );
}

function UserSearch(props: {
  handleSelectItem?: (item: RemoteUserInfo) => void;
}) {
  const { handleSelectItem } = props;

  const { items, reload, error, loading } = useRemoteList<RemoteUserInfo>({
    getRemoteOptions: searchUser,
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      reload(value);
    },
    [reload]
  );

  const renderLabel = React.useCallback(
    (item: RemoteUserInfo) => item.login,
    []
  );

  React.useEffect(() => {
    reload('recommend-user-list-keyword');
  }, []);

  return (
    <CommonSearch
      placeholder='Enter a GitHub ID'
      handleInputValueChange={handleInputValueChange}
      loading={loading}
      error={error}
      items={items}
      getAvatarName={renderLabel}
      renderLabel={renderLabel}
      handleSelectItem={handleSelectItem}
    />
  );
}

function RepoSearch(props: {
  handleSelectItem?: (item: RemoteRepoInfo) => void;
}) {
  const { handleSelectItem } = props;

  const { items, reload, error, loading } = useRemoteList<RemoteRepoInfo>({
    getRemoteOptions: searchRepo,
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      reload(value);
    },
    [reload]
  );

  const renderLabel = React.useCallback(
    (item: RemoteRepoInfo) => item.fullName,
    []
  );

  React.useEffect(() => {
    reload('recommend-repo-list-1-keyword');
  }, []);

  if (error) {
    console.error(error);
  }

  return (
    <CommonSearch
      placeholder='Enter a GitHub Repo Name'
      handleInputValueChange={handleInputValueChange}
      loading={loading}
      error={error}
      items={items}
      getAvatarName={renderLabel}
      renderLabel={renderLabel}
      handleSelectItem={handleSelectItem}
    />
  );
}

function OrgSearch(
  props: { handleSelectItem?: (item: RemoteOrgInfo) => void } = {}
) {
  const { handleSelectItem } = props;

  const { items, reload, error, loading } = useRemoteList<RemoteOrgInfo>({
    getRemoteOptions: searchOrg,
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      reload(value);
    },
    [reload]
  );

  const renderLabel = React.useCallback(
    (item: RemoteOrgInfo) => item.login,
    []
  );

  React.useEffect(() => {
    reload('recommend-org-list-keyword');
  }, []);

  return (
    <CommonSearch
      placeholder='Enter a GitHub Organization Name'
      handleInputValueChange={handleInputValueChange}
      loading={loading}
      error={error}
      items={items}
      getAvatarName={renderLabel}
      renderLabel={renderLabel}
      handleSelectItem={handleSelectItem}
    />
  );
}

function CombinedSearch(props: {
  handleSelectOrg?: (item: RemoteOrgInfo) => void;
  handleSelectRepo?: (item: RemoteRepoInfo) => void;
  handleSelectUser?: (item: RemoteUserInfo) => void;
  limit?: number;
}) {
  const {
    handleSelectOrg,
    handleSelectRepo,
    handleSelectUser,
    limit = 4,
  } = props;

  const {
    items: orgItems,
    reload: orgReload,
    error: orgError,
    loading: orgLoading,
  } = useRemoteList<RemoteOrgInfo>({
    getRemoteOptions: searchOrg,
  });
  const {
    items: repoItems,
    reload: repoReload,
    error: repoError,
    loading: repoLoading,
  } = useRemoteList<RemoteRepoInfo>({
    getRemoteOptions: searchRepo,
  });
  const {
    items: userItems,
    reload: userReload,
    error: userError,
    loading: userLoading,
  } = useRemoteList<RemoteUserInfo>({
    getRemoteOptions: searchUser,
  });

  const handleInputValueChange = React.useCallback(
    (value: string) => {
      orgReload(value);
      repoReload(value);
      userReload(value);
    },
    [orgReload, repoReload, userReload]
  );

  const renderUserOrgLabel = React.useCallback(
    (item: RemoteOrgInfo | RemoteUserInfo) => item.login,
    []
  );

  const renderRepoLabel = React.useCallback(
    (item: RemoteRepoInfo) => item.fullName,
    []
  );

  React.useEffect(() => {
    const handleKeyUpDown = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      const focusElem = document.querySelector(':focus');
      const tabElements = [
        ...(document.querySelectorAll(
          '#analyze-selector-results-all li'
        ) as any),
      ];
      const tabElementsCount = tabElements.length - 1;
      if (!tabElements.includes(focusElem)) return;
      e.preventDefault();
      e.stopPropagation();
      const focusIndex = tabElements.indexOf(focusElem);
      let elemToFocus;
      if (e.key === 'ArrowUp')
        elemToFocus =
          tabElements[focusIndex > 0 ? focusIndex - 1 : tabElementsCount];
      if (e.key === 'ArrowDown')
        elemToFocus =
          tabElements[focusIndex < tabElementsCount ? focusIndex + 1 : 0];
      elemToFocus.focus();
    };
    document.addEventListener('keydown', handleKeyUpDown);
    return () => {
      document.removeEventListener('keydown', handleKeyUpDown);
    };
  }, [repoItems, orgItems, userItems]);

  React.useEffect(() => {
    // search on mount
    orgReload('recommend-org-list-keyword');
    repoReload('recommend-repo-list-1-keyword');
    userReload('recommend-user-list-keyword');
  }, []);

  return (
    <>
      <CommonInput
        placeholder={types[0].placeholder}
        handleInputValueChange={handleInputValueChange}
      />
      <div id='analyze-selector-results-all'>
        <div className='border-b border-[var(--divide-color-default)] mt-4'>
          <label className='text-sm	font-semibold'>Developer</label>
          <CommonResultList
            loading={userLoading}
            error={userError}
            items={userItems.slice(0, limit)}
            getAvatarName={renderUserOrgLabel}
            renderLabel={renderUserOrgLabel}
            handleSelectItem={handleSelectUser}
            className='mt-0'
          />
        </div>
        <div className='border-b border-[var(--divide-color-default)] mt-4'>
          <label className='text-sm	font-semibold'>Repository</label>
          <CommonResultList
            loading={repoLoading}
            error={repoError}
            items={repoItems.slice(0, limit)}
            getAvatarName={renderRepoLabel}
            renderLabel={renderRepoLabel}
            handleSelectItem={handleSelectRepo}
            className='mt-0'
          />
        </div>
        <div className='mt-4'>
          <label className='text-sm	font-semibold'>Organization</label>
          <CommonResultList
            loading={orgLoading}
            error={orgError}
            items={orgItems.slice(0, limit)}
            getAvatarName={renderUserOrgLabel}
            renderLabel={renderUserOrgLabel}
            handleSelectItem={handleSelectOrg}
            className='mt-0'
          />
        </div>
      </div>
    </>
  );
}
