import { Meta, StoryObj } from '@storybook/react';
import { EventTypeSelector } from './EventTypeSelector';
import {
  Select as SlectComponent,
  SelectItem,
  SelectGroup,
  SelectSeparator,
} from './Select';
import { TimeZoneSelector } from './TimeZoneSelector';
import { TimePeriodSelector } from './TimePeriodSelector';
import { ActivityTypeSelector } from './ActivityTypeSelector';

function Select(props: any) {
  const { useSimpleSelect = false, children, ...rest } = props;

  if (useSimpleSelect) {
    return <>{children}</>;
  }

  return <SlectComponent {...rest}>{children}</SlectComponent>;
}

export default {
  title: 'Components/Selector',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof SlectComponent>;

export const Default = {
  args: {
    defaultValue: 'banana',
    label: 'custom label',
    children: [
      <SelectGroup label='Fruits'>
        <SelectItem key='apple' value='apple'>
          Apple
        </SelectItem>
        <SelectItem key='banana' value='banana'>
          Banana
        </SelectItem>
        <SelectItem key='blueberry' value='blueberry'>
          Blueberry
        </SelectItem>
        <SelectItem key='grapes' value='grapes'>
          Grapes
        </SelectItem>
        <SelectItem key='pineapple' value='pineapple'>
          Pineapple
        </SelectItem>
      </SelectGroup>,
      <SelectSeparator key='s-1' className='SelectSeparator' />,
      <SelectItem key='1' value='1'>
        Item 1
      </SelectItem>,
      <SelectItem key='2' value='2' disabled>
        Item 2(disabled)
      </SelectItem>,
      <SelectItem value='3'>Item 3</SelectItem>,
    ],
  },
} satisfies StoryObj<typeof Select>;

// export const TimeZone = {
//   args: {
//     useSimpleSelect: true,
//     children: [<TimeZoneSelector showLabel />],
//   },
// } satisfies StoryObj<any>;

// export const TimePeriod = {
//   args: {
//     useSimpleSelect: true,
//     children: [<TimePeriodSelector showLabel />],
//   },
// } satisfies StoryObj<any>;

// export const ActivityType = {
//   args: {
//     useSimpleSelect: true,
//     children: [<ActivityTypeSelector showLabel />],
//   },
// } satisfies StoryObj<any>;

// export const EventType = {
//   args: {
//     useSimpleSelect: true,
//     children: [<EventTypeSelector showLabel/>]
//   }
// } satisfies StoryObj<any>