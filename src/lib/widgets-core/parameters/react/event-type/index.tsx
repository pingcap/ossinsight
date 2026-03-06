import { EventTypeSelector } from '@/lib/ui/components/Selector/EventTypeSelector';
import { useCallback } from 'react';

export function EventTypeInput ({ id, enums, value, onValueChange }: { id: string, enums?: string[], value: string, onValueChange: (newValue: string) => void }) {
  const handleEventTypeChange = useCallback((eventType: string) => {
    onValueChange(eventType);
  }, []);

  return (
    <EventTypeSelector
      id={id}
      enums={enums}
      onValueChange={handleEventTypeChange}
      defaultValue={value}
    />
  );
}
