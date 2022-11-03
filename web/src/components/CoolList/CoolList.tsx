import React, { ForwardedRef, forwardRef, useCallback, useEffect, useState } from 'react';
import { ListProps } from '@mui/material/List';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { notNullish } from '@site/src/utils/value';

import { List, ListItem, styled } from '@mui/material';

export interface CoolListProps<T> extends Omit<ListProps, 'children' | 'ref'> {
  maxLength: number;
  itemHeight: number;
  getKey: (item: T) => string | number;
  children: (item: T) => JSX.Element;
}

export interface CoolListInstance<T> {
  add: (item: T) => any;
}

const CoolListContainer = styled(List)({
  position: 'relative',
  padding: 0,
});

const CoolListItem = styled(ListItem)({
  position: 'absolute',
  width: '100%',
  paddingLeft: 0,
  transition: 'all .5s ease',
  opacity: 0.4,
  '&.item-enter': {
    opacity: 0,
    transform: 'translate3d(-10%, 0, 0) scale(0.85)',
  },
  '&.item-enter-active': {
    opacity: 0.4,
    transform: 'none',
  },
  '&.item-exit': {
    opacity: 0.4,
    transform: 'none',
  },
  '&.item-exit-active': {
    opacity: 0,
    transform: 'translate3d(-10%, 0, 0) scale(0.85)',
  },
  '&:hover': {
    opacity: 1,
  },
});

function CoolList<T> ({ maxLength, itemHeight, getKey, children, ...props }: CoolListProps<T>, ref: ForwardedRef<CoolListInstance<T>>) {
  const [list, setList] = useState<T[]>([]);

  const add = useCallback((item: T) => {
    setList(list => {
      if (list.length === maxLength) {
        return [item].concat(list.slice(0, maxLength - 1));
      } else {
        return [item].concat(list);
      }
    });
  }, [maxLength]);

  useEffect(() => {
    const instance = {
      add,
    };
    if (notNullish(ref)) {
      if (typeof ref === 'function') {
        ref(instance);
      } else {
        ref.current = instance;
      }
    }
  }, []);

  return (
    <TransitionGroup component={CoolListContainer} {...props} sx={{ height: itemHeight * maxLength }}>
      {list.map((item, index) => (
        <CSSTransition key={getKey(item)} timeout={500} classNames="item">
          <CoolListItem sx={{ top: index * itemHeight, height: itemHeight }}>
            {children(item)}
          </CoolListItem>
        </CSSTransition>
      ))}
    </TransitionGroup>
  );
}

export default forwardRef(CoolList);
