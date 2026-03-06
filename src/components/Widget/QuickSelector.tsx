import { WidgetTitle } from '@/components/Widget/Title';
import { Select, SelectItem } from '@/lib/ui';

export function QuickSelector ({ widgets, widget, setWidget }: { widgets: string[], widget: string | undefined, setWidget (widget: string | undefined): void }) {
  return (
    <Select
      id="widget-selector"
      value={widget}
      onValueChange={setWidget}
      placeholder="Select a widget..."
      position="popper"
      renderValue={widget => (
        <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
                <WidgetTitle widget={widget} />
              </span>
      )}
    >
      {widgets.map(widget => (
        <SelectItem value={widget} key={widget}>
          <span className="whitespace-nowrap overflow-hidden overflow-ellipsis">
            <WidgetTitle widget={widget} />
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}