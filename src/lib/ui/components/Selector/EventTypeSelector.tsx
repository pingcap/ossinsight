import { EVENT_TYPE_OPTIONS, EventTypeOption } from '@/lib/widgets-utils/ui/event-types';
import * as React from 'react';
import { useMemo } from 'react';
import { useSimpleSelect } from './Select';

export interface EventTypeSelectorProps {
  id?: string
  onValueChange?: (newValue: string) => void;
  enums?: string[];
  showLabel?: boolean;
  defaultValue?: string;
}

export function EventTypeSelector (props: EventTypeSelectorProps) {
  const { onValueChange, id, defaultValue = 0 } = props;

  const options = useMemo(() => {
    if (props.enums) {
      return props.enums.map(key => EVENT_TYPE_OPTIONS.find(op => op.key === key)).filter(Boolean) as EventTypeOption[];
    }
    return EVENT_TYPE_OPTIONS;
  }, [props.enums]);

  const { select: eventTypeSelect, value: eventType } = useSimpleSelect(
    options,
    options.find((i) => i.key === defaultValue) ||
    options[0],
    id,
  );

  React.useEffect(() => {
    onValueChange && onValueChange(eventType);
  }, [eventType]);

  return <>{eventTypeSelect}</>;
}