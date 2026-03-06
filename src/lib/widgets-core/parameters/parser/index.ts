import { ExtractParameterType, ParameterDefinition, ParameterDefinitionMap, ParameterDefinitions } from '@ossinsight/widgets-types';
import parseActivityType from './activity-type';
import parseCollectionId from './collection-id';
import parseDate from './date';
import parseEventType from './event-type';
import parseRepoId, { parseRepoIds } from './repo-id';
import * as parseTime from './time';
import parseUserId from './user-id';
import parseOwnerId from './owner-id';

type Parsers = {
  [K in keyof ParameterDefinitionMap]: (value: any, config: ParameterDefinitionMap[K]) => ExtractParameterType<ParameterDefinitionMap[K]>
}

const parsers: Parsers = {
  'repo-id': parseRepoId,
  'user-id': parseUserId,
  'owner-id': parseOwnerId,
  'time-zone': parseTime.parseTimeZone,
  'time-period': parseTime.parseTimePeriod,
  'activity-type': parseActivityType,
  'collection-id': parseCollectionId,
  'event-type': parseEventType,
  'limit': parseUserId,
  'day': parseDate,
  'month': parseDate,
  'repo-ids': parseRepoIds,
};

export default parsers;
