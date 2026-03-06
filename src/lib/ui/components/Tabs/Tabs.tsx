import * as RuiTabs from '@radix-ui/react-tabs';
import { ReactElement } from 'react';
import { TabProps } from './Tab';

export interface TabsProps extends Omit<RuiTabs.TabsProps, 'children'> {
  children: ReactElement<TabProps>[];
}

export function Tabs ({ children, ...props }: TabsProps) {
  return (
    <RuiTabs.Root defaultValue={children[0].props.value} {...props} orientation="vertical">
      <RuiTabs.TabsList className='flex gap-4 items-center'>
        {renderTabs(children)}
      </RuiTabs.TabsList>
      <div className='mt-2'>
        {renderContents(children)}
      </div>
    </RuiTabs.Root>
  );
}

function renderTabs (children: ReactElement<TabProps>[]) {
  return children.map(child => (
    <RuiTabs.Trigger key={child.key || child.props.value} value={child.props.value} className='flex px-1 py-0.5 gap-2 items-center border-b-2 border-transparent text-sm text-content data-[state=active]:text-primary data-[state=active]:border-primary transition-all'>
      {child.props.icon}
      <span>
        {child.props.title}
      </span>
    </RuiTabs.Trigger>
  ));
}

function renderContents (children: ReactElement<TabProps>[]) {
  return children.map(child => (
    <RuiTabs.Content key={child.key || child.props.value} value={child.props.value}>
      {child.props.children}
    </RuiTabs.Content>
  ));
}
