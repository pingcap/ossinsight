// import SearchIcon from 'bootstrap-icons/icons/search.svg';
// import { ChangeEvent, useState } from 'react';
// import { useDebouncedCallback } from '../../hooks/useDebouncedCallback';
import { Tag } from '../Tag';

export type WidgetsFilterConfig = {
  tag: string | undefined
  search: string
}

export interface WidgetsFilterProps {
  availableTags: string[];
  config: WidgetsFilterConfig;
  onConfigChange: (config: WidgetsFilterConfig) => void;
}

export function WidgetsFilter (props: WidgetsFilterProps) {
  const { config, onConfigChange } = props;
  // const [search, setSearch] = useState(props.config.search);

  // const debouncedOnConfigChange = useDebouncedCallback(onConfigChange, { timeout: 400 });
  // const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setSearch(event.target.value);
  //   debouncedOnConfigChange({
  //     ...config,
  //     search: event.target.value,
  //   });
  // };

  const makeHandleSelect = (tag: string) => {
    return () => {
      if (tag === '🔥Popular') {
        onConfigChange({ ...config, tag: undefined });
      } else {
        onConfigChange({ ...config, tag });
      }
    };
  };

  const isSelected = (tag: string) => {
    if (tag === config.tag) {
      return true;
    } else if (tag === '🔥Popular' && config.tag == null) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className="rounded-2xl py-4 mt-20">
      <div className="space-y-4 lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {['🔥Popular', 'All'].concat(props.availableTags).map((tag, index) => (
            <Tag key={tag} shape="contained" size="lg" selected={isSelected(tag)} onSelected={makeHandleSelect(tag)}>
              {tag}
            </Tag>
          ))}
        </div>
        {/*<label className="w-full lg:max-w-xs lg:min-w-min flex-1 flex items-center gap-1 TextInput TextInput-lg TextInput-borderless">*/}
        {/*  <SearchIcon className="text-disabled max-w-max min-w-max" width={14} height={14} />*/}
        {/*  <input className="flex-1" value={search} onChange={handleSearchChange} placeholder="Search" />*/}
        {/*</label>*/}
      </div>
    </div>
  );
}