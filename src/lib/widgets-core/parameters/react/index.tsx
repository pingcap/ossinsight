import { ActivityTypeSelector } from '@/lib/ui/components/Selector/ActivityTypeSelector';
import { EventTypeSelector } from '@/lib/ui/components/Selector/EventTypeSelector';
import { ExtractParameterType, ParameterDefinition, ParameterDefinitionMap } from '@ossinsight/widgets-types';
import { ReactElement } from 'react';
import { CollectionIdInput } from './collection-id';
import { LimitInput } from './limit';
import { RepoIdInput, RepoIdsInput } from './repo-id';
import { TimePeriodSelect, TimeZoneSelect } from './time';
import { UserIdInput } from './user-id';
import { OrgIdInput } from './org-id';

type ComponentMap = Partial<{
  [K in keyof ParameterDefinitionMap]: (props: {
    id: string,
    value: ExtractParameterType<ParameterDefinitionMap[K]>,
    onValueChange: (_: ExtractParameterType<ParameterDefinitionMap[K]> | undefined) => void
  }) => ReactElement
}>

const types: ComponentMap = {
  'repo-id': RepoIdInput,
  'user-id': UserIdInput,
  'owner-id': OrgIdInput,
  'collection-id': CollectionIdInput,
  'time-period': TimePeriodSelect,
  'time-zone': TimeZoneSelect,
  'activity-type': ActivityTypeSelector,
  'event-type': EventTypeSelector,
  'limit': LimitInput,
  'repo-ids': RepoIdsInput,
};

export function ParamInput ({ id, config, value, onValueChange, ownerId }: {
  id: string,
  config: ParameterDefinition,
  value: any,
  onValueChange: (value: any) => void,
  ownerId?: number | null,
}) {
  const Component = types[config.type];
  if (!Component) {
    // throw new Error(`Parameter type ${config.type} not supported.`);
    return <span>{value}</span>;
  }

  const otherProps: any = {
    id,
    ownerId,
  };
  if ('enums' in config) {
    otherProps.enums = config.enums;
  }

  return <Component value={value} onValueChange={onValueChange} {...otherProps} />;
}
